import { MaterializedView, sql } from "@514labs/moose-lib";

interface RepoStarEvent {
  eventId: string;
  createdAt: Date;
  actorLogin: string;
  actorId: number;
  actorUrl: string;
  actorAvatarUrl: string;
  repoUrl: string;
  repoId: number;
  repoOwner: string;
  repoName: string;
  repoFullName: string;
  repoDescription: string;
  repoTopics: string[];
  repoLanguage: string;
  repoStars: number;
  repoForks: number;
  repoWatchers: number;
  repoOpenIssues: number;
  repoCreatedAt: Date;
  repoOwnerLogin: string;
  repoOwnerId: number;
  repoOwnerUrl: string;
  repoOwnerAvatarUrl: string;
  repoOwnerType: string;
  repoOrgId: number;
  repoOrgUrl: string;
  repoOrgLogin: string;
  repoHomepage: string;
}

const deduplicateQuery = sql`
    SELECT 
        eventId,
        createdAt,
        actorLogin,
        actorId,
        actorUrl,
        actorAvatarUrl,
        repoUrl,
        repoId,
        repoOwner,
        repoName,
        repoFullName,
        repoDescription,
        repoTopics,
        repoLanguage,
        repoStars,
        repoForks,
        repoWatchers,
        repoOpenIssues,
        repoCreatedAt,
        repoOwnerLogin,
        repoOwnerId,
        repoOwnerUrl,
        repoOwnerAvatarUrl,
        repoOwnerType,
        repoOrgId,
        repoOrgUrl,
        repoOrgLogin,
        repoHomepage
    FROM (
        SELECT 
            *,
            row_number() OVER (PARTITION BY eventId ORDER BY createdAt DESC) as rn
        FROM RepoStar
    ) t
    WHERE rn = 1
`;

export const RepoStarDedupe = new MaterializedView<RepoStarEvent>({
  selectStatement: deduplicateQuery,
  tableName: "RepoStarDeduped",
  materializedViewName: "RepoStarDedupedMV",
  orderByFields: ["eventId", "createdAt"],
});
