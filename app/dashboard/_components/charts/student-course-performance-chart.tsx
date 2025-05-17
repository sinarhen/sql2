"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CoursePerformanceProps {
  courses: {
    id: string;
    title: string;
    progress: number;
    color: string;
    students: number;
    completion: string;
  }[];
}

export function StudentCoursePerformanceChart({ courses }: CoursePerformanceProps) {
  const gradeChartConfig = {
    grade: {
      label: "Average Grade",
      color: "hsl(var(--chart-1))"
    }
  };

  const chartData = courses.map(course => ({
    name: course.title,
    grade: course.progress
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Course Performance</CardTitle>
        <CardDescription className="text-[10px]">Your grades by course</CardDescription>
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
              dataKey="grade" 
              fill="var(--color-grade)" 
              name="grade"
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 