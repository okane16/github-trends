import { RequestOpts } from "./../../../dashboard/generated-client/src/runtime";
import { RepoStarEventV2 } from "../ingest/models";
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
    ${rs.repoId} AS repoId,
    maxState(${rs.repoName}) AS repoName,
    anyState(${rs.repoDescription}) AS repoDescription,
    anyState(${rs.repoTopics}) AS repoTopics,
    anyState(${rs.repoLanguage}) AS repoLanguage,
    maxState(${rs.repoStars}) AS repoStars,
    anyState(${rs.repoForks}) AS repoForks,
    anyState(${rs.repoWatchers}) AS repoWatchers,
    anyState(${rs.repoOpenIssues}) AS repoOpenIssues,
    anyState(${rs.repoCreatedAt}) AS repoCreatedAt,
    anyState(${rs.repoOwnerLogin}) AS repoOwnerLogin,
    anyState(${rs.repoOwnerId}) AS repoOwnerId,
    anyState(${rs.repoOwnerUrl}) AS repoOwnerUrl,
    anyState(${rs.repoOwnerAvatarUrl}) AS repoOwnerAvatarUrl,
    anyState(${rs.repoOwnerType}) AS repoOwnerType,
    anyState(${rs.repoOrgId}) AS repoOrgId,
    anyState(${rs.repoOrgUrl}) AS repoOrgUrl,
    anyState(${rs.repoOrgLogin}) AS repoOrgLogin,
    anyState(${rs.repoHomepage}) AS repoHomepage,
    maxState(${rs.createdAt}) AS lastSeenAt,
    uniqExactState(${rs.eventId}) AS totalStarEvents,
    uniqExactState(${rs.actorId}) AS uniqueStargazers
  FROM ${rsTable}
  WHERE length(${rs.repoTopics}) > 0 
    AND ${rs.repoLanguage} != ''
    AND ${rs.repoStars} > 0
  GROUP BY ${rs.repoFullName}
`;

const LatestRepoStateMV = new MaterializedView<{
  repoId: number;
  repoName: string & Aggregated<"max", [string]>;
  repoDescription: string & Aggregated<"any", [string]>;
  repoTopics: string[] & Aggregated<"any", [string[]]>;
  repoLanguage: string & Aggregated<"any", [string]>;
  repoStars: number & Aggregated<"max", [number]>;
  repoForks: number & Aggregated<"any", [number]>;
  repoWatchers: number & Aggregated<"any", [number]>;
  repoOpenIssues: number & Aggregated<"any", [number]>;
  repoCreatedAt: Date & Aggregated<"any", [Date]>;
  repoOwnerLogin: string & Aggregated<"any", [string]>;
  repoOwnerId: number & Aggregated<"any", [number]>;
  repoOwnerUrl: string & Aggregated<"any", [string]>;
  repoOwnerAvatarUrl: string & Aggregated<"any", [string]>;
  repoOwnerType: string & Aggregated<"any", [string]>;
  repoOrgId: number & Aggregated<"any", [number]>;
  repoOrgUrl: string & Aggregated<"any", [string]>;
  repoOrgLogin: string & Aggregated<"any", [string]>;
  repoHomepage: string & Aggregated<"any", [string]>;
  lastSeenAt: Date & Aggregated<"max", [Date]>;
  totalStarEvents: number & Aggregated<"count", []>;
  uniqueStargazers: number & Aggregated<"uniqExact", [number]>;
}>({
  selectStatement: query,
  selectTables: [rsTable],
  tableName: "LatestRepoState",
  materializedViewName: "LatestRepoStateMV",
  engine: ClickHouseEngines.AggregatingMergeTree,
  orderByFields: ["repoId", "lastSeenAt", "repoStars", "repoLanguage"],
});

export default LatestRepoStateMV;
