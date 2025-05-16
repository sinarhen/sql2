"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, ExternalLinkIcon, BarChart3Icon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Assignment {
  id: string;
  name: string;
  courseId: string;
  deadline: Date;
  courseName?: string;
  isCompleted?: boolean;
  submission?: {
    id: string;
    rating: number | null;
    content: string | null;
  } | null;
}

interface Course {
  id: string;
  name: string;
}

interface AssignmentsListProps {
  assignments: Assignment[];
  courses: Course[];
  userRole: string;
  userId?: string;
}

export function AssignmentsList({ assignments, courses, userRole }: AssignmentsListProps) {
  const [activeTab, setActiveTab] = useState("all");
  
  const getCourseById = (courseId: string) => {
    return courses.find(course => course.id === courseId)?.name || 
      assignments.find(a => a.courseId === courseId)?.courseName || 
      "Unknown Course";
  };
  
  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return assignment.isCompleted;
    if (activeTab === "incomplete") return !assignment.isCompleted;
    return true;
  });
  
  const renderAssignmentsList = () => {
    if (assignments.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4 motion-preset-blur-up-sm motion-duration-500">
          {userRole === "lecturer" 
            ? "You haven't created any assignments yet." 
            : "You don't have any assignments."}
        </p>
      );
    }
    
    if (filteredAssignments.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4 motion-preset-blur-up-sm motion-duration-500">
          No assignments match your filter.
        </p>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredAssignments.map((assignment, idx) => (
          <Card 
            key={assignment.id} 
            className={`overflow-hidden motion-preset-blur-up-sm motion-duration-500 motion-delay-${(idx % 5) * 100} glass-card border-border/40 hover:shadow-md transition-all duration-300`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-medium text-xs flex items-center gap-2">
                    {assignment.name}
                    <div className="flex items-center gap-1.5">
                      {assignment.isCompleted && userRole === "student" && (
                        <Badge className="text-[10px] bg-green-500/20 text-green-600 rounded-xl">
                          <CheckIcon size={10} className="mr-1" />
                          Completed
                        </Badge>
                      )}
                      {userRole === "student" && assignment.isCompleted && assignment.submission && assignment.submission.rating !== null && (
                        <Badge className="text-[10px] bg-blue-500/20 text-blue-600 rounded-xl">
                          <BarChart3Icon size={10} className="mr-1" />
                          Grade: {assignment.submission.rating}/100
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Course: {assignment.courseName || getCourseById(assignment.courseId)}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge 
                    variant={new Date(assignment.deadline) > new Date() ? "outline" : "destructive"}
                    className="text-[10px]"
                  >
                    {new Date(assignment.deadline) > new Date() 
                      ? `Due ${new Date(assignment.deadline).toLocaleDateString()}` 
                      : "Overdue"}
                  </Badge>
                  <Link href={`/dashboard/assignments/${assignment.id}`}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ExternalLinkIcon size={12} />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {userRole === "student" && !assignment.isCompleted ? (
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    <p>Submit your work for this assignment.</p>
                  </div>
                  <Link href={`/dashboard/assignments/${assignment.id}/submit`}>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs rounded-xl"
                    >
                      Submit Assignment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {userRole === "student" ? (
                      assignment.submission && assignment.submission.rating !== null ? (
                        <p>Your grade: <span className="font-medium text-primary">{assignment.submission.rating}/100</span></p>
                      ) : (
                        <p>View your submission and feedback.</p>
                      )
                    ) : (
                      <p>View and grade student submissions for this assignment.</p>
                    )}
                  </div>
                  <Link href={`/dashboard/assignments/${assignment.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-xl"
                    >
                      {userRole === "student" ? "View Submission" : "View Submissions"}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {userRole === "student" && assignments.length > 0 && (
        <Tabs defaultValue="all" className="mb-4 motion-preset-blur-up-sm motion-duration-500" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-background/50 ">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
            <TabsTrigger value="incomplete" className="text-xs">Incomplete</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {renderAssignmentsList()}
    </div>
  );
} 