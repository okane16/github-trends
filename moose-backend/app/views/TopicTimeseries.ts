import { RepoStarEventV2 } from "../index";
import {
  sql,
  MaterializedView,
  ClickHouseEngines,
  Aggregated,
} from "@514labs/moose-lib";

const rsTable = RepoStarEventV2.table!;
const rs = rsTable.columns;

const query = sql`
                SELECT
                    toStartOfFifteenMinutes(${rs.createdAt}) AS time,
                    arrayJoin(${rs.repoTopics!}) AS topic,
                    uniqExactState(${rs.eventId}) AS totalEvents,
                    uniqExactState(${rs.repoId}) AS uniqueReposCount,
                    uniqExactState(${rs.actorId}) AS uniqueUsersCount
                FROM ${rsTable}
                WHERE length(${rs.repoTopics!}) > 0
                GROUP BY time, topic
                `;

const TopicMV = new MaterializedView<{
  time: Date;
  topic: string;
  totalEvents: number & Aggregated<"uniqExact", [string]>;
  uniqueReposCount: number & Aggregated<"uniqExact", [number]>;
  uniqueUsersCount: number & Aggregated<"uniqExact", [number]>;
}>({
  selectStatement: query,
  selectTables: [rsTable],
  tableName: "TopicTimeseries",
  materializedViewName: "TopicTimeseriesMV",
  engine: ClickHouseEngines.AggregatingMergeTree,
  orderByFields: ["time", "topic"],
});

export default TopicMV;
