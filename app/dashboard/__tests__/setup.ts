import { beforeAll, afterAll, afterEach } from 'vitest';
import { vi } from 'vitest';

beforeAll(() => {
  // Setup any test environment variables or global mocks
  vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
  }));
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetModules();
}); 