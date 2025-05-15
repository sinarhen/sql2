import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your analytics dashboard</p>
        </div>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard 
                title="Total Students" 
                value="2,845" 
                description="+12% from last month" 
                trend="positive"
              />
              <MetricCard 
                title="Course Completion" 
                value="78.5%" 
                description="+4.5% from last month" 
                trend="positive"
              />
              <MetricCard 
                title="Average Score" 
                value="84/100" 
                description="-1.2% from last month" 
                trend="negative"
              />
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
                <CardDescription>Latest student activities across all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">Student {i} completed Quiz {i}</p>
                        <p className="text-sm text-muted-foreground">Course: Introduction to Data Science</p>
                      </div>
                      <Badge variant="outline" className="rounded-full px-3">Score: {75 + i}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Analytics</CardTitle>
                <CardDescription>Detailed analytics will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md border-border/50 bg-muted/20">
                  <p className="text-muted-foreground">Analytics charts and visualizations will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Reports</CardTitle>
                <CardDescription>Generated reports will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded-md border-border/50 bg-muted/20">
                  <p className="text-muted-foreground">Report data and export options will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className={`text-xs mt-1 ${trend === 'positive' ? 'text-emerald-600' : trend === 'negative' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
} 