"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { submitAssignment, gradeAssignment } from "../actions";

interface Assignment {
  id: string;
  name: string;
  courseId: string;
  deadline: Date;
}

interface Course {
  id: string;
  name: string;
}

interface AssignmentsListProps {
  assignments: Assignment[];
  courses: Course[];
  userRole: string;
  userId: string;
}

export function AssignmentsList({ assignments, courses, userRole, userId }: AssignmentsListProps) {
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, number>>({});
  
  const getCourseById = (courseId: string) => {
    return courses.find(course => course.id === courseId)?.name || "Unknown Course";
  };
  
  const handleSubmit = async (assignmentId: string) => {
    const content = submissions[assignmentId];
    if (!content?.trim()) return;
    
    setSubmitting(prev => ({ ...prev, [assignmentId]: true }));
    try {
      await submitAssignment({
        assignmentId,
        studentId: userId,
        content
      });
      // Clear the submission after successful submit
      setSubmissions(prev => ({ ...prev, [assignmentId]: "" }));
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };
  
  const handleGrade = async (assignmentId: string, studentId: string) => {
    const rating = grades[`${assignmentId}-${studentId}`];
    if (rating === undefined || rating < 0 || rating > 100) return;
    
    setSubmitting(prev => ({ ...prev, [`${assignmentId}-${studentId}`]: true }));
    try {
      await gradeAssignment({
        assignmentId,
        studentId,
        rating
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [`${assignmentId}-${studentId}`]: false }));
    }
  };
  
  return (
    <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {userRole === "lecturer" ? "Assignments to Grade" : "Your Assignments"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {userRole === "lecturer" 
              ? "You haven't created any assignments yet." 
              : "You don't have any assignments."}
          </p>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => (
              <Card key={assignment.id} className="border border-slate-700/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-medium">{assignment.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Course: {getCourseById(assignment.courseId)}
                      </p>
                    </div>
                    <Badge 
                      variant={new Date(assignment.deadline) > new Date() ? "outline" : "destructive"}
                      className="text-[10px]"
                    >
                      {new Date(assignment.deadline) > new Date() 
                        ? `Due ${new Date(assignment.deadline).toLocaleDateString()}` 
                        : "Overdue"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {userRole === "student" ? (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Your submission"
                        value={submissions[assignment.id] || ""}
                        onChange={(e) => setSubmissions(prev => ({ 
                          ...prev, 
                          [assignment.id]: e.target.value 
                        }))}
                        className="w-full"
                        disabled={submitting[assignment.id]}
                      />
                      <div className="flex justify-end">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="text-xs rounded-xl"
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={submitting[assignment.id] || !submissions[assignment.id]?.trim()}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      <p>View and grade student submissions for this assignment.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs rounded-xl"
                        onClick={() => {}}
                      >
                        View Submissions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 