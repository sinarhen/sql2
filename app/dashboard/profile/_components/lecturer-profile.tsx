import Link from 'next/link';
import { getUserById, getLecturerCourses, getGradeDistribution, getCoursePerformance } from '@/app/dashboard/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle } from '@/components/page-header';

interface LecturerProfileProps {
  userId: string;
}

export async function LecturerProfile({ userId }: LecturerProfileProps) {
  // Fetch user data
  const user = await getUserById(userId);
  const lecturerCourses = await getLecturerCourses(userId);
  const gradeDistribution = await getGradeDistribution();
  const coursePerformance = await getCoursePerformance();
  
  // Calculate statistics
  const totalStudents = lecturerCourses.reduce((sum, course) => {
    // @ts-expect-error - assuming studentCount is available in the actual data
    return sum + (course.studentCount || 0);
  }, 0);
  const totalCourses = lecturerCourses.length;
  
  // Calculate average grade across all courses
  const coursesWithGrades = coursePerformance.filter(course => course.avgScore !== null);
  const averageGrade = coursesWithGrades.length > 0
    ? Math.round(
        coursesWithGrades.reduce((sum, course) => sum + Number(course.avgScore || 0), 0) / 
        coursesWithGrades.length
      )
    : 0;
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <PageHeader className="mb-6">
          <PageHeaderTitle>Lecturer Profile</PageHeaderTitle>
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
          
          {/* Teaching Stats */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                    Courses
                  </CardTitle>
                  <CardDescription className="text-[10px]">Total courses you teach</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-medium text-primary">{totalCourses}</span>
                    <span className="text-[10px] text-muted-foreground">Active Courses</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                    Students
                  </CardTitle>
                  <CardDescription className="text-[10px]">Total students enrolled</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-medium text-primary">{totalStudents}</span>
                    <span className="text-[10px] text-muted-foreground">Across all courses</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                    Average Grade
                  </CardTitle>
                  <CardDescription className="text-[10px]">Student performance</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-medium text-primary">{averageGrade}%</span>
                    <span className="text-[10px] text-muted-foreground">Across all courses</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Grade Distribution */}
            <Card className="overflow-hidden border-border/40 shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm tracking-tight text-primary">
                  Grade Distribution
                </CardTitle>
                <CardDescription className="text-[10px]">Student performance across all courses</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {gradeDistribution.map((grade) => (
                    <div key={grade.range} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span>{grade.range}%</span>
                        <span className="font-medium text-primary">{grade.count} students</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (grade.count / Math.max(...gradeDistribution.map(g => g.count), 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Courses Taught */}
        <div className="mb-10 motion-preset-blur-up-sm motion-duration-600 motion-delay-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs md:text-sm font-medium tracking-tight">Your Courses</h2>
            <Link href="/dashboard/courses/create">
              <Button size="sm" variant="ghost" className="text-xs text-primary">Create New</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-4">
              {lecturerCourses.length > 0 ? (
                <div className="space-y-4">
                  {lecturerCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] text-primary">
                          {course.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <p className="text-xs font-medium hover:underline">{course.name}</p>
                        </Link>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant="outline" className="text-[10px] bg-transparent py-0">
                            {/* @ts-expect-error - assuming studentCount is available in the actual data */}
                            {course.studentCount || 0} Students
                          </Badge>
                          <Badge variant="outline" className="text-[10px] bg-transparent py-0">
                            {/* @ts-expect-error - assuming assignmentCount is available in the actual data */}
                            {course.assignmentCount || 0} Assignments
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-xl">
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/assignments/create?courseId=${course.id}`}>
                          <Button size="sm" className="text-[10px] h-7 rounded-xl">
                            Add Assignment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground mb-2">You haven&apos;t created any courses yet</p>
                  <Link href="/dashboard/courses/create">
                    <Button size="sm" className="text-[10px] rounded-xl">
                      Create Your First Course
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Course Performance */}
        <div className="mb-10 motion-preset-blur-up-sm motion-duration-650 motion-delay-350">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs md:text-sm font-medium tracking-tight">Course Performance</h2>
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-xs text-primary">View Dashboard</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-4">
              {coursePerformance.length > 0 ? (
                <div className="space-y-4">
                  {coursePerformance.map((course) => (
                    <div key={course.courseId} className="flex items-center gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] text-primary">
                          {course.courseName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Link href={`/dashboard/courses/${course.courseId}`}>
                          <p className="text-xs font-medium hover:underline">{course.courseName}</p>
                        </Link>
                        <div className="flex space-x-4 mt-1">
                          <p className="text-[10px] text-muted-foreground">
                            Avg: <span className="text-primary font-medium">{Math.round(Number(course.avgScore))}%</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Min: <span className="text-red-500 font-medium">{Math.round(Number(course.minScore))}%</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Max: <span className="text-green-500 font-medium">{Math.round(Number(course.maxScore))}%</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            <span className="font-medium">{course.submissions}</span> Submissions
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/courses/${course.courseId}`}>
                        <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-xl">
                          Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No performance data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 