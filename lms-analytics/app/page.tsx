import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            LMS Analytics System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A powerful analytics platform for your learning management system.
            Track student progress, analyze performance, and identify areas for improvement.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/auth/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Register</Button>
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            title="Comprehensive Analytics" 
            description="Track and analyze student performance across all courses and assignments." 
            icon="📊"
          />
          <FeatureCard 
            title="Smart Insights" 
            description="Get AI-powered insights to identify at-risk students and learning gaps." 
            icon="🧠"
          />
          <FeatureCard 
            title="Data Integration" 
            description="Import data from multiple sources including Excel, Moodle, and Google Classroom." 
            icon="📥"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 