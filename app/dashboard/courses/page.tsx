import { notFound, redirect } from "next/navigation";
import Link from 'next/link';
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/components/ui/drizzle/schema";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "../../../components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { getAllCourses } from "../actions";
import EnrollButton from "./_components/enroll-button";
import { auth } from "@/lib/auth";

// Define course colors for visual variety
const COURSE_COLORS = ["primary", "purple", "blue", "cyan", "indigo", "pink"];

export default async function CoursesPage() {
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
  
  // Get all available courses
  const courses = await getAllCourses(userResult.id);
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Available Courses</PageHeaderTitle>
            <PageHeaderDescription>Browse and enroll in our educational courses</PageHeaderDescription>
          </PageHeader>
          
          <div className="flex gap-2">
            {(userResult.role === "lecturer" || userResult.role === "admin") && (
              <Link href="/dashboard/courses/create">
                <Button 
                  size="sm" 
                  className="rounded-xl text-xs"
                  variant="default"
                >
                  Create Course
                </Button>
              </Link>
            )}
            <Link href="/dashboard/my-courses">
              <Button 
                size="sm" 
                className="rounded-xl text-xs"
                variant="outline"
              >
                View My Courses
              </Button>
            </Link>
          </div>
        </div>
      
        <Card className="rounded-xl p-4 mb-6 border border-border/20 glass-card">
          <CardContent className="flex flex-col sm:flex-row justify-between gap-2 px-0 py-0">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <Search size={16}/>
              </span>
              <Input 
                type="search" 
                placeholder="Search courses..." 
                className="w-full sm:w-60 pl-10 h-8 text-xs rounded-xl bg-background border border-border/40"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <Select>
                <SelectTrigger size="sm" className="h-8 border border-border/40 text-xs rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Sort By: Recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Sort By: Recent</SelectItem>
                  <SelectItem value="name">Sort By: Name</SelectItem>
                  <SelectItem value="popularity">Sort By: Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {courses.length === 0 ? (
        <Card className=" border-slate-700/10 overflow-hidden motion-preset-blur-up-sm motion-duration-500 motion-delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No courses available</CardTitle>
            <CardDescription className="text-xs">Please check back later for new course offerings</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 motion-stagger-children">
          {courses.map((course, idx) => {
            // Get color from array based on index
            const colorName = COURSE_COLORS[idx % COURSE_COLORS.length];
            
            return (
              <div 
                key={course.id} 
                className={`motion-preset-blur-${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx % 3 + 1) * 100}`}
              >
                <Card className="overflow-hidden glass-card  border-border/40 hover:shadow-md transition-all duration-300">
                  <CardHeader className={`pb-3 bg-gradient-to-br from-${colorName === "primary" ? "primary" : colorName + "-500"}/5 to-${colorName === "primary" ? "primary" : colorName + "-500"}/10`}>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xs">
                        <span className={`text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>{course.name}</span>
                      </CardTitle>
                      <Badge 
                        className="rounded-xl bg-blue-600/20 text-blue-400"
                      >
                        Open
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px]">
                      {course.name}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Created Date</span>
                        <span className="font-medium">{new Date(course.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className={`font-medium text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>
                          {new Date(course.updatedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-[10px]">
                      <p className="mt-2 mb-1 text-muted-foreground">Skills you&apos;ll learn:</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="rounded-xl text-[10px] border-border/40 bg-background/50">Critical Thinking</Badge>
                        <Badge variant="outline" className="rounded-xl text-[10px] border-border/40 bg-background/50">Problem Solving</Badge>
                        <Badge variant="outline" className="rounded-xl text-[10px] border-border/40 bg-background/50">Analysis</Badge>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="flex justify-between items-center p-3 pt-1 border-t border-border/20">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl text-xs h-7"
                      >
                        View Details
                      </Button>
                    </Link>
                    <EnrollButton courseId={course.id} userId={userResult.id} isEnrolled={course.isUserEnrolled} />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 