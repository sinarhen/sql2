"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckIcon, ExternalLinkIcon, FilterIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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

interface AssignmentsGradeViewProps {
  assignments: Assignment[];
  courses: Course[];
  userRole: string;
  userId?: string;
}

export function AssignmentsGradeView({ assignments, courses }: AssignmentsGradeViewProps) {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Get list of courses to filter by
  const uniqueCourses = Array.from(
    new Set(assignments.map(a => a.courseId))
  ).map(courseId => {
    const courseName = courses.find(c => c.id === courseId)?.name || 
      assignments.find(a => a.courseId === courseId)?.courseName || 
      "Unknown Course";
    return { id: courseId, name: courseName };
  });
  
  // Apply filters to assignments
  const filteredAssignments = assignments.filter(assignment => {
    // Course filter
    if (courseFilter !== "all" && assignment.courseId !== courseFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter === "completed" && !assignment.isCompleted) {
      return false;
    }
    if (statusFilter === "incomplete" && assignment.isCompleted) {
      return false;
    }
    if (statusFilter === "graded" && (!assignment.isCompleted || !assignment.submission || assignment.submission.rating === null)) {
      return false;
    }
    if (statusFilter === "ungraded" && (!assignment.isCompleted || !assignment.submission || assignment.submission.rating !== null)) {
      return false;
    }
    
    return true;
  });
  
  // Group assignments by course
  const assignmentsByCourse = filteredAssignments.reduce((acc, assignment) => {
    const courseId = assignment.courseId;
    const courseName = courses.find(c => c.id === courseId)?.name || 
      assignment.courseName || 
      "Unknown Course";
    
    if (!acc[courseId]) {
      acc[courseId] = {
        courseName,
        assignments: []
      };
    }
    
    acc[courseId].assignments.push(assignment);
    return acc;
  }, {} as Record<string, { courseName: string; assignments: Assignment[] }>);
  
  // Sort courses alphabetically by name
  const sortedCourseIds = Object.keys(assignmentsByCourse).sort((a, b) => 
    assignmentsByCourse[a].courseName.localeCompare(assignmentsByCourse[b].courseName)
  );
  
  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground";
    if (grade >= 90) return "text-green-600";
    if (grade >= 70) return "text-blue-600";
    if (grade >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-medium">Assignment Grades</h3>
        
        <div className="flex gap-2">
          {/* Course Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs rounded-xl gap-1.5">
                <FilterIcon size={12} />
                Course
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px]">Filter by Course</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={courseFilter} onValueChange={setCourseFilter}>
                <DropdownMenuRadioItem value="all" className="text-xs">All Courses</DropdownMenuRadioItem>
                {uniqueCourses.map(course => (
                  <DropdownMenuRadioItem 
                    key={course.id} 
                    value={course.id}
                    className="text-xs"
                  >
                    {course.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs rounded-xl gap-1.5">
                <FilterIcon size={12} />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px]">Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all" className="text-xs">All Assignments</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed" className="text-xs">Completed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="incomplete" className="text-xs">Incomplete</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="graded" className="text-xs">Graded</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ungraded" className="text-xs">Submitted but Ungraded</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {sortedCourseIds.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">
          No assignments match your filters.
        </p>
      ) : (
        sortedCourseIds.map(courseId => (
          <Card key={courseId} className="glass-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">
                {assignmentsByCourse[courseId].courseName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] text-[10px]">Assignment</TableHead>
                    <TableHead className="w-[20%] text-[10px]">Due Date</TableHead>
                    <TableHead className="w-[20%] text-[10px]">Status</TableHead>
                    <TableHead className="w-[15%] text-[10px] text-right">Grade</TableHead>
                    <TableHead className="w-[5%] text-[10px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentsByCourse[courseId].assignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell className="text-xs font-medium">{assignment.name}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {assignment.isCompleted ? (
                          <Badge className="text-[10px] bg-green-500/20 text-green-600 rounded-xl">
                            <CheckIcon size={10} className="mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] bg-yellow-500/20 text-yellow-600 rounded-xl">
                            Incomplete
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {assignment.isCompleted && assignment.submission && assignment.submission.rating !== null ? (
                          <span className={`text-xs font-medium ${getGradeColor(assignment.submission.rating)}`}>
                            {assignment.submission.rating}/100
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/assignments/${assignment.id}`}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLinkIcon size={12} />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
} 