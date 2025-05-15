"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { enrollInCourse, unenrollFromCourse } from "../../actions";

interface Course {
  id: string;
  name: string;
  createdAt: Date;
}

interface CoursesListProps {
  courses: Course[];
  userRole: string;
  userId: string;
  enrolledCourseIds: string[];
}

export function CoursesList({ courses, userRole, userId, enrolledCourseIds }: CoursesListProps) {
  const [enrolling, setEnrolling] = useState<Record<string, boolean>>({});
  
  const handleEnroll = async (courseId: string) => {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await enrollInCourse(courseId, userId);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };
  
  const handleUnenroll = async (courseId: string) => {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await unenrollFromCourse(courseId, userId);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };
  
  return (
    <Card className=" border-slate-700/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {userRole === "lecturer" ? "Your Courses" : "Available Courses"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <Card key={course.id} className="border border-slate-700/20 overflow-hidden">
                <CardHeader className="pb-2 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{course.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {userRole === "student" && (
                    enrolledCourseIds.includes(course.id) ? (
                      <Badge className="ml-auto" variant="outline">Enrolled</Badge>
                    ) : null
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end">
                    {userRole === "lecturer" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs rounded-xl"
                        onClick={() => {}}
                      >
                        Manage
                      </Button>
                    ) : (
                      enrolledCourseIds.includes(course.id) ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="text-xs rounded-xl"
                          onClick={() => handleUnenroll(course.id)}
                          disabled={enrolling[course.id]}
                        >
                          Unenroll
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="text-xs rounded-xl"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling[course.id]}
                        >
                          Enroll
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 