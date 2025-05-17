"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CourseDistributionProps {
  courseDistributionData: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function LecturerCourseDistributionChart({ courseDistributionData }: CourseDistributionProps) {
  // Convert data for better formatting and consistent colors
  const formattedData = courseDistributionData.map((item, index) => ({
    name: item.name,
    value: item.value,
    // Generate colors based on primary with varying opacity
    color: `hsl(var(--primary)/${0.9 - (index * 0.15)})`
  }));

  const studentChartConfig = {
    students: {
      label: "Students",
      color: "hsl(var(--primary))"
    }
  };

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Course Enrollment Distribution</CardTitle>
        <CardDescription className="text-[10px]">Number of students per course</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={studentChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                nameKey="name"
                dataKey="value"
                name="students"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={35}
                paddingAngle={2}
                label={(entry) => entry.name}
                labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--background)" />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 