import { 
  createResource,
  getUserInfo, 
  getUserCoursesInfo, 
  getUserAssignmentsInfo,
  getAllResources,
  getAllCoursesInfo,
  getLecturers,
  getAverageGrades,
  getCourseGrades
} from '@/app/dashboard/actions';
import { findRelevantContent } from '@/lib/ai/embedding';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { auth } from '@/lib/auth';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const session = await auth();
  const userId = session?.user?.id;
  
  console.log('Session user ID:', userId);

  if (!userId) {
    console.log('Unauthorized - No User ID in session');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get user info to determine role for personalized instructions
  const userInfo = await getUserInfo(userId);
  const userRole = userInfo?.role || 'student';
  
  let systemPrompt = `You are a helpful AI assistant for the LMS Analytics platform. 
    Your job is to help users navigate the platform and provide information about their courses, assignments, and analytics.
    
    IMPORTANT INSTRUCTIONS FOR TOOL USAGE:
    - When a user asks about their courses (e.g. "What courses am I enrolled in?"), ALWAYS use the getUserCourses tool.
    - When a user asks about all courses on the platform (e.g. "How many courses are on the platform?"), ALWAYS use the getAllCourses tool.
    - When a user asks about their assignments or deadlines (e.g. "When are my assignments due?"), ALWAYS use the getUserAssignments tool.
    - When a user asks about their profile or personal info, ALWAYS use the getUserProfile tool.
    - When a user asks about lecturers on the platform, ALWAYS use the getLecturers tool.
    - When a user asks about grades or performance, ALWAYS use the getAverageGrades or getCourseGrades tool as appropriate.
    - For general knowledge questions, use the getInformation tool.
    - DO NOT respond with "I don't have enough information" without first trying the appropriate tool.
    
    FORMATTING INSTRUCTIONS:
    - Use Markdown to format your responses.
    - Use numbered lists for step-by-step instructions.
    - Format course names, grades, and important information appropriately.
    
    Keep responses concise and helpful. If the tools return empty arrays, then you can say no data found.`;
  
  // Add role-specific instructions
  if (userRole === 'lecturer' || userRole === 'admin') {
    systemPrompt += `\n\nYou are speaking to a ${userRole} user. Emphasize features related to:
    - Course management and analytics
    - Student performance tracking
    - Grade distributions and achievement trends
    - Provide detailed analytics when requested
    - Offer suggestions for improving course outcomes based on data`;
  } else {
    systemPrompt += `\n\nYou are speaking to a student user. Emphasize features related to:
    - Assignment tracking and upcoming deadlines
    - Course enrollment and content
    - Grade performance and improvement strategies
    - Learning resources and study recommendations`;
  }

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: systemPrompt,
    tools: {
      addResource: tool({
        description: `Add a resource to the knowledge base. If the user prompts about something useful, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => {
          console.log('Adding resource:', content.substring(0, 50) + '...');
          const result = await createResource({ content });
          console.log('Resource added with ID:', result.id);
          return result;
        },
      }),
      getInformation: tool({
        description: `Get information from the knowledge base to answer general questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          console.log('Getting information for question:', question);
          const result = await findRelevantContent(question);
          console.log('Information found:', result ? 'Yes' : 'No');
          return result;
        },
      }),
      getUserProfile: tool({
        description: `Get the profile information for the current user.`,
        parameters: z.object({}),
        execute: async () => {
          console.log('Getting user profile for ID:', userId);
          const result = await getUserInfo(userId);
          console.log('User profile found:', result ? 'Yes' : 'No', result);
          return result;
        },
      }),
      getUserCourses: tool({
        description: `Get information about the courses the user is enrolled in.`,
        parameters: z.object({}),
        execute: async () => {
          console.log('Getting courses for user ID:', userId);
          const result = await getUserCoursesInfo(userId);
          console.log('User courses found:', result ? `Yes, count: ${result.length}` : 'No', result);
          return result;
        },
      }),
      getAllCourses: tool({
        description: `Get information about all courses available on the platform.`,
        parameters: z.object({}),
        execute: async () => {
          console.log('Getting all courses on the platform');
          const result = await getAllCoursesInfo();
          console.log('Platform courses found:', result ? `Yes, count: ${result.length}` : 'No', result);
          return result;
        },
      }),
      getUserAssignments: tool({
        description: `Get information about the assignments for the user.`,
        parameters: z.object({}),
        execute: async () => {
          console.log('Getting assignments for user ID:', userId);
          const result = await getUserAssignmentsInfo(userId);
          console.log('User assignments found:', result ? `Yes, count: ${result.length}` : 'No', result);
          return result;
        },
      }),
      getLecturers: tool({
        description: `Get information about all lecturers on the platform.`,
        parameters: z.object({}),
        execute: async () => {
          console.log('Getting all lecturers on the platform');
          const result = await getLecturers();
          console.log('Lecturers found:', result ? `Yes, count: ${result.length}` : 'No', result);
          return result;
        },
      }),
      getAverageGrades: tool({
        description: `Get average grades across all courses or for a specific user.`,
        parameters: z.object({
          targetUserId: z.string().optional().describe('Optional: specific user ID to get grades for, defaults to current user if not provided'),
        }),
        execute: async ({ targetUserId }) => {
          const targetId = targetUserId || userId;
          console.log('Getting average grades for user ID:', targetId);
          const result = await getAverageGrades(targetId);
          console.log('Grades data found:', result ? 'Yes' : 'No', result);
          return result;
        },
      }),
      getCourseGrades: tool({
        description: `Get grades for a specific course.`,
        parameters: z.object({
          courseId: z.string().describe('The course ID to get grades for'),
        }),
        execute: async ({ courseId }) => {
          console.log('Getting grades for course ID:', courseId);
          const result = await getCourseGrades(courseId);
          console.log('Course grades found:', result ? 'Yes' : 'No', result);
          return result;
        },
      }),
      getAllKnowledge: tool({
        description: `Get all resources in the knowledge base.`,
        parameters: z.object({}),
        execute: async () => {
          console.log('Getting all resources');
          const result = await getAllResources();
          console.log('Resources found:', result ? `Yes, count: ${result.length}` : 'No');
          return result;
        },
      }),
    },
    maxSteps: 3, // Allow multiple tool calls in one conversation turn
  });

  return result.toDataStreamResponse();
} 