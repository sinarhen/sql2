"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StudentGradeChartProps {
  performanceTrends: {
    month: string;
    average: string | number;
    submissions: number;
  }[];
}

export function StudentGradeChart({ performanceTrends }: StudentGradeChartProps) {
  const gradeChartConfig = {
    myGrade: {
      label: "My Grade",
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
        <CardTitle>
          <span className="text-primary">Average Grade Timeline</span>
        </CardTitle>
        <CardDescription>Your average grade over time</CardDescription>
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
                name="myGrade"
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