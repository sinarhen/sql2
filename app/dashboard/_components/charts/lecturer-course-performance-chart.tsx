"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CoursePerformanceProps {
  coursePerformance: {
    courseId: string;
    courseName: string;
    avgScore: string | number | null;
    submissions: number;
    maxScore: number | null;
    minScore: number | null;
  }[];
}

export function LecturerCoursePerformanceChart({ coursePerformance }: CoursePerformanceProps) {
  const gradeChartConfig = {
    average: {
      label: "Average Grade",
      color: "hsl(var(--chart-1))"
    }
  };

  const chartData = coursePerformance.map(course => ({
    name: course.courseName,
    average: Number(course.avgScore || 0)
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Course Performance</CardTitle>
        <CardDescription className="text-[10px]">Average grade by course</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gradeChartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="average" 
              fill="var(--color-average)" 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 