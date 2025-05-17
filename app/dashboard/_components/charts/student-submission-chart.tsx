"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StudentSubmissionChartProps {
  performanceTrends: {
    month: string;
    average: string | number;
    submissions: number;
  }[];
}

export function StudentSubmissionChart({ performanceTrends }: StudentSubmissionChartProps) {
  const submissionChartConfig = {
    submissions: {
      label: "Submissions",
      color: "hsl(var(--chart-2))"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Assignment Submissions</CardTitle>
        <CardDescription className="text-[10px]">Monthly submission activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={submissionChartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={performanceTrends}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="submissions" 
              fill="var(--color-submissions)" 
              name="submissions"
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 