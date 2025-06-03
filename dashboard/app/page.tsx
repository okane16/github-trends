"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingTopicsChart } from "@/components/trending-topics-chart";
import { DashboardOverview } from "@/components/dashboard-overview";
import { TopicPopularityChart } from "@/components/topic-popularity-chart";
import { LanguageStatsChart } from "@/components/language-stats-chart";
import { TopReposByTopic } from "@/components/top-repos-by-topic";
import { TopicCorrelations } from "@/components/topic-correlations";

export default function Home() {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTab("repositories");
  };

  return (
    <main
      className="container mx-auto py-8 px-4 max-w-7xl"
      suppressHydrationWarning
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          GitHub Trends Analytics
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Comprehensive insights into GitHub repository trends, programming
          languages, topic popularity, and ecosystem correlations powered by
          real-time data.
        </p>
      </div>

      {/* Dashboard Overview */}
      <div className="mb-8">
        <DashboardOverview />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="popularity">Topic Popularity</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="repositories">Top Repositories</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TrendingTopicsChart />
          </div>
        </TabsContent>

        <TabsContent value="popularity" className="space-y-6">
          <TopicPopularityChart onTopicClick={handleTopicClick} />
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <LanguageStatsChart />
        </TabsContent>

        <TabsContent value="repositories" className="space-y-6">
          <TopReposByTopic
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
          />
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <TopicCorrelations />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        <p>
          Powered by{" "}
          <a
            href="https://moosejs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Moose
          </a>{" "}
          • Real-time GitHub data analytics platform
        </p>
      </footer>
    </main>
  );
}
