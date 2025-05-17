import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle } from '@/components/page-header';
import { getPerformanceTrends, getStudentDashboardData, getStudentWeeklyMetrics, getGradeDistribution } from '../actions';

import { StudentGradeChart } from './charts/student-grade-chart';
import { StudentSubmissionChart } from './charts/student-submission-chart';
import { StudentGradeDistributionChart } from './charts/student-grade-distribution-chart';
import { StudentCoursePerformanceChart } from './charts/student-course-performance-chart';

interface StudentDashboardProps {
  userId: string;
}

export async function StudentDashboard({ userId }: StudentDashboardProps) {
  // Fetch dashboard data
  const [dashboardData, performanceTrends, weeklyMetrics, gradeDistribution] = await Promise.all([
    getStudentDashboardData(userId),
    getPerformanceTrends(),
    getStudentWeeklyMetrics(userId),
    getGradeDistribution()
  ]);
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex justify-between items-center mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Student Dashboard</PageHeaderTitle>
          </PageHeader>
          <Link href="/dashboard/courses">
            <Button size="sm" >
              <span className="mr-2">+</span>Explore Courses
            </Button>
          </Link>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 motion-stagger-children">
          <div className="motion-preset-blur-left-sm motion-duration-500 motion-delay-100">
            <Card>
              <CardHeader className="pb-2 ">
                <CardTitle>
                  <span>Your Performance</span>
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                    {weeklyMetrics.gradeChange}
                  </Badge>
                </CardTitle>
                <CardDescription>Weekly improvement across all courses</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">x
                  <div className="flex justify-between items-center text-xs">
                    <span>Average Grade</span>
                    <span className="font-medium text-primary">{dashboardData.performance.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${dashboardData.performance.value}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="motion-preset-blur-up-sm motion-duration-500 motion-delay-200">
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle>
                  Course Completion
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                    {weeklyMetrics.submissionsChange}
                  </Badge>
                </CardTitle>
                <CardDescription>Your progress on course requirements</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Current Progress</span>
                    <span className="font-medium text-primary">{dashboardData.completion.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${dashboardData.completion.rate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="motion-preset-blur-right-sm motion-duration-500 motion-delay-300">
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle>
                  <span className="text-primary">Class Activity</span>
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                    +{dashboardData.engagement.activeStudents}
                  </Badge>
                </CardTitle>
                <CardDescription>Recent student submissions</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Engagement Rate</span>
                    <span className="font-medium text-primary">{dashboardData.engagement.rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${dashboardData.engagement.rate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="mb-10 motion-preset-blur-up-sm motion-duration-600 motion-delay-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Grades Chart */}
          <StudentGradeChart performanceTrends={performanceTrends} />

          {/* Assignments Submissions Chart */}
          <StudentSubmissionChart performanceTrends={performanceTrends} />

          {/* Grade Distribution Chart */}
          <StudentGradeDistributionChart gradeDistribution={gradeDistribution} />

          {/* Course involvement chart */}
          <StudentCoursePerformanceChart courses={dashboardData.courses} />
        </div>
      </div>
      
      <div className="mb-10 motion-preset-blur-up-sm motion-duration-600 motion-delay-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xs md:text-sm font-medium mb-4 tracking-tight">Recent Activity</h2>
          <Link href="/dashboard/my-submissions">
            <Button size="sm" variant="ghost" className="text-xs text-primary">View All</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-4">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-xs text-muted-foreground">No recent activity found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] text-primary">
                        {activity.studentName.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">
                        {activity.rating !== null 
                          ? `Grade: ${activity.rating}%`
                          : 'Assignment Submitted'
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        <Link href={`/dashboard/courses/${activity.assignmentId}`} className="hover:underline">
                          {activity.courseName}
                        </Link> - {' '}
                        <Link href={`/dashboard/assignments/${activity.assignmentId}`} className="hover:underline">
                          {activity.assignmentName}
                        </Link>
                      </p>
                    </div>
                    <Link href={`/dashboard/assignments/${activity.assignmentId}/submissions/${activity.id}`}>
                      <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-xl">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-10 motion-preset-blur-up-sm motion-duration-650 motion-delay-350">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs md:text-sm font-medium tracking-tight">Upcoming Assignments</h2>
          <Link href="/dashboard/assignments">
            <Button size="sm" variant="ghost" className="text-xs text-primary">View All</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-4">
            {!dashboardData.upcomingAssignments || dashboardData.upcomingAssignments.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-xs text-muted-foreground">No upcoming assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] text-primary">AS</span>
                    </div>
                    <div className="flex-1">
                      <Link href={`/dashboard/assignments/${assignment.id}`}>
                        <p className="text-xs font-medium hover:underline">{assignment.name}</p>
                      </Link>
                      <Link href={`/dashboard/courses/${assignment.courseId}`}>
                        <p className="text-[10px] text-muted-foreground hover:underline">{assignment.courseName}</p>
                      </Link>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <Badge variant="outline" className="text-[10px] bg-transparent">
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </Badge>
                      <Badge 
                        variant={Boolean(assignment.isCompleted) ? "secondary" : "outline"} 
                        className={`text-[10px] mt-1 px-2 py-0 rounded-xl ${
                          Boolean(assignment.isCompleted) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {Boolean(assignment.isCompleted) ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="motion-preset-blur-up-sm motion-duration-700 motion-delay-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs md:text-sm font-medium tracking-tight">Your Courses</h2>
          <Link href="/dashboard/my-courses">
            <Button size="sm" variant="ghost" className="text-xs text-primary">View All</Button>
          </Link>
        </div>
        
        {dashboardData.courses.length === 0 ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-xs text-muted-foreground mb-3">You haven&apos;t enrolled in any courses yet</p>
                <Link href="/dashboard/courses">
                  <Button 
                    size="sm" 
                    className="rounded-xl text-[10px] px-3 py-1 h-7 bg-primary hover:bg-primary/90"
                  >
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 motion-stagger-children">
            {dashboardData.courses.map((course, idx) => (
              <div key={course.id} className={`motion-preset-blur-${idx === 0 ? 'left' : idx === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx+1)*100}`}>
                <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle>
                      <Link href={`/dashboard/courses/${course.id}`} className="hover:underline">
                        <span className="text-primary">{course.title}</span>
                      </Link>
                      <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                        {course.completion}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{course.students} students enrolled</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 pb-3 flex justify-between">
                    <Link href={`/dashboard/courses/${course.id}/syllabus`}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[10px] text-primary p-0 h-auto"
                      >
                        Syllabus
                      </Button>
                    </Link>
                    <Link href={`/dashboard/courses/${course.id}/assignments`}>
                      <Button 
                        size="sm" 
                        className="rounded-xl text-[10px] px-3 py-1 h-6 bg-primary hover:bg-primary/90"
                      >
                        Assignments
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 