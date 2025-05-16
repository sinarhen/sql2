"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssignment } from "../../actions";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
}

interface CreateAssignmentFormProps {
  courses: Course[];
}

export function CreateAssignmentForm({ courses }: CreateAssignmentFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseId || !deadline) return;
    
    try {
      setIsSubmitting(true);
      await createAssignment({
        name,
        courseId,
        deadline: new Date(deadline).getTime(),
      });
      
      toast.success("Assignment created successfully");
      router.push("/dashboard/assignments");
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs">Create a new assignment</CardTitle>
        <CardDescription className="text-[10px]">Create a new assignment for one of your courses</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-xs text-muted-foreground">You need to create a course first before adding assignments.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="text-xs text-muted-foreground mb-1 block">Assignment Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Assignment name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-8 text-xs rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="course" className="text-xs text-muted-foreground mb-1 block">Course</label>
                <Select 
                  value={courseId} 
                  onValueChange={setCourseId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="course" className="w-full h-8 text-xs rounded-xl">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id} className="text-xs">{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="deadline" className="text-xs text-muted-foreground mb-1 block">Deadline</label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  placeholder="Deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-8 text-xs rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl"
                  onClick={() => router.push("/dashboard/assignments")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  className="text-xs rounded-xl"
                  disabled={isSubmitting || !name.trim() || !courseId || !deadline}
                >
                  Create Assignment
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 