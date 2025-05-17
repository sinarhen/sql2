"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StudentSubmissionChartProps {
  performanceTrends: {
    month: string;
    average: string | number;
    submissions: number;
  }[];
}

export function StudentSubmissionChart({ performanceTrends }: StudentSubmissionChartProps) {
  const submissionChartConfig = {
    submissions: {
      label: "Submissions",
      color: "hsl(var(--primary))"
    }
  };

  // Format data to ensure numeric values
  const formattedData = performanceTrends.map(item => ({
    ...item,
    submissions: Number(item.submissions)
  }));

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle>
          <span className="text-primary">Assignment Submissions</span>
        </CardTitle>
        <CardDescription>Monthly submission activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={submissionChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
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
                dataKey="submissions" 
                name="submissions"
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