"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CourseDistributionProps {
  courseDistributionData: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function LecturerCourseDistributionChart({ courseDistributionData }: CourseDistributionProps) {
  const studentChartConfig = {
    students: {
      label: "Students",
      color: "hsl(var(--chart-2))"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Course Enrollment Distribution</CardTitle>
        <CardDescription className="text-[10px]">Number of students per course</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={studentChartConfig} className="min-h-[200px] w-full">
          <PieChart>
            <Pie
              data={courseDistributionData}
              nameKey="name"
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => entry.name}
              labelLine={false}
            >
              {courseDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent labelKey="students" />} 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 