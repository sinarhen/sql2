"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createForm } from "../actions";

export function AddFormForm() {
  const [name, setName] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !endDate) return;
    
    try {
      setIsSubmitting(true);
      await createForm({
        name,
        end: new Date(endDate).getTime(),
      });
      setName("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to create form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Create a new feedback form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Form name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Input
                type="datetime-local"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="rounded-xl"
              disabled={isSubmitting || !name.trim() || !endDate}
            >
              Create Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 