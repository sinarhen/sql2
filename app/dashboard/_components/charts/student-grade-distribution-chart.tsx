"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface GradeDistributionProps {
  gradeDistribution: {
    range: string;
    count: number;
  }[];
}

export function StudentGradeDistributionChart({ gradeDistribution }: GradeDistributionProps) {
  const courseChartConfig = {
    count: {
      label: "Student Count",
      color: "hsl(var(--chart-3))"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Grade Distribution</CardTitle>
        <CardDescription className="text-[10px]">Distribution of grades across all courses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={courseChartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={gradeDistribution}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="range" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="count" 
              fill="var(--color-count)" 
              name="count"
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 