/**
 * Vitest test setup file
 * Loads environment variables and sets up test utilities
 */

import { beforeAll } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables for testing
beforeAll(() => {
  dotenv.config({ path: '.env.local' });
});
