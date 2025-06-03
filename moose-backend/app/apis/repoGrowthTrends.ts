import { RepoStarEventV2 } from "./../index";
import { ConsumptionApi, ConsumptionUtil } from "@514labs/moose-lib";
import { tags } from "typia";

interface QueryParams {
  interval?: "hour" | "day" | "week"; // time interval for grouping
  limit?: number & tags.Minimum<1> & tags.Type<"int32">; // number of top repos to track
  minStars?: number & tags.Minimum<0> & tags.Type<"int32">; // minimum star count filter
  days?: number & tags.Minimum<1> & tags.Type<"int32">; // number of days to look back
}

interface RepoGrowthPoint {
  time: string;
  repoFullName: string;
  repoStars: number;
  starEvents: number;
  uniqueStargazers: number;
  cumulativeStarEvents: number;
}

export default new ConsumptionApi<QueryParams, RepoGrowthPoint[]>(
  "repoGrowthTrends",
  async (
    { interval = "day", limit = 10, minStars = 5000, days = 30 }: QueryParams,
    { client, sql }: ConsumptionUtil
  ) => {
    const RepoStar = RepoStarEventV2.table!;
    const cols = RepoStar.columns;

    const intervalMap = {
      hour: sql`toStartOfHour(${cols.createdAt})`,
      day: sql`toStartOfDay(${cols.createdAt})`,
      week: sql`toStartOfWeek(${cols.createdAt})`,
    };

    const query = sql`
      WITH TopRepos AS (
          SELECT ${cols.repoFullName} as repoFullName
          FROM ${RepoStar}
          WHERE ${cols.repoStars} >= ${minStars}
              AND ${cols.createdAt} >= now() - INTERVAL ${days} DAY
          GROUP BY ${cols.repoFullName}
          ORDER BY max(${cols.repoStars}) DESC
          LIMIT ${limit}
      ),
      GrowthData AS (
          SELECT 
              ${intervalMap[interval]} as time,
              r.${cols.repoFullName} as repoFullName,
              max(r.${cols.repoStars}) as repoStars,
              count(*) as starEvents,
              uniqExact(r.${cols.actorId}) as uniqueStargazers
          FROM ${RepoStar} r
          INNER JOIN TopRepos t ON r.${cols.repoFullName} = t.repoFullName
          WHERE r.${cols.createdAt} >= now() - INTERVAL ${days} DAY
          GROUP BY time, r.${cols.repoFullName}
      )
      SELECT 
          time,
          repoFullName,
          repoStars,
          starEvents,
          uniqueStargazers,
          sum(starEvents) OVER (
              PARTITION BY repoFullName 
              ORDER BY time 
              ROWS UNBOUNDED PRECEDING
          ) as cumulativeStarEvents
      FROM GrowthData
      ORDER BY repoFullName, time
    `;

    const resultSet = await client.query.execute<RepoGrowthPoint>(query);
    return await resultSet.json();
  }
);
