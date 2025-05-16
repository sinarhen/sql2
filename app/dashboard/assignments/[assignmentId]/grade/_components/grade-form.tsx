"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gradeAssignment } from "@/app/dashboard/actions";

interface GradeFormProps {
  assignmentId: string;
  studentId?: string;
}

export default function GradeForm({ assignmentId, studentId }: GradeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!studentId) {
      toast.error("Student ID is required");
      return;
    }

    if (rating < 0 || rating > 100) {
      toast.error("Grade must be between 0 and 100");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await gradeAssignment({
        assignmentId,
        studentId,
        rating,
      });
      
      toast.success("Grade submitted successfully");
      router.push(`/dashboard/assignments/${assignmentId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-xs">Grade (0-100)</Label>
        <Input
          id="rating"
          type="number"
          min={0}
          max={100}
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value, 10) || 0)}
          className="h-8 rounded-xl text-xs"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="sm" 
          disabled={isSubmitting}
          className="rounded-xl text-xs"
        >
          {isSubmitting ? "Submitting..." : "Submit Grade"}
        </Button>
      </div>
    </form>
  );
} 