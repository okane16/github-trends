import {
  DefaultApi,
  Configuration,
  ConsumptionTopicTimeseriesGetRequest,
} from "api-client";

export type TopicTimeseriesRequest = ConsumptionTopicTimeseriesGetRequest;

const baseUrl = process.env.MOOSE_API_URL || "http://localhost:4000";

const apiConfig = new Configuration({
  basePath: baseUrl,
});
const mooseClient = new DefaultApi(apiConfig);

export default mooseClient;
