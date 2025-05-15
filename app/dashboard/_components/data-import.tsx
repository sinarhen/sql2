"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processCsvImport } from "./import-actions";
import { CheckCircle, UploadCloud, XCircle } from "lucide-react";

export function DataImport() {
  const [importType, setImportType] = useState<'students' | 'courses' | 'assignments' | 'submissions'>('students');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setResult(null);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const fileContent = await file.text();
      const importResult = await processCsvImport(fileContent, importType);
      setResult(importResult);
    } catch (error) {
      console.error("Error importing data:", error);
      setResult({ success: false, error: "Failed to process file" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearFile = () => {
    setFile(null);
    setResult(null);
  };
  
  return (
    <Card className="backdrop-blur-sm bg-white/5 border-slate-700/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Import Data</CardTitle>
        <CardDescription>Upload CSV files to import data into the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="students" onValueChange={(value) => setImportType(value as 'students' | 'courses' | 'assignments' | 'submissions')}>
          <TabsList className="mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <p className="text-xs text-muted-foreground mb-4">
              Upload a CSV file with student data. Required columns: name, email, passwordHash
            </p>
          </TabsContent>
          
          <TabsContent value="courses">
            <p className="text-xs text-muted-foreground mb-4">
              Upload a CSV file with course data. Required columns: name
            </p>
          </TabsContent>
          
          <TabsContent value="assignments">
            <p className="text-xs text-muted-foreground mb-4">
              Upload a CSV file with assignment data. Required columns: name, courseId, deadline
            </p>
          </TabsContent>
          
          <TabsContent value="submissions">
            <p className="text-xs text-muted-foreground mb-4">
              Upload a CSV file with submission data. Required columns: assignmentId, studentId, rating, submission
            </p>
          </TabsContent>
          
          <div className="space-y-4">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700/30 hover:border-slate-700/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <UploadCloud className="h-10 w-10 mx-auto mb-2 text-blue-400" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Only CSV files are supported
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="border rounded-xl p-4 bg-slate-800/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            {file && (
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600/80 hover:bg-blue-600 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? "Importing..." : `Import ${importType}`}
              </button>
            )}
            
            {result && (
              <div className={`rounded-lg p-4 mt-4 ${
                result.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
              }`}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <p className="text-sm font-medium">
                    {result.success
                      ? `Successfully imported ${result.count} ${importType}`
                      : `Import failed: ${result.error}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Tabs>
        
        <div className="mt-6 rounded-lg border border-slate-700/20 p-4 bg-slate-800/10">
          <h3 className="text-sm font-medium mb-2">CSV Format Guidelines</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• First row should contain column headers matching the required fields</p>
            <p>• Use commas (,) to separate values</p>
            <p>• Make sure to include all required columns for the selected import type</p>
            <p>• For dates, use the format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 