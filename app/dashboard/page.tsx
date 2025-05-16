import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle } from '../../components/page-header';

export default function DashboardPage() {
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex justify-between items-center mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Dashboard Overview</PageHeaderTitle>
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
                  <span className="text-primary">Student Performance</span>
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-primary/20 text-primary">+4.2%</Badge>
                </CardTitle>
                <CardDescription className="text-[10px]">Weekly improvement across all courses</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Average Grade</span>
                    <span className="font-medium text-primary">87.3%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '87.3%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="motion-preset-blur-up-sm motion-duration-500 motion-delay-200">
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm tracking-tight flex items-center text-purple-600">
                  Course Completion
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-purple-500/20 ">92%</Badge>
                </CardTitle>
                <CardDescription className="text-[10px]">Students on track to complete</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Current Progress</span>
                    <span className="font-medium text-purple-600">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="motion-preset-blur-right-sm motion-duration-500 motion-delay-300">
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm tracking-tight flex items-center">
                  <span className="text-blue-600">Active Students</span>
                  <Badge className="ml-2 px-2 py-0 text-[10px] rounded-xl bg-blue-500/20 text-blue-600">+12</Badge>
                </CardTitle>
                <CardDescription className="text-[10px]">New participants this week</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Engagement Rate</span>
                    <span className="font-medium text-blue-600">78.5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '78.5%' }}></div>
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
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] text-primary">GA</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Grade Analysis Complete</p>
                    <p className="text-[10px] text-muted-foreground">Mathematics 101 - Fall Semester</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-transparent">3h ago</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="motion-preset-blur-up-sm motion-duration-700 motion-delay-400">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs md:text-sm font-medium tracking-tight">Your Courses</h2>
          <Link href="/dashboard/courses">
            <Button size="sm" variant="ghost" className="text-xs text-primary">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 motion-stagger-children">
          {[
            { 
              title: "Mathematics 101", 
              progress: 85, 
              color: "primary",
              students: 32,
              completion: "85%"
            },
            { 
              title: "Biology Fundamentals", 
              progress: 67, 
              color: "purple",
              students: 28,
              completion: "67%"
            },
            { 
              title: "History of Science", 
              progress: 92, 
              color: "blue",
              students: 24,
              completion: "92%"
            }
          ].map((course, idx) => (
            <div key={idx} className={`motion-preset-blur-${idx === 0 ? 'left' : idx === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx+1)*100}`}>
              <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm flex justify-between">
                    <span className={`text-${course.color === "primary" ? "primary" : course.color + "-600"}`}>{course.title}</span>
                    <Badge className={`px-2 py-0 text-[10px] rounded-xl bg-${course.color === "primary" ? "primary" : course.color + "-500"}/20 text-${course.color === "primary" ? "primary" : course.color + "-600"}`}>
                      {course.completion}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-[10px]">{course.students} students enrolled</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${course.color === "primary" ? "primary" : course.color + "-600"} rounded-full`} 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-1 pb-3 flex justify-between">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`text-[10px] text-${course.color === "primary" ? "primary" : course.color + "-600"} p-0 h-auto`}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className={`rounded-xl text-[10px] px-3 py-1 h-6 bg-${course.color === "primary" ? "primary" : course.color + "-600"} hover:bg-${course.color === "primary" ? "primary" : course.color + "-700"}`}
                  >
                    Analyze
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 