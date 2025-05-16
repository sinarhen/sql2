import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3Icon, UserIcon, CheckCircleIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getSubmissionDetails } from "../../../actions";

export default async function SubmissionDetailsPage({ params }: { params: { submissionId: string } }) {
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
  
  const submissionDetails = await getSubmissionDetails(params.submissionId);
  
  if (!submissionDetails) {
    notFound();
  }
  
  const { submission, averageGrade, submissionCount, totalAssignments, completionRate } = submissionDetails;
  
  // Verify that the user has permission to view this submission
  // Only lecturer of the course, admin, or the student who submitted can view
  const isLecturerOrAdmin = userResult.role === "lecturer" || userResult.role === "admin";
  const isSubmitter = userResult.id === submission.studentId;
  
  if (!isLecturerOrAdmin && !isSubmitter) {
    redirect("/dashboard/assignments");
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <PageHeader className="mb-0">
          <PageHeaderTitle>Submission Details</PageHeaderTitle>
          <PageHeaderDescription>
            <span>Assignment: </span>
            <Link href={`/dashboard/assignments/${submission.assignmentId}`} className="underline hover:text-primary">
              {submission.assignment.name}
            </Link>
            <span> | Course: </span>
            <Link href={`/dashboard/courses/${submission.assignment.courseId}`} className="underline hover:text-primary">
              {submission.assignment.course.name}
            </Link>
          </PageHeaderDescription>
        </PageHeader>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/assignments/${submission.assignmentId}`}>
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-xl text-xs"
            >
              Back to Assignment
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Student Info Card */}
        <Card className="glass-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Student Information</CardTitle>
            <CardDescription className="text-[10px]">Details about the student</CardDescription>
          </CardHeader>
          <CardContent className="text-[10px] space-y-4">
            <div className="flex items-center gap-2">
              <UserIcon size={12} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Student Name</p>
                <p className="font-medium">{submission.student.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart3Icon size={12} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Average Grade in this Course</p>
                <p className="font-medium">{averageGrade !== null ? `${Math.round(averageGrade)}/100` : "No grades yet"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircleIcon size={12} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Assignments Completed</p>
                <p className="font-medium">{submissionCount} of {totalAssignments} ({Math.round(completionRate)}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Submission Info Card */}
        <Card className="glass-card border-border/40 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-xs">Submission Content</CardTitle>
                <CardDescription className="text-[10px]">Submitted on {new Date(submission.submission).toLocaleString()}</CardDescription>
              </div>
              {submission.rating !== null && (
                <Badge className="bg-blue-500/20 text-blue-600 rounded-xl">
                  Grade: {submission.rating}/100
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background/50 rounded-xl p-3 text-xs max-h-[300px] overflow-y-auto">
              {submission.content || "No content submitted."}
            </div>
            
            {/* Grading Section for lecturers */}
            {isLecturerOrAdmin && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-medium mb-2">Grading</p>
                {submission.rating !== null ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-600 rounded-xl">
                      Graded: {submission.rating}/100
                    </Badge>
                    <Link href={`/dashboard/assignments/${submission.assignmentId}/grade?student=${submission.studentId}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs rounded-xl h-7"
                      >
                        Update Grade
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={`/dashboard/assignments/${submission.assignmentId}/grade?student=${submission.studentId}`}>
                    <Button 
                      size="sm" 
                      className="text-xs rounded-xl h-7"
                    >
                      Grade Submission
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 