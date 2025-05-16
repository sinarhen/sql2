"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitAssignment } from "../../../../actions";
import { toast } from "sonner";
import { ClockIcon } from "lucide-react";

interface SubmitAssignmentFormProps {
  assignmentId: string;
  studentId: string;
  deadline: Date;
}

export function SubmitAssignmentForm({ 
  assignmentId, 
  studentId,
  deadline 
}: SubmitAssignmentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const isPastDeadline = new Date(deadline) < new Date();
  
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      await submitAssignment({
        assignmentId,
        studentId,
        content
      });
      
      toast.success("Assignment submitted successfully");
      router.push(`/dashboard/assignments/${assignmentId}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to submit assignment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card className="glass-card border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span>Submit Your Assignment</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ClockIcon size={12} />
            <span>Due: {new Date(deadline).toLocaleDateString()}</span>
          </div>
        </CardTitle>
        {isPastDeadline ? (
          <p className="text-[10px] text-red-500 mt-1">
            This assignment is past the deadline. Your submission might be considered late.
          </p>
        ): (
          <p className="text-[10px] text-muted-foreground mt-1">
            This assignment is still within the deadline.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter your submission content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] rounded-xl text-xs"
          disabled={submitting}
        />
        
        <div className="mt-2 text-[10px] text-muted-foreground">
          <p>Write your assignment submission above. You can include text, code, or any other content requested by your instructor.</p>
          <p className="mt-1">Once submitted, you cannot edit your submission, so please review carefully before submitting.</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          disabled={submitting}
          className="rounded-xl text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="rounded-xl text-xs"
        >
          Submit Assignment
        </Button>
      </CardFooter>
    </Card>
  );
} 