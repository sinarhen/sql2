import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, PieChartIcon, BarChart3Icon } from "lucide-react";
import { auth } from "@/lib/auth";
import { canSubmitAssignment, getSubmissionPageData } from "../../../actions";
import { SubmitAssignmentForm } from "./_components/submit-form";

export default async function SubmitAssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const paramsAwaited = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Get submission data with all the necessary checks
  const data = await getSubmissionPageData(paramsAwaited.assignmentId, session.user.id);
  
  if ('error' in data) {
    if (data.error === "Assignment not found") {
      notFound();
    } else {
      redirect("/dashboard/assignments");
    }
  }
  
  // Check if student can submit
  const canSubmit = await canSubmitAssignment(paramsAwaited.assignmentId, session.user.id);
  
  // If student can't submit, redirect to assignment details
  if (!canSubmit.canSubmit) {
    redirect(`/dashboard/assignments/${paramsAwaited.assignmentId}`);
  }
  
  const { user, assignment, courseProgress, recentSubmissions } = data;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader className="mb-0">
          <PageHeaderTitle>Submit Assignment</PageHeaderTitle>
          <PageHeaderDescription>
            {assignment.name} - {assignment.course.name}
          </PageHeaderDescription>
        </PageHeader>
        
        <Link href={`/dashboard/assignments/${paramsAwaited.assignmentId}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl text-xs"
          >
            Back to Assignment
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SubmitAssignmentForm 
            assignmentId={paramsAwaited.assignmentId}
            studentId={user.id}
            deadline={assignment.deadline}
          />
        </div>
        
        <div className="space-y-4">
          {/* Course Info Card */}
          <Card className="glass-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Course Information</CardTitle>
              <CardDescription className="text-[10px]">Details about {assignment.course.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <BookOpenIcon size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-[10px]">Course</p>
                  <Link 
                    href={`/dashboard/courses/${assignment.course.id}`}
                    className="font-medium hover:text-primary transition"
                  >
                    {assignment.course.name}
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <BarChart3Icon size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-[10px]">Your Progress</p>
                  <p className="font-medium">
                    {courseProgress.completedAssignments} of {courseProgress.totalAssignments} Assignments
                  </p>
                  <div className="w-full bg-background/80 h-1.5 rounded-full mt-1">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${courseProgress.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {courseProgress.averageGrade !== null && (
                <div className="flex items-center gap-2">
                  <PieChartIcon size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-[10px]">Average Grade</p>
                    <p className="font-medium">{Math.round(courseProgress.averageGrade)}/100</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Submissions */}
          {recentSubmissions.length > 0 && (
            <Card className="glass-card border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Recent Submissions</CardTitle>
                <CardDescription className="text-[10px]">Your recent assignment submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentSubmissions.map(submission => (
                  <div key={submission.id} className="border-b border-border/40 last:border-0 pb-2 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium">{submission.assignment.name}</p>
                        <p className="text-[10px] text-muted-foreground">{submission.assignment.course.name}</p>
                      </div>
                      {submission.rating !== null && (
                        <Badge 
                          className={`text-[10px] rounded-xl ${
                            submission.rating >= 80 ? "bg-green-500/20 text-green-600" : 
                            submission.rating >= 60 ? "bg-yellow-500/20 text-yellow-600" : 
                            "bg-red-500/20 text-red-600"
                          }`}
                        >
                          {submission.rating}/100
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Submitted {new Date(submission.submission).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 