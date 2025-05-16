import Link from 'next/link';
import { getUserById, getUserCourses, getStudentAssignments } from '@/app/dashboard/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle } from '@/components/page-header';

interface StudentProfileProps {
  userId: string;
}

export async function StudentProfile({ userId }: StudentProfileProps) {
  // Fetch user data
  const user = await getUserById(userId);
  const userCourses = await getUserCourses(userId);
  const assignments = await getStudentAssignments(userId);
  
  // Calculate statistics
  const completedAssignments = assignments.filter(a => a.isCompleted).length;
  const totalAssignments = assignments.length;
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  
  const averageGrade = assignments.filter(a => a.submission?.rating !== null).length > 0
    ? Math.round(
        assignments
          .filter(a => a.submission?.rating !== null)
          .reduce((sum, a) => sum + (a.submission?.rating || 0), 0) / 
        assignments.filter(a => a.submission?.rating !== null).length
      )
    : 0;
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <PageHeader className="mb-6">
          <PageHeaderTitle>Your Profile</PageHeaderTitle>
        </PageHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Personal Information */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-[10px]">Your account details</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-medium text-primary">
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Full Name</p>
                    <p className="text-xs font-medium">{user?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Email</p>
                    <p className="text-xs font-medium">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Role</p>
                    <Badge variant="secondary" className="text-[10px] rounded-xl">
                      {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Member Since</p>
                    <p className="text-xs font-medium">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Academic Performance */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                    Course Completion
                  </CardTitle>
                  <CardDescription className="text-[10px]">Your progress on course requirements</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Completed</span>
                      <span className="font-medium text-primary">{completedAssignments}/{totalAssignments} assignments</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-right">{completionRate}% completion rate</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                    Average Grade
                  </CardTitle>
                  <CardDescription className="text-[10px]">Your academic performance</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Current Average</span>
                      <span className="font-medium text-primary">{averageGrade}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${averageGrade}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-right">Based on {assignments.filter(a => a.submission?.rating !== null).length} graded assignments</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Enrolled Courses */}
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                  Enrolled Courses
                </CardTitle>
                <CardDescription className="text-[10px]">Courses you are currently taking</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {userCourses.length > 0 ? (
                  <div className="space-y-3">
                    {userCourses.map((course) => (
                      <div key={course.id} className="flex justify-between items-center pb-2 border-b border-border/20 last:border-0">
                        <div>
                          <Link href={`/dashboard/courses/${course.id}`}>
                            <p className="text-xs font-medium hover:underline">{course.name}</p>
                          </Link>
                          <p className="text-[10px] text-muted-foreground">
                            {course.lecturerId && "Lecturer ID: " + course.lecturerId.substring(0, 8)}
                          </p>
                        </div>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-xl">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground mb-2">You are not enrolled in any courses yet</p>
                    <Link href="/dashboard/courses">
                      <Button size="sm" variant="outline" className="text-[10px] rounded-xl">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent Assignments */}
        <div className="mb-10 motion-preset-blur-up-sm motion-duration-600 motion-delay-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs md:text-sm font-medium tracking-tight">Recent Assignments</h2>
            <Link href="/dashboard/assignments">
              <Button size="sm" variant="ghost" className="text-xs text-primary">View All</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-4">
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.slice(0, 5).map((assignment) => (
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
                          variant={assignment.isCompleted ? "secondary" : "outline"} 
                          className={`text-[10px] mt-1 px-2 py-0 rounded-xl ${
                            assignment.isCompleted
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {assignment.isCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                        {assignment.submission?.rating !== null && (
                          <Badge className="text-[10px] mt-1 px-2 py-0 rounded-xl bg-primary/20 text-primary">
                            Grade: {assignment.submission?.rating}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No assignments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 