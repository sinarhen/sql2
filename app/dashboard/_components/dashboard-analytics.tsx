"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getGradeDistribution, getCoursePerformance, getPerformanceTrends, getAssignmentCompletionData } from "./actions";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Type definitions
type GradeDistribution = {
  range: string;
  count: number;
}

type CoursePerformance = {
  courseId: string;
  courseName: string;
  avgScore: number;
  submissions: number;
  maxScore: number;
  minScore: number;
}

type PerformanceTrend = {
  month: string;
  average: number;
  submissions: number;
}

type AssignmentCompletion = {
  assignmentId: string;
  assignmentName: string;
  courseId: string;
  courseName: string;
  deadline: number;
  submissionsCount: number;
  completionRate: number;
}

export function DashboardAnalytics() {
  const [gradeData, setGradeData] = useState<GradeDistribution[]>([]);
  const [courseData, setCourseData] = useState<CoursePerformance[]>([]);
  const [trendData, setTrendData] = useState<PerformanceTrend[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grades, courses, trends, assignments] = await Promise.all([
          getGradeDistribution(),
          getCoursePerformance(),
          getPerformanceTrends(),
          getAssignmentCompletionData()
        ]);
        
        setGradeData(grades);
        setCourseData(courses);
        setTrendData(trends);
        setAssignmentData(assignments);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-pulse text-sm text-muted-foreground">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="assignments">Assignment Completion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grades" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Grade Distribution</CardTitle>
              <CardDescription>Distribution of student grades across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Grade Distribution (Pie Chart)</CardTitle>
              <CardDescription>Percentage breakdown of grades by range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="range"
                      label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6' 
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Course Performance</CardTitle>
              <CardDescription>Average scores across different courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="courseName" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="avgScore" name="Average Score" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maxScore" name="Max Score" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="minScore" name="Min Score" fill="#ffc658" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Course Activity</CardTitle>
              <CardDescription>Number of submissions per course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="courseName" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="submissions" name="Submissions" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Performance Trends</CardTitle>
              <CardDescription>Average scores over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6' 
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="average"
                      name="Average Score"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Activity Trends</CardTitle>
              <CardDescription>Number of submissions over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6' 
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      name="Submissions"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Assignment Completion Rates</CardTitle>
              <CardDescription>Percentage of students who completed each assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={assignmentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="assignmentName" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        color: '#F3F4F6'
                      }} 
                      formatter={(value) => [`${value.toFixed(2)}%`, 'Completion Rate']}
                    />
                    <Legend />
                    <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {assignmentData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.completionRate > 75 ? '#4ade80' : entry.completionRate > 50 ? '#facc15' : '#ef4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Assignment List</CardTitle>
              <CardDescription>Details of all assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-800/50 text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Assignment</th>
                      <th scope="col" className="px-6 py-3">Course</th>
                      <th scope="col" className="px-6 py-3">Deadline</th>
                      <th scope="col" className="px-6 py-3">Submissions</th>
                      <th scope="col" className="px-6 py-3">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentData.map((assignment) => (
                      <tr key={assignment.assignmentId} className="border-b border-gray-700 hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-medium">{assignment.assignmentName}</td>
                        <td className="px-6 py-4">{assignment.courseName}</td>
                        <td className="px-6 py-4">{new Date(assignment.deadline).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{assignment.submissionsCount}</td>
                        <td className="px-6 py-4">
                          <Badge className={
                            assignment.completionRate > 75 
                              ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" 
                              : assignment.completionRate > 50 
                                ? "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30" 
                                : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                          }>
                            {assignment.completionRate.toFixed(2)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 