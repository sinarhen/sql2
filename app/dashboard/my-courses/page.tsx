import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../_components/page-header';

// Define course colors by index to use dynamically
const COURSE_COLORS = ["primary", "purple", "blue", "cyan", "indigo", "pink"];

export default function CoursesPage() {
  // Sample course data
  const courses = [
    {
      id: "1",
      name: "Mathematics 101",
      description: "Introduction to mathematical concepts and principles",
      students: 32,
      progress: 85,
      lastUpdate: "2 days ago",
      status: "Active"
    },
    {
      id: "2",
      name: "Biology Fundamentals",
      description: "Basic principles of biology and life sciences",
      students: 28,
      progress: 67,
      lastUpdate: "1 day ago",
      status: "Active"
    },
    {
      id: "3",
      name: "History of Science",
      description: "Evolution of scientific discovery through the ages",
      students: 24,
      progress: 92,
      lastUpdate: "5 hours ago",
      status: "Active"
    },
    {
      id: "4",
      name: "Chemistry Basics",
      description: "Fundamental chemical principles and reactions",
      students: 21,
      progress: 54,
      lastUpdate: "1 week ago",
      status: "Inactive"
    },
    {
      id: "5",
      name: "Physics Introduction",
      description: "Core concepts in physics and natural laws",
      students: 19,
      progress: 73,
      lastUpdate: "3 days ago",
      status: "Active"
    },
    {
      id: "6",
      name: "Literature Analysis",
      description: "Critical analysis of literary works and themes",
      students: 26,
      progress: 38,
      lastUpdate: "2 days ago",
      status: "Active"
    }
  ];

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
            <Button size="sm">
              <span className="mr-2">+</span>New Course
            </Button>
          </div>
        </div>
      
        <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/20 glass-card motion-preset-blur-left-sm motion-duration-500 motion-delay-100">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </span>
              <input 
                type="search" 
                placeholder="Search courses..." 
                className="w-full sm:w-60 pl-10 h-8 text-xs rounded-xl bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <select className="h-8 rounded-xl bg-background border border-border/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              
              <select className="h-8 rounded-xl bg-background border border-border/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                <option>Sort By: Newest</option>
                <option>Sort By: Oldest</option>
                <option>Sort By: Progress</option>
                <option>Sort By: Students</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 motion-stagger-children">
        {courses.map((course, idx) => {
          // Get color from array based on index
          const colorName = COURSE_COLORS[idx % COURSE_COLORS.length];
          
          return (
            <div 
              key={course.id} 
              className={`motion-preset-blur-${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx % 3 + 1) * 100}`}
            >
              <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                <CardHeader className={`pb-3 bg-gradient-to-br from-${colorName === "primary" ? "primary" : colorName + "-500"}/5 to-${colorName === "primary" ? "primary" : colorName + "-500"}/10`}>
                  <div className="flex justify-between items-start">
                    <CardTitle>
                      <span className={`text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>{course.name}</span>
                    </CardTitle>
                    <Badge 
                      className={`rounded-xl 
                      ${course.status === "Active" 
                        ? "bg-green-500/20 text-green-600" 
                        : "bg-amber-500/20 text-amber-600"}`}
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Students</span>
                      <span className={`font-medium text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>{course.students}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{course.lastUpdate}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Course Progress</span>
                      <span className={`font-medium text-${colorName === "primary" ? "primary" : colorName + "-600"}`}>{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${colorName === "primary" ? "primary" : colorName + "-600"} rounded-full`} 
                        style={{ width: `${course.progress}%` }}
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
      
      <div className="mt-8 flex justify-center motion-preset-blur-up-sm motion-duration-500 motion-delay-500">
        <div className="flex items-center gap-1 text-xs">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            ←
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-primary/10 border-primary/30 text-primary">
            1
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            2
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            3
          </Button>
          <span className="mx-1">...</span>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            8
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
            →
          </Button>
        </div>
      </div>
    </div>
  );
} 