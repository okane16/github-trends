import { RepoStarEventV2 } from "./../index";
import { ConsumptionApi, ConsumptionUtil } from "@514labs/moose-lib";
import { tags } from "typia";

interface QueryParams {
  limit?: number & tags.Minimum<1> & tags.Type<"int32">; // number of topics to return
  minRepos?: number & tags.Minimum<1> & tags.Type<"int32">; // minimum number of repos per topic
  sortBy?: "totalStars" | "totalRepos" | "avgStars" | "starEvents"; // sort criteria
}

interface TopicPopularity {
  topic: string;
  totalRepos: number;
  totalStars: number;
  avgStars: number;
  starEvents: number;
  uniqueStargazers: number;
  topLanguage: string;
}

export default new ConsumptionApi<QueryParams, TopicPopularity[]>(
  "topicPopularity",
  async (
    { limit = 50, minRepos = 5, sortBy = "totalStars" }: QueryParams,
    { client, sql }: ConsumptionUtil
  ) => {
    const RepoStar = RepoStarEventV2.table!;
    const cols = RepoStar.columns;

    const sortMap = {
      totalStars: sql`totalStars DESC`,
      totalRepos: sql`totalRepos DESC`,
      avgStars: sql`avgStars DESC`,
      starEvents: sql`starEvents DESC`,
    };

    const query = sql`
      WITH TopicStats AS (
          SELECT 
              topic,
              uniqExact(${cols.repoFullName}) as totalRepos,
              sum(${cols.repoStars}) as totalStars,
              avg(${cols.repoStars}) as avgStars,
              count(*) as starEvents,
              uniqExact(${cols.actorId}) as uniqueStargazers,
              topK(1)(${cols.repoLanguage})[1] as topLanguage
          FROM ${RepoStar}
          ARRAY JOIN ${cols.repoTopics} as topic
          WHERE length(${cols.repoTopics}) > 0 
              AND ${cols.repoLanguage} != ''
          GROUP BY topic
          HAVING totalRepos >= ${minRepos}
      )
      SELECT 
          topic,
          totalRepos,
          totalStars,
          round(avgStars, 0) as avgStars,
          starEvents,
          uniqueStargazers,
          topLanguage
      FROM TopicStats
      ORDER BY ${sortMap[sortBy]}
      LIMIT ${limit}
    `;

    const resultSet = await client.query.execute<TopicPopularity>(query);
    return await resultSet.json();
  }
);
