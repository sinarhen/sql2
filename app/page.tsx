import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { WobbleCard } from '@/components/ui/wobble-card';
import { cn } from '@/lib/utils';

export default function Home() {
  // Text items for the flip component
  const flipItems: string[] = [
    "Data-Driven Learning Analytics",
    "AI-Powered Student Insights",
    "Intelligent Performance Tracking"
  ];

  return (
    <div className='p-12'>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div 
          className="text-center mb-20 max-w-3xl h-[50vh] flex flex-col justify-center items-center mx-auto motion-preset-blur-up-md motion-duration-600"
        >
          <h1 
            className="text-3xl md:text-3xl font-medium  tracking-tight motion-translate-y-in-20 motion-opacity-in-0 motion-duration-500"
          >
            Enhance your educational insights with
          </h1>
          
          <ContainerTextFlip 
            items={flipItems}
            className="mb-5 mt-1 w-[500px]"
          />
          
          <p 
            className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed motion-translate-y-in-20 motion-opacity-in-0 motion-duration-500 motion-delay-100"
          >
            Our platform helps educators identify learning patterns, track progress in real-time,
            and implement data-backed strategies to improve student outcomes across any educational setting.
          </p>
          
          <div 
            className="mt-8 flex flex-wrap justify-center gap-3 motion-translate-y-in-20 motion-opacity-in-0 motion-duration-500 motion-delay-200"
          >
            <Link href="/auth/login">
              <Button size="sm" >Start Free Trial</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="sm">View Demo</Button>
            </Link>
          </div>
        </div>
        

        <div 
          className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-24 motion-stagger-children"
        >
          <FeatureWobbleCard   title={'Transform Education with Real-time Analytics'} className={' col-span-full'} description={'Our platform empowers educators and administrators with powerful data insights, predictive analytics, and actionable recommendations to drive student success.'} badge={'Analytics'}>
          
          </FeatureWobbleCard>
          <div className="motion-preset-blur-left-sm motion-duration-500 motion-delay-100">
            <FeatureWobbleCard 
              title="Real-time Insights" 
              description="Track student engagement metrics, assignment completion, and progress indicators as they happen." 
              badge="Analytics"
            />
          </div>
          <div className="motion-preset-blur-up-sm motion-duration-500 motion-delay-200">
            <FeatureWobbleCard 
              title="Predictive Models" 
              description="Our AI algorithms identify at-risk students before issues arise, enabling proactive intervention." 
              badge="AI"
            />
          </div>
          <div className="motion-preset-blur-right-sm motion-duration-500 motion-delay-300">
            <FeatureWobbleCard 
              title="Seamless Integration" 
              description="Connects with all major LMS platforms without disrupting your existing workflows." 
              badge="Integration"
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-primary py-16 my-8 animate-gradient-slow">
        <div className="container mx-auto px-4">
          <h2 
            className="text-sm md:text-base font-medium text-center mb-8 intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect-once"
          >
            Empowering Educators Worldwide
          </h2>
          
          <div 
            className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto intersect:motion-stagger-children intersect-once"
          >
            <div className="intersect:motion-preset-blur-left-sm intersect:motion-duration-500 intersect:motion-delay-100 intersect-once">
              <TestimonialCard 
                quote="This platform completely changed how we identify and support struggling students. The early intervention indicators are remarkably accurate."
                author="Dr. Sarah Chen"
                role="Dean of Education, Pacific University"
              />
            </div>
            <div className="intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect:motion-delay-200 intersect-once">
              <TestimonialCard 
                quote="We've seen a 32% improvement in course completion rates and a 45% increase in student satisfaction scores since implementing this system."
                author="Prof. Michael Torres"
                role="Department Chair, Riverdale College"
              />
            </div>
            <div className="intersect:motion-preset-blur-right-sm intersect:motion-duration-500 intersect:motion-delay-300 intersect-once">
              <TestimonialCard 
                quote="The customizable dashboards and seamless LMS integration make this an essential tool for our faculty. Setup took less than a day."
                author="Dr. Jasmine Patel"
                role="Director of Online Learning, Tech Institute"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div 
          className="max-w-5xl mx-auto intersect:motion-preset-blur-up-md intersect:motion-duration-800 intersect-once"
        >
          <h3 
            className="text-base md:text-lg font-medium mb-6 text-center intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect-once"
          >
            Why Choose Our Platform?
          </h3>
          
          <p 
            className="text-xs text-center text-muted-foreground mb-8 max-w-2xl mx-auto intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect:motion-delay-100 intersect-once"
          >
            We combine powerful analytics with intuitive design to deliver educational insights that drive real results
          </p>
          
          <div
            className="intersect:motion-preset-blur-up-md intersect:motion-duration-500 intersect-once"
          >
            <Card className="overflow-hidden shadow-sm glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base tracking-tight">Data-driven decision making for education</CardTitle>
                <CardDescription className="text-xs">Join the growing community of forward-thinking educational institutions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-primary">For Administrators</h3>
                    <ul className="space-y-2 text-xs">
                      <ListItem>Institutional performance dashboards</ListItem>
                      <ListItem>Budget optimization insights</ListItem>
                      <ListItem>Compliance tracking automation</ListItem>
                      <ListItem>Faculty effectiveness metrics</ListItem>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-primary">For Educators</h3>
                    <ul className="space-y-2 text-xs">
                      <ListItem>AI-powered learning pathways</ListItem>
                      <ListItem>Engagement pattern recognition</ListItem>
                      <ListItem>Automated intervention alerts</ListItem>
                      <ListItem>Content effectiveness analysis</ListItem>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-primary/5 px-4 py-3">
                <p className="text-xs text-muted-foreground">14-day free trial</p>
                <Link href="/auth/register">
                  <Button className=" text-xs px-4 py-1 h-8">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 
          className="text-sm md:text-base font-medium text-center mb-10 intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect-once"
        >
          Implementation Process
        </h2>
        
        <div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto intersect:motion-stagger-children intersect-once"
        >
          <div className="intersect:motion-preset-blur-left-sm intersect:motion-duration-500 intersect:motion-delay-100 intersect-once"><ProcessCard step="1" title="Connect Your Systems" description="Simple API integration with your existing LMS, SIS, and assessment tools. Average setup time: under 24 hours." /></div>
          <div className="intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect:motion-delay-200 intersect-once"><ProcessCard step="2" title="Configure Analytics" description="Customize dashboards and alerts based on your institution's specific needs and performance indicators." /></div>
          <div className="intersect:motion-preset-blur-right-sm intersect:motion-duration-500 intersect:motion-delay-300 intersect-once"><ProcessCard step="3" title="Transform Learning" description="Use actionable insights to implement targeted interventions and measure their impact in real-time." /></div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/10 rounded-md px-16 py-16 my-8">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div
            className="intersect:motion-preset-blur-up-md intersect:motion-duration-800 intersect-once"
          >
            <h2 
              className="text-sm md:text-base font-medium mb-3 intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect-once"
            >
              Ready to revolutionize your educational approach?
            </h2>
            
            <p 
              className="text-xs mb-6 intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect:motion-delay-100 intersect-once"
            >
              Join hundreds of forward-thinking institutions already using our platform.
            </p>
            
            <div 
              className="flex flex-wrap justify-center gap-3 intersect:motion-preset-blur-up-sm intersect:motion-duration-500 intersect:motion-delay-200 intersect-once"
            >
              <Link href="/auth/register">
                <Button size="sm" className=" px-6">Start Free Trial</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="sm" className=" px-6 bg-transparent">Schedule Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureWobbleCard({ title, className, description, badge }: { title: string; className?: string; description: string; badge: string }) {
  return (
    <WobbleCard containerClassName={cn("h-full bg-primary", className)}>
      <div className="p-4">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-xs md:text-sm tracking-tight font-medium text-white">{title}</h3>
          <Badge variant="outline" className="px-2 py-0 text-[10px] rounded-xl bg-white/10 text-white border-white/20">{badge}</Badge>
        </div>
        <p className="text-xs text-white/80">{description}</p>
      </div>
    </WobbleCard>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="-sm rounded-xl p-4 h-full shadow-sm border border-border/10 glass-card">
      <div className="mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400 inline-block text-[10px]">★</span>
        ))}
      </div>
      <p className="mb-4 italic text-xs">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-medium text-xs">{author}</p>
        <p className="text-[10px] text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">
        <svg 
          className="h-3 w-3 text-primary" 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

function ProcessCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center glass-card p-5 rounded-xl">
      <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-xs md:text-sm font-medium mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
} 