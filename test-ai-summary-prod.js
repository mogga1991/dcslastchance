#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Set production flag
process.env.TEST_PROD = 'true';

// Run the test
require('./test-ai-summary.js');
