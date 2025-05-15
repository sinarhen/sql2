"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

interface CreateFormParams {
  name: string;
  end: number;
}

export async function createForm(params: CreateFormParams) {
  const { name, end } = params;
  
  const [newForm] = await db
    .insert(forms)
    .values({
      name,
      end: new Date(end),
    })
    .returning();

  revalidatePath("/dashboard/forms");
  return newForm;
}

interface SubmitFormParams {
  formId: string;
  userId: string;
  content: string;
}

export async function submitForm(params: SubmitFormParams) {
  const { formId, userId, content } = params;
  
  // Check if already submitted
  const existingSubmission = await db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.formId, formId),
      eq(formSubmissions.userId, userId)
    ),
  });

  if (existingSubmission) {
    // Update existing submission
    await db
      .update(formSubmissions)
      .set({
        content,
      })
      .where(
        and(
          eq(formSubmissions.formId, formId),
          eq(formSubmissions.userId, userId)
        )
      );
  } else {
    // Create new submission
    await db
      .insert(formSubmissions)
      .values({
        formId,
        userId,
        content,
      });
  }

  revalidatePath("/dashboard/forms");
  return { success: true };
}

export async function viewFormSubmissions(formId: string) {
  const submissions = await db.query.formSubmissions.findMany({
    where: eq(formSubmissions.formId, formId),
    with: {
      user: true,
    },
  });
  
  return submissions;
} 