import { RepoStarEventV2 } from "./../index";
import { ConsumptionApi, ConsumptionUtil } from "@514labs/moose-lib";
import { tags } from "typia";

interface QueryParams {
  limit?: number & tags.Minimum<1> & tags.Type<"int32">; // number of languages to return
  minRepos?: number & tags.Minimum<1> & tags.Type<"int32">; // minimum number of repos per language
  sortBy?: "totalRepos" | "totalStars" | "avgStars" | "starEvents"; // sort criteria
}

interface LanguageStats {
  language: string;
  totalRepos: number;
  totalStars: number;
  avgStars: number;
  starEvents: number;
  uniqueStargazers: number;
  topTopics: string[];
}

export default new ConsumptionApi<QueryParams, LanguageStats[]>(
  "languageStats",
  async (
    { limit = 20, minRepos = 10, sortBy = "totalRepos" }: QueryParams,
    { client, sql }: ConsumptionUtil
  ) => {
    const RepoStar = RepoStarEventV2.table!;
    const cols = RepoStar.columns;

    const sortMap = {
      totalRepos: sql`totalRepos DESC`,
      totalStars: sql`totalStars DESC`,
      avgStars: sql`avgStars DESC`,
      starEvents: sql`starEvents DESC`,
    };

    const query = sql`
      WITH LanguageStats AS (
          SELECT 
              ${cols.repoLanguage} as language,
              uniqExact(${cols.repoFullName}) as totalRepos,
              sum(${cols.repoStars}) as totalStars,
              avg(${cols.repoStars}) as avgStars,
              count(*) as starEvents,
              uniqExact(${cols.actorId}) as uniqueStargazers,
              topK(5)(arrayJoin(${cols.repoTopics})) as topTopics
          FROM ${RepoStar}
          WHERE ${cols.repoLanguage} != '' 
              AND length(${cols.repoTopics}) > 0
          GROUP BY ${cols.repoLanguage}
          HAVING totalRepos >= ${minRepos}
      )
      SELECT 
          language,
          totalRepos,
          totalStars,
          round(avgStars, 0) as avgStars,
          starEvents,
          uniqueStargazers,
          topTopics
      FROM LanguageStats
      ORDER BY ${sortMap[sortBy]}
      LIMIT ${limit}
    `;

    const resultSet = await client.query.execute<LanguageStats>(query);
    return await resultSet.json();
  }
);
