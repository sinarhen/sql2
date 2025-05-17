"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StudentGradeChartProps {
  performanceTrends: {
    month: string;
    average: string | number;
    submissions: number;
  }[];
}

export function StudentGradeChart({ performanceTrends }: StudentGradeChartProps) {
  const gradeChartConfig = {
    grade: {
      label: "Average Grade",
      color: "hsl(var(--chart-1))"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Average Grade Timeline</CardTitle>
        <CardDescription className="text-[10px]">Your average grade over time</CardDescription>
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
              name="grade"
              strokeWidth={2} 
              activeDot={{ r: 6 }} 
              stroke="var(--color-grade)" 
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 