"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, YAxis, TooltipProps } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

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

  // Limit to top 4 assignments to prevent Y-axis crowding
  const chartData = assignmentCompletion
    .slice(0, 4)
    .map(assignment => ({
      // Truncate long assignment names to prevent Y-axis crowding
      name: assignment.assignmentName.length > 20 
        ? `${assignment.assignmentName.substring(0, 20)}...` 
        : assignment.assignmentName,
      fullName: assignment.assignmentName, // Keep full name for tooltip
      completionRate: Number(assignment.completionRate.toFixed(1)),
      submissions: Number(assignment.submissionsCount)
    }));

  // Custom tooltip to show full assignment name
  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as {
        fullName: string;
        completionRate: number;
      };
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/40 p-2 rounded-md shadow-sm text-xs">
          <p className="font-medium">{data.fullName}</p>
          <p>Completion Rate: {data.completionRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Assignment Completion Rates</CardTitle>
        <CardDescription className="text-[10px]">Percentage of students completing each assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={submissionChartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={chartData}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                type="number"
                tickLine={false} 
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                tickLine={false} 
                tickMargin={8}
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'var(--border)' }}
                width={120}
                interval={0}
              />
              <ChartTooltip 
                content={<CustomTooltip />}
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