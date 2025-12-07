"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartConfig = {
  value: {
    label: "Inventory Value",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  chartData,
  dateRange = "90d",
}: {
  chartData: { date: string; value: number }[];
  dateRange?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // React 19.2 improvement: Use derived initial state based on mobile detection
  // This avoids an extra render cycle compared to useEffect sync
  const [timeRange, setTimeRange] = React.useState(
    () =>
      // Note: isMobile may be undefined on initial SSR, so we default to dateRange
      dateRange
  );

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const params = new URLSearchParams(searchParams);
    params.set("dateRange", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle mobile state changes with transition
  const [, startMobileTransition] = React.useTransition();
  React.useEffect(() => {
    if (isMobile && timeRange !== "7d") {
      startMobileTransition(() => setTimeRange("7d"));
    }
  }, [isMobile, timeRange]);

  const timeRangeOptions = React.useMemo(
    () => [
      { value: "7d", label: "Last 7 days", days: 7 },
      { value: "30d", label: "Last 30 days", days: 30 },
      { value: "90d", label: "Last 3 months", days: 90 },
      { value: "180d", label: "Last 6 months", days: 180 },
      { value: "365d", label: "Last year", days: 365 },
    ],
    []
  );

  const filteredData = React.useMemo(() => {
    const refDate = new Date();
    const selectedOption = timeRangeOptions.find(
      (opt) => opt.value === timeRange
    );
    const daysToSubtract = selectedOption?.days ?? 90;
    const startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [chartData, timeRange, timeRangeOptions]);

  // Show dropdown for 1 month (30d) and above
  const showDropdown = React.useMemo(() => {
    const selectedOption = timeRangeOptions.find(
      (opt) => opt.value === timeRange
    );
    return (selectedOption?.days ?? 0) >= 30;
  }, [timeRange, timeRangeOptions]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Inventory Value Trend</CardTitle>
        <CardDescription>
          {(() => {
            const selectedOption = timeRangeOptions.find(
              (opt) => opt.value === timeRange
            );
            const description = selectedOption?.label ?? "Last 3 months";
            return (
              <>
                <span className="hidden @[540px]/card:block">
                  Daily inventory value for {description.toLowerCase()}
                </span>
                <span className="@[540px]/card:hidden">{description}</span>
              </>
            );
          })()}
        </CardDescription>
        <CardAction>
          {showDropdown ? (
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                size="sm"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {timeRangeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <>
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={handleTimeRangeChange}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
              >
                {timeRangeOptions
                  .filter((option) => option.days < 30)
                  .map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
              </ToggleGroup>
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger
                  className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                  size="sm"
                  aria-label="Select time range"
                >
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {timeRangeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="rounded-lg"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillValue)"
              stroke="var(--chart-2)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
