"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AssignmentCompletionProps {
  assignmentCompletion: {
    assignmentId: string;
    assignmentName: string;
    courseId: string;
    courseName: string;
    deadline: string | Date;
    submissionsCount: number;
    completionRate: number;
  }[];
}

export function LecturerAssignmentCompletionChart({ assignmentCompletion }: AssignmentCompletionProps) {
  const submissionChartConfig = {
    completionRate: {
      label: "Completion Rate",
      color: "hsl(var(--primary))"
    }
  };

  const chartData = assignmentCompletion.slice(0, 5).map(assignment => ({
    name: assignment.assignmentName,
    completionRate: Number(assignment.completionRate.toFixed(1)),
    submissions: Number(assignment.submissionsCount)
  }));

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Assignment Completion Rates</CardTitle>
        <CardDescription className="text-[10px]">Percentage of students completing each assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={submissionChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={chartData}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                type="number"
                tickLine={false} 
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                tickLine={false} 
                tickMargin={8}
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'var(--border)' }}
                width={90}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                cursor={{ fill: 'hsl(var(--primary)/10)' }}
              />
              <Bar 
                dataKey="completionRate"
                name="completionRate"
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]} 
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 