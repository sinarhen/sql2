import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, BookOpenIcon, UsersIcon, ClockIcon, CheckCircleIcon, BarChart3Icon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAssignmentDetails } from "../../actions";

export default async function AssignmentDetailsPage({ params }: { params: { assignmentId: string } }) {
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
  
  const assignmentDetails = await getAssignmentDetails(params.assignmentId);
  
  if (!assignmentDetails) {
    notFound();
  }

  const isLecturerOrAdmin = userResult.role === "lecturer" || userResult.role === "admin";
  const isStudent = userResult.role === "student";
  
  // Check if this student has submitted this assignment
  const studentSubmission = isStudent 
    ? assignmentDetails.submissions.find(sub => sub.student.id === userResult.id)
    : null;
  
  // For lecturers/admins, get submission stats
  const { stats } = assignmentDetails;
  const submittedPercentage = stats.totalStudents > 0 
    ? Math.round((stats.submittedCount / stats.totalStudents) * 100) 
    : 0;
  
  const ratedPercentage = stats.submittedCount > 0 
    ? Math.round((stats.ratedCount / stats.submittedCount) * 100) 
    : 0;
  
  // Calculate average grade if there are rated submissions
  const ratedSubmissions = assignmentDetails.submissions.filter(sub => sub.rating !== null);
  const averageGrade = ratedSubmissions.length > 0
    ? Math.round(ratedSubmissions.reduce((sum, sub) => sum + (sub.rating || 0), 0) / ratedSubmissions.length)
    : null;
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>{assignmentDetails.name}</PageHeaderTitle>
            <PageHeaderDescription>
              Course: <Link href={`/dashboard/courses/${assignmentDetails.course.id}`} className="underline hover:text-primary">
                {assignmentDetails.course.name}
              </Link>
            </PageHeaderDescription>
          </PageHeader>
          
          <div className="flex gap-2">
            <Link href={`/dashboard/courses/${assignmentDetails.course.id}`}>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-xl text-xs"
              >
                Back to Course
              </Button>
            </Link>
            
            {isStudent && !studentSubmission && (
              <Link href={`/dashboard/assignments/${params.assignmentId}/submit`}>
                <Button 
                  size="sm" 
                  className="rounded-xl text-xs"
                >
                  Submit Assignment
                </Button>
              </Link>
            )}
            
            {isLecturerOrAdmin && (
              <Link href={`/dashboard/assignments/${params.assignmentId}/grade`}>
                <Button 
                  size="sm" 
                  className="rounded-xl text-xs"
                >
                  Grade Submissions
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Assignment Info Card */}
          <Card className="glass-card border-border/40 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex justify-between items-center">
                <span>Assignment Information</span>
                <Badge 
                  className={`rounded-xl text-[10px] ${
                    new Date(assignmentDetails.deadline) < new Date() 
                      ? "bg-red-500/20 text-red-500" 
                      : "bg-green-500/20 text-green-500"
                  }`}
                >
                  {new Date(assignmentDetails.deadline) < new Date() ? "Past Due" : "Active"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-[10px]">Details about this assignment</CardDescription>
            </CardHeader>
            <CardContent className="text-[10px] space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Created Date</p>
                  <p className="font-medium">{new Date(assignmentDetails.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ClockIcon size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">{new Date(assignmentDetails.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <UsersIcon size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Total Students</p>
                  <p className="font-medium">{stats.totalStudents}</p>
                </div>
              </div>
              
              {isLecturerOrAdmin && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon size={12} className="text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{stats.submittedCount} of {stats.totalStudents} ({submittedPercentage}%)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BarChart3Icon size={12} className="text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Graded</p>
                      <p className="font-medium">{stats.ratedCount} of {stats.submittedCount} ({ratedPercentage}%)</p>
                    </div>
                  </div>
                  
                  {averageGrade !== null && (
                    <div className="flex items-center gap-2">
                      <BookOpenIcon size={12} className="text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Average Grade</p>
                        <p className="font-medium">{averageGrade}/100</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Submission Status Card */}
          {isStudent && (
            <Card className="glass-card border-border/40 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Your Submission Status</CardTitle>
                <CardDescription className="text-[10px]">Details about your assignment submission</CardDescription>
              </CardHeader>
              <CardContent>
                {!studentSubmission ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 p-3 rounded-xl text-xs">
                    <p className="font-medium">Not Submitted</p>
                    <p className="text-[10px] mt-1">
                      {new Date(assignmentDetails.deadline) < new Date() 
                        ? "This assignment is past due. Contact your instructor for late submission options."
                        : "You haven't submitted this assignment yet. The deadline is " + 
                          new Date(assignmentDetails.deadline).toLocaleDateString() + "."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-3 rounded-xl text-xs">
                      <p className="font-medium">Submitted</p>
                      <p className="text-[10px] mt-1">
                        You submitted this assignment on {new Date(studentSubmission.submission).toLocaleString()}.
                      </p>
                    </div>
                    
                    {studentSubmission.rating !== null ? (
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 p-3 rounded-xl text-xs">
                        <p className="font-medium">Grade: {studentSubmission.rating}/100</p>
                        <p className="text-[10px] mt-1">
                          Your submission has been graded.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-500/10 border border-slate-500/20 text-slate-600 p-3 rounded-xl text-xs">
                        <p className="font-medium">Not Graded Yet</p>
                        <p className="text-[10px] mt-1">
                          Your submission is waiting to be graded by the instructor.
                        </p>
                      </div>
                    )}
                    
                    <div className="border border-border/40 rounded-xl p-3">
                      <p className="text-xs font-medium mb-2">Your Submission</p>
                      <div className="text-[10px] bg-background/50 p-2 rounded-md">
                        {studentSubmission.content || "No content submitted."}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link href={`/dashboard/assignments/submissions/${studentSubmission.id}`}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-[10px] rounded-xl"
                          >
                            View Full Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Submission Stats Card for Lecturer/Admin */}
          {isLecturerOrAdmin && (
            <Card className="glass-card border-border/40 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Submission Statistics</CardTitle>
                <CardDescription className="text-[10px]">Overview of student submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                    <p className="text-xs font-medium text-blue-600">Submission Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{submittedPercentage}%</p>
                    <p className="text-[10px] text-blue-600/80">
                      {stats.submittedCount} out of {stats.totalStudents} students
                    </p>
                    <div className="w-full h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${submittedPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <p className="text-xs font-medium text-green-600">Grading Progress</p>
                    <p className="text-2xl font-bold text-green-600">{ratedPercentage}%</p>
                    <p className="text-[10px] text-green-600/80">
                      {stats.ratedCount} out of {stats.submittedCount} submissions
                    </p>
                    <div className="w-full h-1.5 bg-green-200 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full" 
                        style={{ width: `${ratedPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {stats.submittedCount > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium mb-2">Recent Submissions</p>
                    <div className="space-y-2">
                      {assignmentDetails.submissions.slice(0, 5).map(submission => (
                        <div 
                          key={submission.id} 
                          className="p-2 rounded-xl border border-border/40 bg-background/50 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-xs font-medium">{submission.student.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Submitted: {new Date(submission.submission).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {submission.rating !== null ? (
                              <Badge className="rounded-xl bg-green-500/20 text-green-600">
                                {submission.rating}/100
                              </Badge>
                            ) : (
                              <Badge className="rounded-xl bg-yellow-500/20 text-yellow-600">
                                Not Graded
                              </Badge>
                            )}
                            <Link href={`/dashboard/assignments/submissions/${submission.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-xl text-[10px] h-6"
                              >
                                View Submission
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {assignmentDetails.submissions.length > 5 && (
                        <div className="text-center">
                          <Link href={`/dashboard/assignments/${params.assignmentId}/submissions`}>
                            <Button 
                              size="sm" 
                              variant="link" 
                              className="text-[10px]"
                            >
                              View all {assignmentDetails.submissions.length} submissions
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
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