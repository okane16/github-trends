import {
  DefaultApi,
  Configuration,
  ConsumptionTopicTimeseriesGetRequest,
} from "api-client";

export type TopicTimeseriesRequest = ConsumptionTopicTimeseriesGetRequest;

const baseUrl = process.env.NEXT_PUBLIC_MOOSE_API_URL;

const apiConfig = new Configuration({
  basePath: baseUrl,
});
const mooseClient = new DefaultApi(apiConfig);

export default mooseClient;
