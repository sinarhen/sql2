"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface LecturerGradeTrendProps {
  performanceTrends: {
    month: string;
    average: string | number;
    submissions: number;
  }[];
}

export function LecturerGradeTrendChart({ performanceTrends }: LecturerGradeTrendProps) {
  const gradeChartConfig = {
    average: {
      label: "Average Grade",
      color: "hsl(var(--primary))"
    }
  };

  // Ensure data points are numbers for the chart to render properly
  const formattedData = performanceTrends.map(item => ({
    ...item,
    average: typeof item.average === 'string' ? parseFloat(item.average) : item.average
  }));

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Student Performance Trends</CardTitle>
        <CardDescription className="text-[10px]">Average grade over time across all courses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gradeChartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
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
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                name="average"
                strokeWidth={2} 
                dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))' }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'white', strokeWidth: 2 }} 
                stroke="hsl(var(--primary))" 
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 