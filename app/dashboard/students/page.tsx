import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../_components/page-header';

export default function StudentsPage() {
  // Sample students data
  const students = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      courses: 3,
      averageGrade: 87,
      lastActivity: "2 hours ago",
      status: "Active",
      riskLevel: "Low"
    },
    {
      id: "2",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      courses: 4,
      averageGrade: 92,
      lastActivity: "1 day ago",
      status: "Active",
      riskLevel: "Low"
    },
    {
      id: "3",
      name: "James Smith",
      email: "james.smith@example.com",
      courses: 2,
      averageGrade: 71,
      lastActivity: "3 days ago",
      status: "Active",
      riskLevel: "Medium"
    },
    {
      id: "4",
      name: "Sarah Kim",
      email: "sarah.kim@example.com",
      courses: 3,
      averageGrade: 95,
      lastActivity: "5 hours ago",
      status: "Active",
      riskLevel: "Low"
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.wilson@example.com",
      courses: 2,
      averageGrade: 63,
      lastActivity: "1 week ago",
      status: "Inactive",
      riskLevel: "High"
    },
    {
      id: "6",
      name: "Emma Brown",
      email: "emma.brown@example.com",
      courses: 4,
      averageGrade: 78,
      lastActivity: "2 days ago",
      status: "Active",
      riskLevel: "Medium"
    }
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="motion-preset-blur-up-sm motion-duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <PageHeader className="mb-0">
            <PageHeaderTitle>Student Management</PageHeaderTitle>
            <PageHeaderDescription>Track student performance and engagement</PageHeaderDescription>
          </PageHeader>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <span className="mr-2">📊</span>Export Report
            </Button>
            <Button size="sm" >
              <span className="mr-2">+</span>Add Student
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
                placeholder="Search students..." 
                className="w-full sm:w-60 pl-10 h-8 text-xs rounded-xl bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <select className="h-8 rounded-xl bg-background border border-border/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                <option>All Risk Levels</option>
                <option>Low Risk</option>
                <option>Medium Risk</option>
                <option>High Risk</option>
              </select>
              
              <select className="h-8 rounded-xl bg-background border border-border/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                <option>Sort By: Name</option>
                <option>Sort By: Grade</option>
                <option>Sort By: Last Activity</option>
                <option>Sort By: Risk Level</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 motion-stagger-children">
        {students.map((student, idx) => {
          // Get risk colors
          const riskColor = 
            student.riskLevel === "Low" ? "green" : 
            student.riskLevel === "Medium" ? "amber" : 
            "red";
          
          // Get initials for avatar
          const initials = student.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
            
          return (
            <div 
              key={student.id} 
              className={`motion-preset-blur-${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'up' : 'right'}-sm motion-duration-500 motion-delay-${(idx % 3 + 1) * 100}`}
            >
              <Card className="overflow-hidden glass-card border-border/40 hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`bg-primary/10 text-primary text-xs`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xs md:text-sm">
                          {student.name}
                        </CardTitle>
                        <CardDescription className="text-[10px]">{student.email}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={`px-2 py-0 text-[10px] rounded-xl 
                      bg-${riskColor}-500/20 text-${riskColor}-600`}
                    >
                      {student.riskLevel} Risk
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-medium">{student.courses}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Avg. Grade</span>
                      <span className={`font-medium ${
                        student.averageGrade >= 90 ? "text-green-600" :
                        student.averageGrade >= 75 ? "text-blue-600" :
                        student.averageGrade >= 60 ? "text-amber-600" :
                        "text-red-600"
                      }`}>{student.averageGrade}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Activity</span>
                      <span>{student.lastActivity}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Performance Level</span>
                      <span className={`font-medium ${
                        student.averageGrade >= 90 ? "text-green-600" :
                        student.averageGrade >= 75 ? "text-blue-600" :
                        student.averageGrade >= 60 ? "text-amber-600" :
                        "text-red-600"
                      }`}>{student.averageGrade}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          student.averageGrade >= 90 ? "bg-green-600" :
                          student.averageGrade >= 75 ? "bg-blue-600" :
                          student.averageGrade >= 60 ? "bg-amber-600" :
                          "bg-red-600"
                        } rounded-full`} 
                        style={{ width: `${student.averageGrade}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center pt-2 pb-3">
                  <Link href={`/dashboard/students/${student.id}`}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-[10px] text-primary p-0 h-auto hover:bg-transparent hover:underline"
                    >
                      View Profile
                    </Button>
                  </Link>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-[10px] px-3 py-1 h-6 border-primary/40 text-primary"
                    >
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      className="rounded-xl text-[10px] px-3 py-1 h-6 bg-primary hover:bg-primary/90"
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
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl">
            ←
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl bg-primary/10 border-primary/30 text-primary">
            1
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl">
            2
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl">
            3
          </Button>
          <span className="mx-1">...</span>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl">
            8
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl">
            →
          </Button>
        </div>
      </div>
    </div>
  );
} 