import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StudentStats = {
  totalStudents: number;
  newStudentsLastMonth: number;
  totalSubmissions: number;
  submissionsLastMonth: number;
  averageScore: number | null;
};

type RecentActivity = {
  id: string;
  studentId: string;
  assignmentId: string;
  rating: number | null;
  submission: number | Date;
  studentName: string;
  assignmentName: string;
  courseName: string;
};

interface DashboardOverviewProps {
  stats: StudentStats;
  activities: RecentActivity[];
}

export function DashboardOverview({ stats, activities }: DashboardOverviewProps) {
  // Calculate trends
  const studentGrowth = (stats.newStudentsLastMonth / stats.totalStudents) * 100;
  const submissionGrowth = (stats.submissionsLastMonth / stats.totalSubmissions) * 100;

  return (
    <div className="space-y-6 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard 
          title="Total Students" 
          value={stats.totalStudents.toString()} 
          description={`+${studentGrowth.toFixed(1)}% from last month`} 
          trend={studentGrowth > 0 ? "positive" : "negative"}
        />
        <MetricCard 
          title="Average Score" 
          value={`${stats.averageScore ? stats.averageScore.toFixed(1) : "0"}/100`} 
          description="Based on all submissions" 
          trend="neutral"
        />
        <MetricCard 
          title="Assignment Submissions" 
          value={stats.totalSubmissions.toString()} 
          description={`${submissionGrowth > 0 ? "+" : ""}${submissionGrowth.toFixed(1)}% from last month`} 
          trend={submissionGrowth > 0 ? "positive" : "negative"}
        />
      </div>
      
      <Card className=" border-slate-700/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
          <CardDescription>Latest student activities across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center border-b border-slate-700/20 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{activity.studentName} submitted {activity.assignmentName}</p>
                    <p className="text-xs text-muted-foreground">Course: {activity.courseName}</p>
                    <p className="text-xs text-blue-400 mt-1">{new Date(activity.submission).toLocaleString()}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`rounded-full px-3 ${
                      activity.rating && activity.rating >= 90 ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" :
                      activity.rating && activity.rating >= 70 ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30" :
                      activity.rating && activity.rating >= 60 ? "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30" :
                      "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    }`}
                  >
                    Score: {activity.rating ? activity.rating.toFixed(1) : "N/A"}%
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recent activities found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className=" border-slate-700/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/20">
                <span className="text-sm">New students this month</span>
                <Badge variant="outline">{stats.newStudentsLastMonth}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/20">
                <span className="text-sm">New submissions this month</span>
                <Badge variant="outline">{stats.submissionsLastMonth}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/20">
                <span className="text-sm">Student retention rate</span>
                <Badge variant="outline" className="bg-blue-600/20 text-blue-400">95.3%</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Average course completion</span>
                <Badge variant="outline" className="bg-purple-600/20 text-purple-400">87.2%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className=" border-slate-700/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
            <CardDescription>Current system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Database load</span>
                  <span className="text-xs text-blue-400">42%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">API usage</span>
                  <span className="text-xs text-emerald-400">28%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Storage</span>
                  <span className="text-xs text-purple-400">63%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "63%" }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span>Last update: {new Date().toLocaleString()}</span>
                <Badge variant="outline" className="bg-emerald-600/20 text-emerald-400">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  description, 
  trend 
}: { 
  title: string; 
  value: string; 
  description: string; 
  trend: 'positive' | 'negative' | 'neutral' 
}) {
  return (
    <Card className=" border-slate-700/10 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className={`text-xs mt-1 ${
          trend === 'positive' 
            ? 'text-emerald-400' 
            : trend === 'negative' 
              ? 'text-red-400' 
              : 'text-muted-foreground'
        }`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
} 