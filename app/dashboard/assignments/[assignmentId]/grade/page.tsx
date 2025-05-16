import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAssignmentDetails } from "../../../actions";
import GradeForm from "./_components/grade-form";

interface GradePageProps {
  params: {
    assignmentId: string;
  };
  searchParams: {
    student?: string;
  };
}

export default async function GradePage({ params, searchParams }: GradePageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult || (userResult.role !== "lecturer" && userResult.role !== "admin")) {
    redirect("/dashboard/assignments");
  }
  
  const assignmentDetails = await getAssignmentDetails(params.assignmentId);
  
  if (!assignmentDetails) {
    redirect("/dashboard/assignments");
  }
  
  return (
    <div>
      <PageHeader className="mb-6">
        <PageHeaderTitle>Grade Assignment</PageHeaderTitle>
        <PageHeaderDescription>
          Assignment: {assignmentDetails.name}
        </PageHeaderDescription>
      </PageHeader>
      
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">Grading</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <GradeForm 
            assignmentId={params.assignmentId} 
            studentId={searchParams.student} 
          />
        </CardContent>
      </Card>
    </div>
  );
} 