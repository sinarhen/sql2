"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCourse } from "../../actions";

interface AddCourseFormProps {
  userId: string;
}

export function AddCourseForm({ userId }: AddCourseFormProps) {
  const [courseName, setCourseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    
    try {
      setIsSubmitting(true);
      await createCourse(courseName, userId);
      setCourseName("");
    } catch (error) {
      console.error("Failed to create course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className=" border-slate-700/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Create a new course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Course name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              className="rounded-xl"
              disabled={isSubmitting || !courseName.trim()}
            >
              Create
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 