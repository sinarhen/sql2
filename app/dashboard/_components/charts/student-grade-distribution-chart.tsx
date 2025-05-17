"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface GradeDistributionProps {
  gradeDistribution: {
    range: string;
    count: number;
  }[];
}

export function StudentGradeDistributionChart({ gradeDistribution }: GradeDistributionProps) {
  const gradeChartConfig = {
    distribution: {
      label: "Grade Range",
      color: "hsl(var(--primary))"
    }
  };

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Grade Distribution</CardTitle>
        <CardDescription className="text-[10px]">Distribution of grades across all courses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gradeChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="range" 
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
                dataKey="count" 
                name="distribution"
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