"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, Star, Users, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import mooseClient, {
  LanguageStatsRequest,
  LanguageStats,
} from "@/lib/moose-client";
import { NoSSR } from "./no-ssr";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#6366f1",
];

function LanguageStatsChartContent() {
  const [params, setParams] = useState<LanguageStatsRequest>({
    limit: 15,
    minRepos: 10,
    sortBy: "totalRepos",
  });

  const {
    data: languages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["languageStats", params],
    queryFn: () => mooseClient.consumptionLanguageStatsGet(params),
    refetchInterval: 60000,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      const millions = Math.floor(num / 100000) / 10;
      return `${millions}M`;
    }
    if (num >= 1000) {
      const thousands = Math.floor(num / 100) / 10;
      return `${thousands}K`;
    }
    return num.toString();
  };

  const getMetricValue = (language: LanguageStats, sortBy: string) => {
    switch (sortBy) {
      case "totalStars":
        return language.totalStars;
      case "totalRepos":
        return language.totalRepos;
      case "avgStars":
        return language.avgStars;
      case "starEvents":
        return language.starEvents;
      default:
        return language.totalRepos;
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
        return "Total Repos";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Programming Languages
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

  if (error || !languages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Programming Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load language statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = languages.map((lang, index) => ({
    ...lang,
    displayValue: getMetricValue(lang, params.sortBy || "totalRepos"),
    color: COLORS[index % COLORS.length],
  }));

  const pieData = languages.slice(0, 10).map((lang, index) => ({
    name: lang.language,
    value: getMetricValue(lang, params.sortBy || "totalRepos"),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Programming Languages
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={params.sortBy}
                onValueChange={(value) =>
                  setParams({
                    ...params,
                    sortBy: value as LanguageStatsRequest["sortBy"],
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalRepos">Total Repos</SelectItem>
                  <SelectItem value="totalStars">Total Stars</SelectItem>
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
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-80">
              <h3 className="text-lg font-semibold mb-4">Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="h-80">
              <h3 className="text-lg font-semibold mb-4">
                {getMetricLabel(params.sortBy || "totalRepos")}
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.slice(0, 8)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="language"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip
                    formatter={(value: number) => [
                      formatNumber(value),
                      getMetricLabel(params.sortBy || "totalRepos"),
                    ]}
                    labelFormatter={(label) => `Language: ${label}`}
                  />
                  <Bar
                    dataKey="displayValue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.slice(0, 9).map((language, index) => (
          <Card
            key={language.language}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{language.language}</h3>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Repositories
                  </span>
                  <span className="font-medium">
                    {formatNumber(language.totalRepos)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Total Stars
                  </span>
                  <span className="font-medium">
                    {formatNumber(language.totalStars)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Avg Stars
                  </span>
                  <span className="font-medium">
                    {formatNumber(language.avgStars)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Stargazers
                  </span>
                  <span className="font-medium">
                    {formatNumber(language.uniqueStargazers)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-2">Top Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {language.topTopics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {language.topTopics.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{language.topTopics.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LanguageStatsChart() {
  return (
    <NoSSR
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Programming Languages
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
      <LanguageStatsChartContent />
    </NoSSR>
  );
}
