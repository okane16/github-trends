import { RepoStarEventV2 } from "./../index";
import { ConsumptionApi, ConsumptionUtil } from "@514labs/moose-lib";
import { tags } from "typia";
import TopicMV from "../views/TopicTimeseries";

interface QueryParams {
  interval?: "minute" | "hour" | "day";
  limit?: number & tags.Minimum<1> & tags.Type<"int32">;
  exclude?: string & tags.Pattern<"^([^,]+)(,[^,]+)*$">; // comma separated list of tags to exclude
}

interface TopicStats {
  topic: string;
  eventCount: number;
  uniqueRepos: number;
  uniqueUsers: number;
}

interface ResponseBody {
  time: string;
  topicStats: TopicStats[];
}

export default new ConsumptionApi<QueryParams, ResponseBody[]>(
  "topicTimeseries",
  async (
    { interval = "minute", limit = 10, exclude = "" }: QueryParams,
    { client, sql }: ConsumptionUtil
  ) => {
    const topicMv = TopicMV.targetTable!;
    const cols = topicMv.columns;

    const intervalMap = {
      hour: {
        select: sql`toStartOfHour(${cols.time})`,
        groupBy: sql`GROUP BY time, topic`,
        orderBy: sql`ORDER BY time, totalEvents DESC`,
        limit: sql`LIMIT ${limit} BY time`,
      },
      day: {
        select: sql`toStartOfDay(${cols.time})`,
        groupBy: sql`GROUP BY time, topic`,
        orderBy: sql`ORDER BY time, totalEvents DESC`,
        limit: sql`LIMIT ${limit} BY time`,
      },
      minute: {
        select: sql`toStartOfFifteenMinutes(${cols.time})`,
        groupBy: sql`GROUP BY time, topic`,
        orderBy: sql`ORDER BY time, totalEvents DESC`,
        limit: sql`LIMIT ${limit} BY time`,
      },
    };

    const query = sql`
    WITH rollup AS (
      SELECT ${intervalMap[interval].select} AS time,
      ${cols.topic} AS topic,
      ${cols.totalEvents} AS totalEvents,
      ${cols.uniqueReposCount} AS uniqueReposCount,
      ${cols.uniqueUsersCount} AS uniqueUsersCount
      FROM ${topicMv}
      ${exclude ? sql`WHERE ${cols.topic} NOT IN (${exclude})` : sql``}
      ${intervalMap[interval].groupBy}
      ${intervalMap[interval].orderBy}
      ${intervalMap[interval].limit}
    )
    SELECT time,
    arrayMap(
        (topic, events, repos, users) -> map(
            'topic', topic,
            'eventCount', toString(events),
            'uniqueRepos', toString(repos),
            'uniqueUsers', toString(users)
        ),
        groupArray(topic),
        groupArray(totalEvents),
        groupArray(uniqueReposCount),
        groupArray(uniqueUsersCount)
    ) AS topicStats
    FROM rollup
    GROUP BY time
    ORDER BY time
    `;

    const resultSet = await client.query.execute<ResponseBody>(query);
    return await resultSet.json();
  }
);
