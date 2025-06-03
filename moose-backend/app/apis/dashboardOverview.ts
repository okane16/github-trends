import { RepoStarEventV2 } from "./../index";
import { ConsumptionApi, ConsumptionUtil } from "@514labs/moose-lib";

interface DashboardOverview {
  totalRepos: number;
  totalTopics: number;
  totalLanguages: number;
  totalStarEvents: number;
  totalUniqueStargazers: number;
  avgStarsPerRepo: number;
}

export default new ConsumptionApi<{}, DashboardOverview>(
  "dashboardOverview",
  async ({}, { client, sql }: ConsumptionUtil): Promise<DashboardOverview> => {
    const RepoStar = RepoStarEventV2.table!;
    const cols = RepoStar.columns;

    const query = sql`
      SELECT 
          uniqExact(${cols.repoFullName}) as totalRepos,
          uniqExact(arrayJoin(${cols.repoTopics})) as totalTopics,
          uniqExact(${cols.repoLanguage}) as totalLanguages,
          count(*) as totalStarEvents,
          uniqExact(${cols.actorId}) as totalUniqueStargazers,
          round(avg(${cols.repoStars}), 0) as avgStarsPerRepo
      FROM ${RepoStar}
      WHERE length(${cols.repoTopics}) > 0 
          AND ${cols.repoLanguage} != ''
    `;

    const resultSet = await client.query.execute<DashboardOverview>(query);
    const result = await resultSet.json();
    return result[0] as DashboardOverview;
  }
);
