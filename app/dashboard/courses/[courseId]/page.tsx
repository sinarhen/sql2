import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, BookOpenIcon, UsersIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { 
  getCourseById, 
  getCourseAssignments, 
  getCourseEnrollments 
} from "../../actions";
import EnrollButton from "../_components/enroll-button";

export default async function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult) {
    redirect("/auth/login");
  }
  
  const course = await getCourseById(params.courseId);
  
  if (!course) {
    notFound();
  }
  
  const assignments = await getCourseAssignments(params.courseId);
  
  // Check if the user is enrolled in the course
  const enrollments = await getCourseEnrollments(params.courseId);
  const isUserEnrolled = enrollments.some(enrollment => enrollment.userId === userResult.id);
  const isLecturerOrAdmin = userResult.role === "lecturer" || userResult.role === "admin";
  
  const students = isLecturerOrAdmin 
    ? enrollments
    : [];
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>{course.name}</PageHeaderTitle>
            <PageHeaderDescription>Course details and resources</PageHeaderDescription>
          </PageHeader>
          
          <div className="flex gap-2">
            <Link href="/dashboard/courses">
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-xl text-xs"
              >
                Back to Courses
              </Button>
            </Link>
            
            {!isUserEnrolled && userResult.role === "student" && (
              <EnrollButton courseId={params.courseId} userId={userResult.id} isEnrolled={false} />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Course Info Card */}
          <Card className="glass-card border-border/40 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex justify-between items-center">
                <span>Course Information</span>
                <Badge 
                  className="rounded-xl bg-primary/20 text-primary" 
                  variant="secondary"
                >
                  Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-[10px]">Details about this course</CardDescription>
            </CardHeader>
            <CardContent className="text-[10px] space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Created Date</p>
                  <p className="font-medium">{new Date(course.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpenIcon size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Total Assignments</p>
                  <p className="font-medium">{assignments.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <UsersIcon size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Enrolled Students</p>
                  <p className="font-medium">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Assignments Card */}
          <Card className="glass-card border-border/40 lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs">Course Assignments</CardTitle>
                {(isLecturerOrAdmin || isUserEnrolled) && (
                  <Link href="/dashboard/assignments">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-xs h-7"
                    >
                      View All Assignments
                    </Button>
                  </Link>
                )}
              </div>
              <CardDescription className="text-[10px]">Assignments for this course</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">No assignments available for this course yet.</p>
              ) : (
                <div className="space-y-2">
                  {assignments.slice(0, 5).map(assignment => (
                    <div 
                      key={assignment.id} 
                      className="p-2 rounded-xl border border-border/40 bg-background/50 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-medium">{assignment.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Due: {new Date(assignment.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      {(isLecturerOrAdmin || isUserEnrolled) && (
                        <Link href={`/dashboard/assignments/${assignment.id}`}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-xl text-[10px] h-6"
                          >
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                  
                  {assignments.length > 5 && (
                    <div className="text-center">
                      <Link href="/dashboard/assignments">
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="text-[10px]"
                        >
                          View {assignments.length - 5} more assignments
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Students Card (Only for lecturers/admins) */}
          {isLecturerOrAdmin && (
            <Card className="glass-card border-border/40 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Enrolled Students</CardTitle>
                <CardDescription className="text-[10px]">Students enrolled in this course</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No students enrolled in this course yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {students.map(enrollment => (
                      <div 
                        key={enrollment.id} 
                        className="p-2 rounded-xl border border-border/40 bg-background/50"
                      >
                        <p className="text-xs font-medium">{enrollment.user.name}</p>
                        <p className="text-[10px] text-muted-foreground">{enrollment.user.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 