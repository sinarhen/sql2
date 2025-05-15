"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { enrollInCourse, unenrollFromCourse } from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EnrollButtonProps {
  courseId: string;
  userId: string;
  isEnrolled: boolean;
}

export default function EnrollButton({ courseId, userId, isEnrolled }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnrollAction = async () => {
    try {
      setIsLoading(true);
      
      if (isEnrolled) {
        // Unenroll
        const result = await unenrollFromCourse(courseId, userId);
        if (result.success) {
          toast.success("Successfully unenrolled from course");
          router.refresh(); // Refresh the current page to update UI
        }
      } else {
        // Enroll
        const result = await enrollInCourse(courseId, userId);
        if (result.success) {
          toast.success("Successfully enrolled in course");
          router.refresh(); // Refresh the current page to update UI
        } else {
          toast.error(result.message || "Failed to enroll in course");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      className="rounded-xl text-xs h-7"
      onClick={handleEnrollAction}
      disabled={isLoading}
      variant={isEnrolled ? "destructive" : "default"}
    >
      {isLoading 
        ? (isEnrolled ? "Unenrolling..." : "Enrolling...") 
        : (isEnrolled ? "Unenroll" : "Enroll Now")}
    </Button>
  );
} 