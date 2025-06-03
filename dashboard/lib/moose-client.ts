import { DefaultApi, Configuration } from "api-client";

// API request interfaces - matching backend exactly
export interface TopReposByTopicRequest {
  topic?: string;
  limit?: number;
  minStars?: number;
}

export interface TopicPopularityRequest {
  limit?: number;
  minRepos?: number;
  sortBy?: "totalStars" | "totalRepos" | "avgStars" | "starEvents";
}

export interface LanguageStatsRequest {
  limit?: number;
  minRepos?: number;
  sortBy?: "totalRepos" | "totalStars" | "avgStars" | "starEvents";
}

export interface RepoGrowthTrendsRequest {
  interval?: "hour" | "day" | "week";
  limit?: number;
  minStars?: number;
  days?: number;
}

export interface TopicCorrelationsRequest {
  minRepos?: number;
  limit?: number;
}

export interface TopicTimeseriesRequest {
  interval?: "minute" | "hour" | "day";
  limit?: number;
  exclude?: string;
}

// Response interfaces - matching backend exactly
export interface RepoInfo {
  topic: string;
  repoFullName: string;
  repoDescription: string;
  repoLanguage: string;
  repoStars: number;
  starEvents: number;
  uniqueStargazers: number;
  rankByStars: number;
}

export interface TopicPopularity {
  topic: string;
  totalRepos: number;
  totalStars: number;
  avgStars: number;
  starEvents: number;
  uniqueStargazers: number;
  topLanguage: string;
}

export interface LanguageStats {
  language: string;
  totalRepos: number;
  totalStars: number;
  avgStars: number;
  starEvents: number;
  uniqueStargazers: number;
  topTopics: string[];
}

export interface RepoGrowthPoint {
  time: string;
  repoFullName: string;
  repoStars: number;
  starEvents: number;
  uniqueStargazers: number;
  cumulativeStarEvents: number;
}

export interface TopicCluster {
  category: string;
  topics: string[];
  totalRepos: number;
  totalStars: number;
  avgStarsPerRepo: number;
  topLanguages: string[];
  exampleRepos: string[];
  clusterStrength: number;
}

export interface DashboardOverview {
  totalRepos: number;
  totalTopics: number;
  totalLanguages: number;
  totalStarEvents: number;
  totalUniqueStargazers: number;
  avgStarsPerRepo: number;
}

export interface TopicStats {
  topic: string;
  eventCount: number;
  uniqueRepos: number;
  uniqueUsers: number;
}

export interface TopicTimeseriesResponse {
  time: string;
  topicStats: TopicStats[];
}

const baseUrl =
  process.env.NEXT_PUBLIC_MOOSE_API_URL || "http://localhost:4000";

const apiConfig = new Configuration({
  basePath: baseUrl,
});

class ExtendedMooseClient extends DefaultApi {
  async consumptionTopReposByTopicGet(
    params: TopReposByTopicRequest = {}
  ): Promise<RepoInfo[]> {
    const queryParams = new URLSearchParams();
    if (params.topic) queryParams.append("topic", params.topic);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.minStars)
      queryParams.append("minStars", params.minStars.toString());

    const response = await fetch(
      `${baseUrl}/consumption/topReposByTopic?${queryParams}`,
      { method: "GET" }
    );
    return response.json();
  }

  async consumptionTopicPopularityGet(
    params: TopicPopularityRequest = {}
  ): Promise<TopicPopularity[]> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.minRepos)
      queryParams.append("minRepos", params.minRepos.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);

    const response = await fetch(
      `${baseUrl}/consumption/topicPopularity?${queryParams}`,
      { method: "GET" }
    );
    return response.json();
  }

  async consumptionLanguageStatsGet(
    params: LanguageStatsRequest = {}
  ): Promise<LanguageStats[]> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.minRepos)
      queryParams.append("minRepos", params.minRepos.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);

    const response = await fetch(
      `${baseUrl}/consumption/languageStats?${queryParams}`,
      { method: "GET" }
    );
    return response.json();
  }

  async consumptionRepoGrowthTrendsGet(
    params: RepoGrowthTrendsRequest = {}
  ): Promise<RepoGrowthPoint[]> {
    const queryParams = new URLSearchParams();
    if (params.interval) queryParams.append("interval", params.interval);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.minStars)
      queryParams.append("minStars", params.minStars.toString());
    if (params.days) queryParams.append("days", params.days.toString());

    const response = await fetch(
      `${baseUrl}/consumption/repoGrowthTrends?${queryParams}`,
      { method: "GET" }
    );
    return response.json();
  }

  async consumptionTopicCorrelationsGet(
    params: TopicCorrelationsRequest = {}
  ): Promise<TopicCluster[]> {
    const queryParams = new URLSearchParams();
    if (params.minRepos)
      queryParams.append("minRepos", params.minRepos.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${baseUrl}/consumption/topicCorrelations?${queryParams}`,
      { method: "GET" }
    );
    return response.json();
  }

  async consumptionDashboardOverviewGet(): Promise<DashboardOverview> {
    const response = await fetch(`${baseUrl}/consumption/dashboardOverview`, {
      method: "GET",
    });
    return response.json();
  }

  async consumptionTopicTimeseriesGet(
    params: TopicTimeseriesRequest = {}
  ): Promise<TopicTimeseriesResponse[]> {
    const queryParams = new URLSearchParams();
    if (params.interval) queryParams.append("interval", params.interval);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.exclude) queryParams.append("exclude", params.exclude);

    const response = await fetch(
      `${baseUrl}/consumption/topicTimeseries?${queryParams}`,
      { method: "GET" }
    );
    return response.json();
  }
}

const mooseClient = new ExtendedMooseClient(apiConfig);

export default mooseClient;
