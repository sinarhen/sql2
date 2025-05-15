"use client";

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
import { motion } from 'framer-motion';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { WobbleCard } from '@/components/ui/wobble-card';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

export default function Home() {
  // Text items for the flip component
  const flipItems: ReactNode[] = [
    <span key="1" className="text-primary font-semibold">Data-Driven Learning Analytics</span>,
    <span key="2" className="text-primary font-semibold">AI-Powered Student Insights</span>,
    <span key="3" className="text-primary font-semibold">Intelligent Performance Tracking</span>
  ];

  return (
    <div>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div 
          className="text-center mb-20 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.h1 
            className="text-2xl md:text-3xl font-medium mb-3 tracking-tight"
            variants={slideUp}
          >
            Enhance your educational insights with
          </motion.h1>
          
          <ContainerTextFlip 
            items={flipItems}
            className="my-5"
          />
          
          <motion.p 
            className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed"
            variants={slideUp}
          >
            Our platform helps educators identify learning patterns, track progress in real-time,
            and implement data-backed strategies to improve student outcomes across any educational setting.
          </motion.p>
          
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-3"
            variants={slideUp}
          >
            <Link href="/auth/login">
              <Button size="sm" className=" px-6">Start Free Trial</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="sm" >View Demo</Button>
            </Link>
          </motion.div>
        </motion.div>
        

        <motion.div 
          className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-24"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <FeatureWobbleCard   title={'Transform Education with Real-time Analytics'} className={' col-span-full'} description={'Our platform empowers educators and administrators with powerful data insights, predictive analytics, and actionable recommendations to drive student success.'} badge={'Analytics'}>
          
          </FeatureWobbleCard>
          <motion.div variants={slideUp}>
            <FeatureWobbleCard 
              title="Real-time Insights" 
              description="Track student engagement metrics, assignment completion, and progress indicators as they happen." 
              badge="Analytics"
            />
          </motion.div>
          <motion.div variants={slideUp}>
            <FeatureWobbleCard 
              title="Predictive Models" 
              description="Our AI algorithms identify at-risk students before issues arise, enabling proactive intervention." 
              badge="AI"
            />
          </motion.div>
          <motion.div variants={slideUp}>
            <FeatureWobbleCard 
              title="Seamless Integration" 
              description="Connects with all major LMS platforms without disrupting your existing workflows." 
              badge="Integration"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-primary py-16 my-8 animate-gradient-slow">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-sm md:text-base font-medium text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Empowering Educators Worldwide
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={slideUp}>
              <TestimonialCard 
                quote="This platform completely changed how we identify and support struggling students. The early intervention indicators are remarkably accurate."
                author="Dr. Sarah Chen"
                role="Dean of Education, Pacific University"
              />
            </motion.div>
            <motion.div variants={slideUp}>
              <TestimonialCard 
                quote="We've seen a 32% improvement in course completion rates and a 45% increase in student satisfaction scores since implementing this system."
                author="Prof. Michael Torres"
                role="Department Chair, Riverdale College"
              />
            </motion.div>
            <motion.div variants={slideUp}>
              <TestimonialCard 
                quote="The customizable dashboards and seamless LMS integration make this an essential tool for our faculty. Setup took less than a day."
                author="Dr. Jasmine Patel"
                role="Director of Online Learning, Tech Institute"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3 
            className="text-base md:text-lg font-medium mb-6 text-center"
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Our Platform?
          </motion.h3>
          
          <motion.p 
            className="text-xs text-center text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We combine powerful analytics with intuitive design to deliver educational insights that drive real results
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border/20 shadow-sm glass-card">
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
                  <Button className="rounded-xl text-xs px-4 py-1 h-8">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.h2 
          className="text-sm md:text-base font-medium text-center mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Implementation Process
        </motion.h2>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={slideUp}><ProcessCard step="1" title="Connect Your Systems" description="Simple API integration with your existing LMS, SIS, and assessment tools. Average setup time: under 24 hours." /></motion.div>
          <motion.div variants={slideUp}><ProcessCard step="2" title="Configure Analytics" description="Customize dashboards and alerts based on your institution's specific needs and performance indicators." /></motion.div>
          <motion.div variants={slideUp}><ProcessCard step="3" title="Transform Learning" description="Use actionable insights to implement targeted interventions and measure their impact in real-time." /></motion.div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/10 py-16 my-8">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-sm md:text-base font-medium mb-3"
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to revolutionize your educational approach?
            </motion.h2>
            
            <motion.p 
              className="text-xs mb-6"
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Join hundreds of forward-thinking institutions already using our platform.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-3"
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/auth/register">
                <Button size="sm" className="rounded-xl px-6">Start Free Trial</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="sm" className="rounded-xl px-6 bg-transparent">Schedule Demo</Button>
              </Link>
            </motion.div>
          </motion.div>
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

function FeatureCard({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <Card className="border-border/30 h-full shadow-sm glass-card card-highlight">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-xs md:text-sm tracking-tight">{title}</CardTitle>
          <Badge variant="outline" className="px-2 py-0 text-[10px] rounded-xl">{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 h-full shadow-sm border border-border/10 glass-card">
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

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-lg md:text-xl font-medium mb-1 text-primary">{number}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
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