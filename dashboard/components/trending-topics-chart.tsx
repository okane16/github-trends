"use client";

import { useState, useEffect } from "react";
import { CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import {
  Loader2,
  Rewind,
  Play,
  Pause,
  FastForward,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import mooseClient from "@/lib/moose-client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingTopicsControls } from "./trending-topics-controls";
import { Button } from "@/components/ui/button";
import { NoSSR } from "./no-ssr";

// Consistent date formatting functions that work the same on server and client
const formatDate = (dateString: string, interval: string) => {
  const date = new Date(dateString);

  if (interval === "day") {
    // Format as "Jan 15, 2024 2:30 PM"
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${month} ${day}, ${year} ${displayHours}:${minutes} ${ampm}`;
  } else {
    // Format as "2:30 PM"
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${ampm}`;
  }
};

const formatDateShort = (dateString: string, interval: string) => {
  const date = new Date(dateString);

  if (interval === "day") {
    // Format as "Jan 15"
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  } else {
    // Format as "2:30 PM"
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
};

const formatDateRange = (dateString: string, interval: string) => {
  const date = new Date(dateString);

  if (interval === "day") {
    // Format as "Jan 15, 24"
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  } else {
    // Format as "2:30 PM"
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
};

function TrendingTopicsChartContent() {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [interval, setInterval] = useState<"minute" | "hour" | "day">("hour");
  const [limit, setLimit] = useState(10);
  const [exclude, setExclude] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["topicTimeseries", interval, limit, exclude],
    queryFn: async () => {
      const result = await mooseClient.consumptionTopicTimeseriesGet({
        interval,
        limit,
        exclude: exclude || undefined,
      });
      return result;
    },
  });

  // Updated animation logic
  useEffect(() => {
    if (!data || !isPlaying) return;

    const intervalId = window.setInterval(() => {
      setCurrentTimeIndex((prev) => (prev + 1) % data.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [data, isPlaying]);

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-80">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading trending topics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-80 text-red-500">
        <p>
          Error loading data:{" "}
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!data || !isClient) return null;

  const chartConfig = Array.from(
    new Set(data.flatMap((d) => d.topicStats.map((t) => t.topic)))
  ).reduce(
    (acc, topic, index) => ({
      ...acc,
      [topic]: {
        label: topic,
        color: `var(--chart-${(index % 20) + 1})`,
      },
    }),
    {}
  );

  const chartData = data[currentTimeIndex].topicStats.map((stat) => ({
    eventCount: stat.eventCount,
    topic: stat.topic,
    fill: `var(--color-${stat.topic})`,
  }));

  return (
    <div>
      <TrendingTopicsControls
        interval={interval}
        limit={limit}
        exclude={exclude}
        onIntervalChange={(value: "minute" | "hour" | "day") => {
          setInterval(value);
          setCurrentTimeIndex(0); // Reset animation index
        }}
        onLimitChange={(value) => {
          setLimit(value);
          setCurrentTimeIndex(0);
        }}
        onExcludeChange={(value) => {
          setExclude(value);
          setCurrentTimeIndex(0);
        }}
      />

      <div className="mt-8">
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <BarChart
            accessibilityLayer
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 40, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="eventCount" type="number" domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="topic"
              width={100}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="eventCount"
              radius={[0, 4, 4, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ChartContainer>

        <div className="mt-6">
          {/* Current Time Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 bg-card border rounded-lg px-4 py-3 shadow-sm">
              <div className="text-sm text-muted-foreground">Current Time:</div>
              <div className="text-lg font-semibold">
                {formatDate(data[currentTimeIndex].time, interval)}
              </div>
              <div className="text-sm text-muted-foreground">
                ({currentTimeIndex + 1} of {data.length})
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-4 mb-6 justify-center">
            <Button
              onClick={() => setCurrentTimeIndex(0)}
              variant="outline"
              size="sm"
            >
              <Rewind className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPlaying(false);
                setCurrentTimeIndex(
                  currentTimeIndex === 0
                    ? data.length - 1
                    : currentTimeIndex - 1
                );
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="outline"
              size="sm"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPlaying(false);
                setCurrentTimeIndex(
                  currentTimeIndex === data.length - 1
                    ? 0
                    : currentTimeIndex + 1
                );
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setCurrentTimeIndex(data.length - 1)}
              variant="outline"
              size="sm"
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar Slider */}
          <div className="mb-6 px-4">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={data.length - 1}
                value={currentTimeIndex}
                onChange={(e) => {
                  setCurrentTimeIndex(parseInt(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                    (currentTimeIndex / (data.length - 1)) * 100
                  }%, hsl(var(--muted)) ${
                    (currentTimeIndex / (data.length - 1)) * 100
                  }%, hsl(var(--muted)) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatDateRange(data[0].time, interval)}</span>
                <span>
                  {formatDateRange(data[data.length - 1].time, interval)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Jump Buttons - Show only key time points */}
          {data.length > 10 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {Array.from({ length: Math.min(5, data.length) }, (_, i) => {
                const index = Math.floor(
                  (i * (data.length - 1)) /
                    Math.max(1, Math.min(4, data.length - 1))
                );
                return (
                  <Button
                    key={index}
                    onClick={() => {
                      setCurrentTimeIndex(index);
                      setIsPlaying(false);
                    }}
                    variant={index === currentTimeIndex ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    {formatDateShort(data[index].time, interval)}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Detailed Time Selection - Only show if there are few time points */}
          {data.length <= 10 && (
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {data.map((timeData, index) => (
                <Button
                  key={timeData.time}
                  onClick={() => {
                    setCurrentTimeIndex(index);
                    setIsPlaying(false);
                  }}
                  variant={index === currentTimeIndex ? "default" : "outline"}
                  size="sm"
                  className="text-sm whitespace-nowrap"
                >
                  {formatDateShort(timeData.time, interval)}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TrendingTopicsChart() {
  return (
    <NoSSR
      fallback={
        <div className="flex justify-center items-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading trending topics...</span>
        </div>
      }
    >
      <TrendingTopicsChartContent />
    </NoSSR>
  );
}
