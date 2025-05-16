"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssignment } from "../../actions";

interface Course {
  id: string;
  name: string;
}

interface AddAssignmentFormProps {
  courses: Course[];
}

export function AddAssignmentForm({ courses }: AddAssignmentFormProps) {
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
      setName("");
      setDeadline("");
    } catch (error) {
      console.error("Failed to create assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card >
      <CardHeader>
        <CardTitle>Create a new assignment</CardTitle>
        <CardDescription>Create a new assignment for a course</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">You need to create a course first before adding assignments.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Assignment name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Select 
                  value={courseId} 
                  onValueChange={setCourseId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="datetime-local"
                  placeholder="Deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                size="sm"
                type="submit" 
                disabled={isSubmitting || !name.trim() || !courseId || !deadline}
              >
                Create Assignment
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 