import LatestRepoStateMV from "./LatestRepoStateMV";
import {
  sql,
  MaterializedView,
  ClickHouseEngines,
  Aggregated,
} from "@514labs/moose-lib";

const lrsTable = LatestRepoStateMV.table!;
const lrs = lrsTable.columns;

const query = sql`
  SELECT
    topic,
    uniqExactState(repoFullName) AS totalRepos,
    sumState(maxStars) AS totalStars,
    avgState(maxStars) AS avgStars,
    sumState(starEvents) AS starEvents,
    sumState(uniqueStargazers) AS uniqueStargazers,
    topKState(3)(repoLanguage) AS topLanguages,
    topKState(3)(repoFullName) AS exampleRepos
  FROM RepoMaxStars
  GROUP BY topic
`;

const TopicClustersMV = new MaterializedView<{
  topic: string;
  totalRepos: number & Aggregated<"uniqExact", [string]>;
  totalStars: number & Aggregated<"sum", [number]>;
  avgStars: number & Aggregated<"avg", [number]>;
  starEvents: number & Aggregated<"count", []>;
  uniqueStargazers: number & Aggregated<"uniqExact", [number]>;
  topLanguages: string[] & Aggregated<"topK", [string]>;
  exampleRepos: string[] & Aggregated<"topK", [string]>;
}>({
  selectStatement: query,
  selectTables: [rsTable],
  tableName: "TopicClusters",
  materializedViewName: "TopicClustersMV",
  engine: ClickHouseEngines.AggregatingMergeTree,
  orderByFields: ["topic"],
});

export default TopicClustersMV;
