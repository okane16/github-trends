import { RepoStarEventV2 } from "./../index";
import { ConsumptionApi, ConsumptionUtil } from "@514labs/moose-lib";
import { tags } from "typia";

interface QueryParams {
  topic?: string; // filter by specific topic (optional)
  limit?: number & tags.Minimum<1> & tags.Type<"int32">; // number of repos per topic
  minStars?: number & tags.Minimum<0> & tags.Type<"int32">; // minimum star count filter
}

interface RepoInfo {
  topic: string;
  repoFullName: string;
  repoDescription: string;
  repoLanguage: string;
  repoStars: number;
  starEvents: number;
  uniqueStargazers: number;
  rankByStars: number;
}

export default new ConsumptionApi<QueryParams, RepoInfo[]>(
  "topReposByTopic",
  async (
    { topic = "", limit = 5, minStars = 1000 }: QueryParams,
    { client, sql }: ConsumptionUtil
  ) => {
    const RepoStar = RepoStarEventV2.table!;
    const cols = RepoStar.columns;

    const query = sql`
      WITH TopicRepos AS (
          SELECT 
              topic,
              ${cols.repoFullName} as repoFullName,
              ${cols.repoDescription} as repoDescription,
              ${cols.repoLanguage} as repoLanguage,
              ${cols.repoStars} as repoStars,
              count(*) as starEvents,
              uniqExact(${cols.actorId}) as uniqueStargazers,
              ROW_NUMBER() OVER (PARTITION BY topic ORDER BY ${
                cols.repoStars
              } DESC) as rankByStars
          FROM ${RepoStar}
          ARRAY JOIN ${cols.repoTopics} as topic
          WHERE length(${cols.repoTopics}) > 0 
              AND ${cols.repoStars} >= ${minStars}
              ${topic ? sql`AND topic = ${topic}` : sql``}
          GROUP BY topic, ${cols.repoFullName}, ${cols.repoDescription}, ${
      cols.repoLanguage
    }, ${cols.repoStars}
      )
      SELECT 
          topic,
          repoFullName,
          repoDescription,
          repoLanguage,
          repoStars,
          starEvents,
          uniqueStargazers,
          rankByStars
      FROM TopicRepos
      WHERE rankByStars <= ${limit}
      ORDER BY topic, repoStars DESC
    `;

    const resultSet = await client.query.execute<RepoInfo>(query);
    return await resultSet.json();
  }
);
