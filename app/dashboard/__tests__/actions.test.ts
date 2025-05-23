import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '@/lib/db';
import { 
  getUserById,
  createCourse,
  getAllCourses,
  createAssignment,
  submitAssignment,
  getStudentDashboardData,
  getLecturerDashboardData
} from '../actions';

// Note: We use 'any' type for mocks because Drizzle's types are complex and
// we only need to mock the specific behavior needed for each test.
// In a real application, we would want to create proper type definitions.

// Mock the database
vi.mock('@/lib/db', () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
    query: {
      users: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      courses: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      assignments: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      userCourses: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      assignmentSubmissions: {
        findFirst: vi.fn(),
      },
    },
  };
  return { db: mockDb };
});

describe('User Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return null for empty id', async () => {
      const result = await getUserById('');
      expect(result).toBeNull();
    });

    it('should return user data for valid id', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@test.com',
        role: 'student',
      };

      vi.mocked(db.select).mockImplementation(() => ({
        from: () => ({
          where: () => Promise.resolve([mockUser])
        })
      }) as any);

      const result = await getUserById('123');
      expect(result).toEqual(mockUser);
    });
  });
});

describe('Course Actions', () => {
  describe('createCourse', () => {
    it('should create a new course', async () => {
      const mockCourse = {
        id: '123',
        name: 'Test Course',
        lecturerId: '456',
      };

      vi.mocked(db.insert).mockImplementation(() => ({
        values: () => ({
          returning: () => Promise.resolve([mockCourse])
        })
      }) as any);

      const result = await createCourse('Test Course', '456');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('getAllCourses', () => {
    it('should return all courses with enrollment counts', async () => {
      const mockCourses = [{
        id: '123',
        name: 'Test Course',
        lecturerId: '456',
        creatorName: 'Test Lecturer',
      }];

      const mockEnrollments = [{
        courseId: '123',
        count: 5,
      }];

      const mockAssignments = [{
        courseId: '123',
        count: 3,
      }];

      vi.mocked(db.select)
        .mockImplementationOnce(() => ({
          from: () => ({
            leftJoin: () => Promise.resolve(mockCourses)
          })
        }) as any)
        .mockImplementationOnce(() => ({
          from: () => ({
            groupBy: () => Promise.resolve(mockEnrollments)
          })
        }) as any)
        .mockImplementationOnce(() => ({
          from: () => ({
            groupBy: () => Promise.resolve(mockAssignments)
          })
        }) as any);

      const result = await getAllCourses();
      expect(result[0]).toHaveProperty('enrollmentCount', 5);
      expect(result[0]).toHaveProperty('assignmentCount', 3);
    });
  });
});

describe('Assignment Actions', () => {
  describe('createAssignment', () => {
    it('should create a new assignment', async () => {
      const mockAssignment = {
        id: '123',
        name: 'Test Assignment',
        courseId: '456',
        deadline: new Date(),
      };

      vi.mocked(db.insert).mockImplementation(() => ({
        values: () => ({
          returning: () => Promise.resolve([mockAssignment])
        })
      }) as any);

      const result = await createAssignment({
        name: 'Test Assignment',
        courseId: '456',
        deadline: Date.now(),
      });

      expect(result).toEqual(mockAssignment);
    });
  });

  describe('submitAssignment', () => {
    it('should submit a new assignment', async () => {
      const mockSubmission = {
        assignmentId: '123',
        studentId: '456',
        content: 'Test submission',
      };

      vi.mocked(db.query.assignmentSubmissions.findFirst).mockResolvedValue(undefined);
      vi.mocked(db.insert).mockImplementation(() => ({
        values: () => Promise.resolve()
      }) as any);

      const result = await submitAssignment(mockSubmission);
      expect(result).toEqual({ success: true });
    });
  });
});

describe('Dashboard Actions', () => {
  describe('getStudentDashboardData', () => {
    it('should return student dashboard data', async () => {
      const mockStats = {
        totalStudents: 10,
        newStudentsLastMonth: 2,
        totalSubmissions: 50,
        submissionsLastMonth: 15,
        averageScore: 85.5,
      };

      vi.mocked(db.select).mockImplementation(() => ({
        from: () => ({
          leftJoin: () => ({
            where: () => Promise.resolve([mockStats])
          })
        })
      }) as any);

      const result = await getStudentDashboardData('123');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('completion');
      expect(result).toHaveProperty('engagement');
    });
  });

  describe('getLecturerDashboardData', () => {
    it('should return lecturer dashboard data', async () => {
      const mockCourseStats = [{
        courseId: '123',
        courseName: 'Test Course',
        studentCount: 10,
        avgScore: 85.5,
        submissions: 50,
        completionRate: 75.0,
      }];

      vi.mocked(db.select).mockImplementation(() => ({
        from: () => ({
          leftJoin: () => ({
            where: () => Promise.resolve(mockCourseStats)
          })
        })
      }) as any);

      const result = await getLecturerDashboardData('123');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('completion');
      expect(result).toHaveProperty('engagement');
    });
  });
}); 