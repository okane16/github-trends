"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, Star, GitBranch, Hash } from "lucide-react";
import mooseClient, {
  TopicPopularityRequest,
  TopicPopularity,
} from "@/lib/moose-client";
import { NoSSR } from "./no-ssr";

interface TopicPopularityChartProps {
  onTopicClick?: (topic: string) => void;
}

function TopicPopularityChartContent({
  onTopicClick,
}: TopicPopularityChartProps) {
  const [params, setParams] = useState<TopicPopularityRequest>({
    limit: 20,
    sortBy: "totalStars",
  });

  const {
    data: topics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topicPopularity", params],
    queryFn: () => mooseClient.consumptionTopicPopularityGet(params),
    refetchInterval: 60000,
  });

  const formatNumber = (num: number) => {
    // Use consistent formatting that works the same on server and client
    if (num >= 1000000) {
      const millions = Math.floor(num / 100000) / 10;
      return `${millions}M`;
    }
    if (num >= 1000) {
      const thousands = Math.floor(num / 100) / 10;
      return `${thousands}K`;
    }
    // Use simple string conversion instead of toLocaleString to avoid locale differences
    return num.toString();
  };

  const getMetricValue = (topic: TopicPopularity, sortBy: string) => {
    switch (sortBy) {
      case "totalStars":
        return topic.totalStars;
      case "totalRepos":
        return topic.totalRepos;
      case "avgStars":
        return topic.avgStars;
      case "starEvents":
        return topic.starEvents;
      default:
        return topic.totalStars;
    }
  };

  const getMetricLabel = (sortBy: string) => {
    switch (sortBy) {
      case "totalStars":
        return "Total Stars";
      case "totalRepos":
        return "Total Repos";
      case "avgStars":
        return "Avg Stars";
      case "starEvents":
        return "Star Events";
      default:
        return "Total Stars";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Topic Popularity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !topics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Topic Popularity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load topic popularity data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = topics.map((topic) => ({
    ...topic,
    displayValue: getMetricValue(topic, params.sortBy || "totalStars"),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Topic Popularity
          </CardTitle>
          <div className="flex gap-2">
            <Select
              value={params.sortBy}
              onValueChange={(value) =>
                setParams({
                  ...params,
                  sortBy: value as TopicPopularityRequest["sortBy"],
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalStars">Total Stars</SelectItem>
                <SelectItem value="totalRepos">Total Repos</SelectItem>
                <SelectItem value="avgStars">Avg Stars</SelectItem>
                <SelectItem value="starEvents">Star Events</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={params.limit?.toString()}
              onValueChange={(value) =>
                setParams({ ...params, limit: parseInt(value) })
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {onTopicClick && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Interactive Chart:</strong> Click on any bar or topic
              card below to view the top repositories for that topic
            </p>
          </div>
        )}

        <div className="h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="topic"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip
                formatter={(value: number) => [
                  formatNumber(value),
                  getMetricLabel(params.sortBy || "totalStars"),
                ]}
                labelFormatter={(label) => `Topic: ${label}`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{`Topic: ${label}`}</p>
                        <p className="text-blue-600">
                          {`${getMetricLabel(
                            params.sortBy || "totalStars"
                          )}: ${formatNumber(payload[0].value as number)}`}
                        </p>
                        {onTopicClick && (
                          <p className="text-xs text-gray-500 mt-1">
                            Click to view repositories
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="displayValue"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => {
                  if (data && onTopicClick) {
                    onTopicClick(data.topic);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(0, 6).map((topic, index) => (
            <div
              key={topic.topic}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
              onClick={() => onTopicClick?.(topic.topic)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">{topic.topic}</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">
                    {formatNumber(topic.totalRepos)} repos
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-gray-600">
                    {formatNumber(topic.totalStars)} stars
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-gray-600">
                    {formatNumber(topic.avgStars)} avg
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-blue-500" />
                  <span className="text-gray-600">
                    {formatNumber(topic.starEvents)} events
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopicPopularityChart({
  onTopicClick,
}: TopicPopularityChartProps) {
  return (
    <NoSSR
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Topic Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      }
    >
      <TopicPopularityChartContent onTopicClick={onTopicClick} />
    </NoSSR>
  );
}
