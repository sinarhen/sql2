"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
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
    submissions: {
      label: "Submissions",
      color: "hsl(var(--chart-3))"
    },
    completionRate: {
      label: "Completion Rate",
      color: "hsl(var(--chart-4))"
    }
  };

  const chartData = assignmentCompletion.slice(0, 5).map(assignment => ({
    name: assignment.assignmentName,
    completionRate: Number(assignment.completionRate.toFixed(1)),
    submissions: Number(assignment.submissionsCount)
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Assignment Completion Rates</CardTitle>
        <CardDescription className="text-[10px]">Percentage of students completing each assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={submissionChartConfig} className="min-h-[200px] w-full">
          <BarChart 
            layout="vertical" 
            accessibilityLayer 
            data={chartData}
          >
            <CartesianGrid horizontal={false} />
            <XAxis 
              type="number"
              tickLine={false} 
              axisLine={false}
            />
            <XAxis 
              dataKey="name" 
              type="category"
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="completionRate"
              name="completionRate"
              fill="var(--color-completionRate)" 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 