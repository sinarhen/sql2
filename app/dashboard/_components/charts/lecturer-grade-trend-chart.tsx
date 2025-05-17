"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface LecturerGradeTrendProps {
  performanceTrends: {
    month: string;
    average: string | number;
    submissions: number;
  }[];
}

export function LecturerGradeTrendChart({ performanceTrends }: LecturerGradeTrendProps) {
  const gradeChartConfig = {
    average: {
      label: "Average Grade",
      color: "hsl(var(--chart-1))"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Student Performance Trends</CardTitle>
        <CardDescription className="text-[10px]">Average grade over time across all courses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gradeChartConfig} className="min-h-[200px] w-full">
          <LineChart accessibilityLayer data={performanceTrends}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="average" 
              strokeWidth={2} 
              activeDot={{ r: 6 }} 
              stroke="var(--color-average)" 
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 