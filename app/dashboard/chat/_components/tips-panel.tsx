"use client";

import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface TipsPanelProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TipsPanel({ handleInputChange }: TipsPanelProps) {
  const handleExampleClick = (question: string) => {
    // Set the input value to the example question
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>);
  };
  
  return (
    <Card className="rounded-xl border-border/20 md:col-span-1 glass-card">
      <CardHeader>
        <CardTitle className="text-xs flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          <span>Example Questions</span>
        </CardTitle>
        <CardDescription className="text-[10px]">
          Try asking these questions to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-2 flex flex-col">
          <button
            className="w-full justify-start flex-wrap whitespace-break-spaces flex text-left h-auto py-2 px-3 text-xs rounded-xl"
            onClick={() => handleExampleClick("What courses am I enrolled in?")}
          >
            <Badge className="rounded-xl bg-blue-600/20 text-blue-400 text-[10px] mr-2">Course</Badge>
            What courses am I enrolled in?
          </button>
          
          <button
            className="w-full justify-start flex flex-wrap break-all text-left h-auto py-2 px-3 text-xs rounded-xl"
            onClick={() => handleExampleClick("When are my upcoming assignment deadlines?")}
          >
            <Badge className="rounded-xl bg-purple-600/20 text-purple-400 text-[10px] mr-2">Assignment</Badge>
            When are my upcoming assignment deadlines?
          </button>
          
          <button
            className="w-full justify-start flex flex-wrap text-left h-auto py-2 px-3 text-xs rounded-xl"
            onClick={() => handleExampleClick("How many courses are on the platform?")}
          >
            <Badge className="rounded-xl bg-emerald-600/20 text-emerald-400 text-[10px] mr-2">Platform</Badge>
            How many courses are on the platform?
          </button>
          
          <button
            className="w-full justify-start flex flex-wrap text-left h-auto py-2 px-3 text-xs rounded-xl"
            onClick={() => handleExampleClick("What's my average grade across all courses?")}
          >
            <Badge className="rounded-xl bg-cyan-600/20 text-cyan-400 text-[10px] mr-2">Analytics</Badge>
            What&apos;s my average grade across all courses?
          </button>
          
          <button
            className="w-full justify-start flex flex-wrap text-left h-auto py-2 px-3 text-xs rounded-xl"
            onClick={() => handleExampleClick("List all the lecturers on the platform.")}
          >
            <Badge className="rounded-xl bg-amber-600/20 text-amber-400 text-[10px] mr-2">Users</Badge>
            List all the lecturers on the platform.
          </button>
          
          <button
            className="w-full justify-start flex flex-wrap text-left h-auto py-2 px-3 text-xs rounded-xl"
            onClick={() => handleExampleClick("Can you explain how to normalize database tables?")}
          >
            <Badge className="rounded-xl bg-indigo-600/20 text-indigo-400 text-[10px] mr-2">Learning</Badge>
            Can you explain how to normalize database tables?
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 