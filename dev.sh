#!/bin/bash
# Start dev server without SAM_API_KEY environment variable
# This forces Next.js to use .env.local instead

unset SAM_API_KEY
npm run dev
