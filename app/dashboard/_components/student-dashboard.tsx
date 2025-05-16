import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle } from '@/components/page-header';
import { getStudentDashboardData } from '../actions';

interface StudentDashboardProps {
  userId: string;
}

export async function StudentDashboard({ userId }: StudentDashboardProps) {
  // Fetch dashboard data
  const dashboardData = await getStudentDashboardData(userId);
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex justify-between items-center mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Student Dashboard</PageHeaderTitle>
          </PageHeader>
          <Button size="sm" >
            <span className="mr-2">+</span>New Analysis
          </Button>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 motion-stagger-children">
          <div className="motion-preset-blur-left-sm motion-duration-500 motion-delay-100">
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2 ">
                <CardTitle className="text-xs md:text-sm tracking-tight flex items-center">
                  <span className="text-primary">Your Performance</span>
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                    {dashboardData.performance.improvement}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[10px]">Weekly improvement across all courses</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
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
                <CardTitle className="text-xs md:text-sm tracking-tight flex items-center text-primary">
                  Course Completion
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                    {dashboardData.completion.value}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[10px]">Your progress on course requirements</CardDescription>
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
                <CardTitle className="text-xs md:text-sm tracking-tight flex items-center">
                  <span className="text-primary">Class Activity</span>
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                    +{dashboardData.engagement.activeStudents}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[10px]">Recent student submissions</CardDescription>
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
      
      <div className="mb-10 motion-preset-blur-up-sm motion-duration-600 motion-delay-300">
        <h2 className="text-xs md:text-sm font-medium mb-4 tracking-tight">Recent Activity</h2>
        <Card>
          <CardContent className="p-4">
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
                    <p className="text-[10px] text-muted-foreground">{activity.courseName} - {activity.assignmentName}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-transparent">
                    {typeof activity.submission === 'object'
                      ? new Date(activity.submission).toLocaleDateString()
                      : new Date(activity.submission).toLocaleDateString()
                    }
                  </Badge>
                </div>
              ))}
            </div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 motion-stagger-children">
          {dashboardData.courses.map((course, idx) => (
            <div key={course.id} className={`motion-preset-blur-${idx === 0 ? 'left' : idx === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx+1)*100}`}>
              <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm flex justify-between">
                    <span className="text-primary">{course.title}</span>
                    <Badge className="px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">
                      {course.completion}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-[10px]">{course.students} students enrolled</CardDescription>
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
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-[10px] text-primary p-0 h-auto"
                  >
                    View Details
                  </Button>
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button 
                      size="sm" 
                      className="rounded-xl text-[10px] px-3 py-1 h-6 bg-primary hover:bg-primary/90"
                    >
                      Analyze
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 