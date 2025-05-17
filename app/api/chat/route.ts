import { 
  createResource,
  getUserInfo, 
  getUserCoursesInfo, 
  getUserAssignmentsInfo,
  getAllResources,
  getAllCoursesInfo,
  getLecturers,
  getAverageGrades,
  getCourseGrades,
  saveChatMessages,
  createChatWithMessages,
} from '@/app/dashboard/actions';
import { findRelevantContent } from '@/lib/ai/embedding';
import { openai } from '@ai-sdk/openai';
import { streamText, tool, createDataStreamResponse } from 'ai';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { ChatMessageInsert } from '@/lib/db/drizzle/schema';


export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();
  const session = await auth();
  const userId = session?.user?.id;
  

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userInfo = await getUserInfo(userId);
  const userRole = userInfo?.role || 'student';
  
  // Get the last user message to save in chat
  const lastUserMessage = messages[messages.length - 1];
  
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

  return createDataStreamResponse({
    execute: dataStream => {
      // Send initial data
      dataStream.writeData({ status: 'initialized', role: userRole });

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
              const result = await createResource({ content });
              return result;
            },
          }),
          getInformation: tool({
            description: `Get information from the knowledge base to answer general questions.`,
            parameters: z.object({
              question: z.string().describe('the users question'),
            }),
            execute: async ({ question }) => {
              const result = await findRelevantContent(question);
              return result;
            },
          }),
          getUserProfile: tool({
            description: `Get the profile information for the current user.`,
            parameters: z.object({}),
            execute: async () => {
              const result = await getUserInfo(userId);
              return result;
            },
          }),
          getUserCourses: tool({
            description: `Get information about the courses the user is enrolled in.`,
            parameters: z.object({}),
            execute: async () => {
              const result = await getUserCoursesInfo(userId);
              return result;
            },
          }),
          getAllCourses: tool({
            description: `Get information about all courses available on the platform.`,
            parameters: z.object({}),
            execute: async () => {
              const result = await getAllCoursesInfo();
              return result;
            },
          }),
          getUserAssignments: tool({
            description: `Get information about the assignments for the user.`,
            parameters: z.object({}),
            execute: async () => {
              const result = await getUserAssignmentsInfo(userId);
              return result;
            },
          }),
          getLecturers: tool({
            description: `Get information about all lecturers on the platform.`,
            parameters: z.object({}),
            execute: async () => {
              const result = await getLecturers();
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
              const result = await getAverageGrades(targetId);
              return result;
            },
          }),
          getCourseGrades: tool({
            description: `Get grades for a specific course.`,
            parameters: z.object({
              courseId: z.string().describe('The course ID to get grades for'),
            }),
            execute: async ({ courseId }) => {
              const result = await getCourseGrades(courseId);
              return result;
            },
          }),
          getAllKnowledge: tool({
            description: `Get all resources in the knowledge base.`,
            parameters: z.object({}),
            execute: async () => {
              const result = await getAllResources();
              return result;
            },
          }),
        },
        onChunk: () => {
          // Update status with each chunk (optional)
          dataStream.writeData({ status: 'generating' });
        },
        onFinish: async () => {
          try {
            const responseText = await result.text;
            const lastMessages: ChatMessageInsert[] = [
              {
                chatId: chatId,
                content: lastUserMessage.content,
                role: 'user'
              },
              {
                chatId: chatId,
                content: responseText,
                role: 'assistant'
              }
            ];

            // Save chat messages
            if (chatId) {
              await saveChatMessages({
                userId,
                chatId,
                messages: lastMessages
              });
            } else {
              const newChat = await createChatWithMessages({
                userId,
                messages: lastMessages
              });
              
              // Send the new chat ID in the data stream
              if (newChat?.chat?.id) {
                dataStream.writeMessageAnnotation({
                  newChatId: newChat.chat.id
                });
              }
            }
            
            // Write final completion data
            dataStream.writeData({ 
              status: 'complete',
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error saving chat:', error);
            dataStream.writeData({ 
              status: 'error',
              message: 'Failed to save chat'
            });
          }
        },
        maxSteps: 3,
      });

      // Merge the text stream into the data stream
      result.mergeIntoDataStream(dataStream);
    },
    onError: error => {
      console.error('Stream error:', error);
      return error instanceof Error ? error.message : String(error);
    },
  });
} 