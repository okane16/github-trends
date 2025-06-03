"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Star,
  Users,
  ExternalLink,
  Code,
  GitFork,
} from "lucide-react";
import mooseClient, { TopReposByTopicRequest } from "@/lib/moose-client";
import { NoSSR } from "./no-ssr";

interface TopReposByTopicProps {
  selectedTopic?: string;
  onTopicChange?: (topic: string) => void;
}

function TopReposByTopicContent({
  selectedTopic = "",
  onTopicChange,
}: TopReposByTopicProps) {
  const [searchTopic, setSearchTopic] = useState(selectedTopic);
  const [params, setParams] = useState<TopReposByTopicRequest>({
    topic: selectedTopic,
    limit: 5,
    minStars: 1000,
  });

  // Update internal state when selectedTopic prop changes
  useEffect(() => {
    if (selectedTopic !== searchTopic) {
      setSearchTopic(selectedTopic);
      setParams((prev) => ({ ...prev, topic: selectedTopic }));
    }
  }, [selectedTopic, searchTopic]);

  const {
    data: repos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topReposByTopic", params],
    queryFn: () => mooseClient.consumptionTopReposByTopicGet(params),
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

  const handleSearch = () => {
    setParams({ ...params, topic: searchTopic });
    onTopicChange?.(searchTopic);
  };

  const handleClearSearch = () => {
    setSearchTopic("");
    setParams({ ...params, topic: "" });
    onTopicChange?.("");
  };

  // Group repos by topic
  const reposByTopic =
    repos?.reduce((acc, repo) => {
      if (!acc[repo.topic]) {
        acc[repo.topic] = [];
      }
      acc[repo.topic].push(repo);
      return acc;
    }, {} as Record<string, typeof repos>) || {};

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Repositories by Topic
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Repositories by Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load repository data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Top Repositories by Topic
        </CardTitle>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {selectedTopic && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-700">
                Showing repositories for topic: <strong>{selectedTopic}</strong>
              </span>
              <Button
                onClick={handleClearSearch}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </Button>
            </div>
          )}
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Search by topic (e.g., 'ai', 'react', 'python')"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4" />
            </Button>
            {params.topic && (
              <Button onClick={handleClearSearch} variant="outline" size="sm">
                Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Select
              value={params.limit?.toString()}
              onValueChange={(value) =>
                setParams({ ...params, limit: parseInt(value) })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Top 3</SelectItem>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="15">Top 15</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={params.minStars?.toString()}
              onValueChange={(value) =>
                setParams({ ...params, minStars: parseInt(value) })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100+ stars</SelectItem>
                <SelectItem value="500">500+ stars</SelectItem>
                <SelectItem value="1000">1K+ stars</SelectItem>
                <SelectItem value="5000">5K+ stars</SelectItem>
                <SelectItem value="10000">10K+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!repos || repos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {params.topic
                ? `No repositories found for topic "${params.topic}"`
                : "No repositories found. Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(reposByTopic).map(([topic, topicRepos]) => (
              <div key={topic} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{topic}</h3>
                  <Badge variant="secondary">{topicRepos.length} repos</Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {topicRepos.map((repo) => (
                    <Card
                      key={repo.repoFullName}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Repository Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-lg truncate">
                                  {repo.repoFullName.split("/")[1]}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  #{repo.rankByStars}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {repo.repoFullName.split("/")[0]}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `https://github.com/${repo.repoFullName}`,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Description */}
                          {repo.repoDescription && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {repo.repoDescription}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">
                                {formatNumber(repo.repoStars)}
                              </span>
                              <span className="text-gray-500">stars</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">
                                {formatNumber(repo.uniqueStargazers)}
                              </span>
                              <span className="text-gray-500">stargazers</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="h-4 w-4 text-green-500" />
                              <span className="font-medium">
                                {formatNumber(repo.starEvents)}
                              </span>
                              <span className="text-gray-500">events</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Code className="h-4 w-4 text-purple-500" />
                              <span className="font-medium text-purple-600">
                                {repo.repoLanguage || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopReposByTopic({
  selectedTopic = "",
  onTopicChange,
}: TopReposByTopicProps) {
  return (
    <NoSSR
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Repositories by Topic
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
      <TopReposByTopicContent
        selectedTopic={selectedTopic}
        onTopicChange={onTopicChange}
      />
    </NoSSR>
  );
}
