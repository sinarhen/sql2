"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
      color: "hsl(var(--primary))"
    }
  };

  const chartData = courses.map(course => ({
    name: course.title,
    grade: course.progress
  }));

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle>
          <span className="text-primary">Course Performance</span>
        </CardTitle>
        <CardDescription>Your grades by course</CardDescription>
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
                dataKey="grade" 
                name="grade"
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