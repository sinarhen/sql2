"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { submitForm } from "../../actions";

interface Form {
  id: string;
  name: string;
  end: Date;
}

interface FormsListProps {
  forms: Form[];
  userRole: string;
  userId: string;
}

export function FormsList({ forms, userRole, userId }: FormsListProps) {
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [contents, setContents] = useState<Record<string, string>>({});
  
  const handleSubmit = async (formId: string) => {
    const content = contents[formId];
    if (!content?.trim()) return;
    
    setSubmitting(prev => ({ ...prev, [formId]: true }));
    try {
      await submitForm({
        formId,
        userId,
        content
      });
      setContents(prev => ({ ...prev, [formId]: "" }));
    } finally {
      setSubmitting(prev => ({ ...prev, [formId]: false }));
    }
  };
  
  return (
    <Card className=" border-slate-700/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {userRole === "lecturer" ? "Feedback Forms" : "Available Forms"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {forms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {userRole === "lecturer" 
              ? "You haven't created any forms yet." 
              : "There are no forms available."}
          </p>
        ) : (
          <div className="space-y-4">
            {forms.map(form => (
              <Card key={form.id} className="border border-slate-700/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-medium">{form.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={new Date(form.end) > new Date() ? "outline" : "destructive"}
                      className="text-[10px]"
                    >
                      {new Date(form.end) > new Date() 
                        ? `Ends ${new Date(form.end).toLocaleDateString()}` 
                        : "Closed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {userRole === "student" ? (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Your feedback"
                        value={contents[form.id] || ""}
                        onChange={(e) => setContents(prev => ({ 
                          ...prev, 
                          [form.id]: e.target.value 
                        }))}
                        className="w-full"
                        disabled={submitting[form.id] || new Date(form.end) < new Date()}
                      />
                      <div className="flex justify-end">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="text-xs rounded-xl"
                          onClick={() => handleSubmit(form.id)}
                          disabled={
                            submitting[form.id] || 
                            !contents[form.id]?.trim() || 
                            new Date(form.end) < new Date()
                          }
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      <p>View student submissions for this form.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs rounded-xl"
                        onClick={() => {}}
                      >
                        View Submissions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 