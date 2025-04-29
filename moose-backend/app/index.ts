import { IGhEvent, IRepoStarEvent, IRepoStarEventV2 } from "./ingest/models";
import { transformGhEvent } from "./ingest/transform";
export * from "./apis/topicTimeseries";

import { IngestPipeline } from "@514labs/moose-lib";

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
