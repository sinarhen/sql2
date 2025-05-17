"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
      color: "hsl(var(--primary))"
    }
  };

  const chartData = coursePerformance.map(course => ({
    name: course.courseName,
    average: Number(course.avgScore || 0)
  }));

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Course Performance</CardTitle>
        <CardDescription className="text-[10px]">Average grade by course</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gradeChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                tickMargin={8}
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                cursor={{ fill: 'hsl(var(--primary)/10)' }}
              />
              <Bar 
                dataKey="average" 
                name="average"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 