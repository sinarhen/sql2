"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { unenrollFromCourse } from "../../my-courses/actions";
import { useState } from "react";

interface Course {
  id: string;
  name: string;
  createdAt: Date;
}

interface MyCoursesListProps {
  courses: Course[];
  userId: string;
}

export function MyCoursesList({ courses, userId }: MyCoursesListProps) {
  const [unenrolling, setUnenrolling] = useState<Record<string, boolean>>({});
  
  const handleUnenroll = async (courseId: string) => {
    setUnenrolling(prev => ({ ...prev, [courseId]: true }));
    try {
      await unenrollFromCourse(courseId, userId);
    } finally {
      setUnenrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };
  
  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Your Enrolled Courses</CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">You are not enrolled in any courses yet.</p>
            <Button 
              variant="outline"
              size="sm"
              className="text-xs rounded-xl"
              onClick={() => window.location.href = "/dashboard/courses"}
            >
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <Card key={course.id} className="border border-slate-700/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">{course.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enrolled on {new Date().toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs "
                      onClick={() => window.location.href = `/dashboard/courses/${course.id}`}
                    >
                      View
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleUnenroll(course.id)}
                      disabled={unenrolling[course.id]}
                    >
                      Unenroll
                    </Button>
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