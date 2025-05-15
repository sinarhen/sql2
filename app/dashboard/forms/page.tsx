import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { forms, users } from "@/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "../_components/page-header";
import { FormsList } from "./_components/forms-list";
import { AddFormForm } from "./_components/add-form-form";

export default async function FormsPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult) {
    notFound();
  }
  
  // Get all forms
  const allForms = await db.query.forms.findMany({
    orderBy: forms.end,
  });
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderTitle>Feedback Forms</PageHeaderTitle>
        <PageHeaderDescription>Create and manage feedback forms for your courses</PageHeaderDescription>
      </PageHeader>
      
      {userResult.role === "lecturer" && (
        <AddFormForm />
      )}
      
      <FormsList 
        forms={allForms}
        userRole={userResult.role}
        userId={userResult.id}
      />
    </div>
  );
} 