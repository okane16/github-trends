"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Code, Star } from "lucide-react";
import mooseClient from "@/lib/moose-client";
import { NoSSR } from "./no-ssr";

function DashboardOverviewContent() {
  const {
    data: overview,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: () => mooseClient.consumptionDashboardOverviewGet(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardTitle>
              <Loader2 className="h-4 w-4 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load dashboard overview</p>
      </div>
    );
  }

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

  const metrics = [
    {
      title: "Total Repositories",
      value: formatNumber(overview.totalRepos),
      description: "Repositories tracked",
      icon: Code,
      color: "text-blue-600",
    },
    {
      title: "Total Topics",
      value: formatNumber(overview.totalTopics),
      description: "Unique topics found",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Programming Languages",
      value: formatNumber(overview.totalLanguages),
      description: "Languages represented",
      icon: Code,
      color: "text-purple-600",
    },
    {
      title: "Star Events",
      value: formatNumber(overview.totalStarEvents),
      description: "Total starring activity",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "Unique Stargazers",
      value: formatNumber(overview.totalUniqueStargazers),
      description: "Individual contributors",
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Average Stars",
      value: formatNumber(overview.avgStarsPerRepo),
      description: "Per repository",
      icon: Star,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DashboardOverview() {
  return (
    <NoSSR
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </CardTitle>
                <Loader2 className="h-4 w-4 animate-spin" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <DashboardOverviewContent />
    </NoSSR>
  );
}
