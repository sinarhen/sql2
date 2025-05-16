import Link from 'next/link';
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../../../components/page-header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Users } from 'lucide-react';
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { getUserCourses, getLecturerCourses, getCourseStats } from "../actions";
import { auth } from '@/lib/auth';


// Define course colors by index to use dynamically
const COURSE_COLORS = ["primary", "purple", "blue", "cyan", "indigo", "pink"];

export default async function MyCourses() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const userResult = await db.query.users.findFirst({
    where: eq(users.email, session.user.email || ""),
  });
  
  if (!userResult) {
    notFound();
  }
  
  // Check if user is a lecturer or admin and get appropriate courses
  const isLecturerOrAdmin = userResult.role === "lecturer" || userResult.role === "admin";
  
  // Get appropriate courses based on role
  const courses = isLecturerOrAdmin 
    ? await getLecturerCourses(userResult.id) 
    : await getUserCourses(userResult.id);
  
  // Get statistics for each course
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const stats = await getCourseStats(course.id);
      return {
        ...course,
        stats
      };
    })
  );
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>
              {isLecturerOrAdmin ? "Your Teaching Courses" : "Your Enrolled Courses"}
            </PageHeaderTitle>
            <PageHeaderDescription>
              {isLecturerOrAdmin 
                ? "Manage and analyze the courses you teach" 
                : "Manage and track your educational progress"}
            </PageHeaderDescription>
          </PageHeader>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-xl text-xs">
              <span className="mr-2">⏏️</span>Export Data
            </Button>
            <Link href="/dashboard/courses">
              <Button size="sm" className="rounded-xl text-xs">
                <span className="mr-2">+</span>Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      
        <Card className="motion-preset-blur-left-sm motion-duration-500 motion-delay-100 mb-6 glass-card border-border/40">
          <CardContent className="flex flex-col sm:flex-row justify-between gap-2 py-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <Search size={16}/>
              </span>
              <Input 
                type="search" 
                placeholder="Search courses..." 
                className="pl-10 h-8 text-xs rounded-xl border-border/40"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <Select>
                <SelectTrigger size="sm" className="h-8 border-border/40 text-xs rounded-xl">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger size="sm" className="h-8 border-border/40 text-xs rounded-xl">
                  <SelectValue placeholder="Sort By: Newest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort By: Newest</SelectItem>
                  <SelectItem value="oldest">Sort By: Oldest</SelectItem>
                  <SelectItem value="progress">Sort By: Progress</SelectItem>
                  <SelectItem value="students">Sort By: Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {courses.length === 0 ? (
        <Card className="glass-card border-border/40 overflow-hidden motion-preset-blur-up-sm motion-duration-500 motion-delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">
              {isLecturerOrAdmin 
                ? "You don't have any courses yet" 
                : "You are not enrolled in any courses yet"}
            </CardTitle>
            <CardDescription className="text-[10px]">
              {isLecturerOrAdmin 
                ? "Create a new course to get started with teaching" 
                : "Browse available courses to get started with your learning journey"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-6 flex justify-center">
            {isLecturerOrAdmin ? (
              <Link href="/dashboard/courses/create">
                <Button 
                  size="sm" 
                  className="rounded-xl text-xs"
                >
                  Create Course
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/courses">
                <Button 
                  size="sm" 
                  className="rounded-xl text-xs"
                >
                  Browse Courses
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesWithStats.map((course, idx) => {
            // Get color from array based on index
            const colorName = COURSE_COLORS[idx % COURSE_COLORS.length];
            const stats = course.stats;
            
            return (
              <div 
                key={course.id} 
                className={`motion-preset-blur-${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx % 3 + 1) * 100}`}
              >
                <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xs">
                        <span className={`text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>{course.name}</span>
                      </CardTitle>
                      <Badge 
                        className="rounded-xl bg-blue-600/20 text-blue-400 text-[10px]"
                      >
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px]">{course.name}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Created Date</span>
                        <span className="font-medium">{new Date(course.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{new Date(course.updatedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px]">
                      <BookOpen size={12} className="text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Assignments</span>
                        <span className="ml-1 font-medium">{stats.assignmentsCount}</span>
                      </div>
                      
                      <Users size={12} className="text-muted-foreground ml-2" />
                      <div>
                        <span className="text-muted-foreground">Students</span>
                        <span className="ml-1 font-medium">{stats.enrollmentsCount}</span>
                      </div>
                    </div>
                    
                    {isLecturerOrAdmin && stats.submissionStats.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">Assignment Submissions:</p>
                        <div className="space-y-1">
                          {stats.submissionStats.slice(0, 2).map((stat) => (
                            <div key={stat.assignmentId} className="flex justify-between text-[10px] border-t border-border/20 pt-1">
                              <span className="truncate max-w-[150px]">{stat.assignmentName}</span>
                              <div>
                                <span className="text-blue-600">{stat.submittedCount}/{stat.totalStudents}</span>
                                {" • "}
                                <span className="text-green-600">{stat.ratedCount}/{stat.submittedCount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center pt-2 pb-3">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-0 h-auto hover:bg-transparent hover:underline text-xs text-primary"
                      >
                        View Details
                      </Button>
                    </Link>
                    <div className="flex gap-1">
                      <Link href={`/dashboard/courses/${course.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 rounded-xl text-xs"
                        >
                          {isLecturerOrAdmin ? "Manage" : "View"}
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 