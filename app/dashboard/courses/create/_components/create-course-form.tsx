"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCourse } from "@/app/dashboard/actions";

interface CreateCourseFormProps {
  lecturerId: string;
}

export function CreateCourseForm({ lecturerId }: CreateCourseFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setIsSubmitting(true);
      await createCourse(name, lecturerId);
      router.push("/dashboard/courses");
    } catch (error) {
      console.error("Failed to create course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="glass-card border-border/40">
      <CardHeader>
        <CardTitle className="text-xs">Create a new course</CardTitle>
        <CardDescription className="text-[10px]">Enter the details for your new course</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              type="text"
              placeholder="Course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-8 text-xs rounded-xl bg-background border border-border/40"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              size="sm"
              type="submit" 
              className="rounded-xl text-xs"
              disabled={isSubmitting || !name.trim()}
            >
              Create Course
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 