import { Key, IngestPipeline } from "@514labs/moose-lib";
import { transformGhEvent } from "./transform";

export enum GitHubEventType {
  Watch = "WatchEvent",
  Push = "PushEvent",
  Issue = "IssuesEvent",
  IssueComment = "IssueCommentEvent",
  PullRequest = "PullRequestEvent",
  PullRequestReview = "PullRequestReviewEvent",
  Create = "CreateEvent",
  Delete = "DeleteEvent",
  PRComment = "PullRequestReviewCommentEvent",
  Fork = "ForkEvent",
  Member = "MemberEvent",
  Release = "ReleaseEvent",
  CommitComment = "CommitCommentEvent",
  Public = "PublicEvent",
}

export interface IGhEvent {
  eventType: GitHubEventType;
  eventId: Key<string>;
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
}

export interface IRepoStarEvent extends IGhEvent {
  repoDescription?: string;
  repoTopics?: string[];
  repoLanguage?: string;
  repoStars?: number;
  repoForks?: number;
  repoWatchers?: number;
  repoOpenIssues?: number;
  repoCreatedAt?: Date;
  repoOwnerLogin?: string;
  repoOwnerId?: number;
  repoOwnerUrl?: string;
  repoOwnerAvatarUrl?: string;
  repoOwnerType?: string;
  repoOrgId?: number;
  repoOrgUrl?: string;
  repoOrgLogin?: string;
  repoHomepage?: string;
}

export interface IRepoStarEventV2 extends IGhEvent {
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

export const GhEvent = new IngestPipeline<IGhEvent>("GhEvent", {
  ingest: true,
  table: true,
  stream: true,
});

export const RepoStarEvent = new IngestPipeline<IRepoStarEvent>("RepoStar", {
  ingest: false,
  stream: true,
  table: true,
});

export const RepoStarEventV2 = new IngestPipeline<IRepoStarEventV2>(
  "RepoStarV2",
  {
    ingest: false,
    stream: true,
    table: true,
  }
);

GhEvent.stream!.addTransform(RepoStarEventV2.stream!, transformGhEvent);
