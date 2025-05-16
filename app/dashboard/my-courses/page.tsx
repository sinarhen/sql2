import Link from 'next/link';
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../../../components/page-header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/drizzle/schema";
import { getUserCourses } from "../actions";
import { auth } from '@/lib/auth';


// Define course colors by index to use dynamically
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
  
  // Get all user courses
  const courses = await getUserCourses(userResult.id);
  
  return (
    <div>
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Your Courses</PageHeaderTitle>
            <PageHeaderDescription>Manage and analyze your educational content</PageHeaderDescription>
          </PageHeader>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <span className="mr-2">⏏️</span>Export Data
            </Button>
            <Link href="/dashboard/courses">
              <Button size="sm">
                <span className="mr-2">+</span>Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      
        <Card className="motion-preset-blur-left-sm motion-duration-500 motion-delay-100 mb-6">
          <CardContent className="flex flex-col sm:flex-row justify-between gap-2 ">
            <div className="relative">
              <span className="absolute z-50 inset-y-0 left-0 flex items-center pl-3 text-black pointer-events-none">
                <Search size={16}/>
              </span>
              <Input 
                
                type="search" 
                placeholder="Search courses..." 
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <Select>
                <SelectTrigger size="sm" >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger size="sm" className="">
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
        <Card className="  overflow-hidden motion-preset-blur-up-sm motion-duration-500 motion-delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">You are not enrolled in any courses yet</CardTitle>
            <CardDescription className="text-xs">Browse available courses to get started with your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-6 flex justify-center">
            <Link href="/dashboard/courses">
              <Button 
                size="sm" 
                className="rounded-xl text-xs"
              >
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, idx) => {
            // Get color from array based on index
            const colorName = COURSE_COLORS[idx % COURSE_COLORS.length];
            
            // For this demo, we'll use a random progress value
            // In a real app, you would calculate this based on completed assignments
            const progress = Math.floor(Math.random() * 100);
            const status = progress > 60 ? "Active" : "Inactive";
            
            return (
              <div 
                key={course.id} 
                className={`motion-preset-blur-${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx % 3 + 1) * 100}`}
              >
                <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                  <CardHeader className={`pb-3 text-primary`}>
                    <div className="flex justify-between items-start">
                      <CardTitle>
                        <span className={`text-primary`}>{course.name}</span>
                      </CardTitle>
                      <Badge 
                        className={`rounded-xl  text-xs
                        ${status === "Active" 
                          ? "bg-green-500/20 text-green-600" 
                          : "bg-amber-500/20 text-amber-600"}`}
                      >
                        {status}
                      </Badge>
                    </div>
                    <CardDescription>{course.name || "No description available for this course."}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Enrollment Date</span>
                        <span className={`font-medium text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>
                          {new Date(course.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{new Date(course.updatedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Course Progress</span>
                        <span className={`font-medium text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${colorName === "primary" ? "primary" : colorName + "-600"} rounded-full`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center pt-2 pb-3">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={`p-0 h-auto hover:bg-transparent hover:underline text-${colorName === "primary" ? "primary" : colorName + "-600"}`}
                      >
                        View Details
                      </Button>
                    </Link>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={`h-6 border-${colorName === "primary" ? "primary" : colorName + "-600"}/40 text-${colorName === "primary" ? "primary" : colorName + "-600"}`}
                      >
                        Generate Report
                      </Button>
                      <Button 
                        size="sm" 
                        className={`h-6 bg-${colorName === "primary" ? "primary" : colorName + "-600"} hover:bg-${colorName === "primary" ? "primary" : colorName + "-700"}`}
                      >
                        Analyze
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}
      
      {courses.length > 0 && (
        <div className="mt-8 flex justify-center motion-preset-blur-up-sm motion-duration-500 motion-delay-500">
          <div className="flex items-center gap-1 text-xs">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              ←
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-primary/10 border-primary/30 text-primary">
              1
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 