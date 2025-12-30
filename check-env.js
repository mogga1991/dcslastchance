#!/usr/bin/env node
/**
 * Environment Variable Diagnostic Tool
 * Checks for SAM_API_KEY conflicts between shell env and .env.local
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FedSpace Environment Diagnostic\n');

// Check shell environment
const shellApiKey = process.env.SAM_API_KEY;
console.log('1️⃣  Shell Environment Variable:');
if (shellApiKey) {
  console.log(`   ⚠️  SAM_API_KEY is SET in shell: ${shellApiKey.substring(0, 15)}...`);
  console.log('   ❌ This will override .env.local!\n');
} else {
  console.log('   ✅ SAM_API_KEY not set in shell (good!)\n');
}

// Check .env.local file
const envLocalPath = path.join(__dirname, '.env.local');
console.log('2️⃣  .env.local File:');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const match = envContent.match(/SAM_API_KEY=["']?([^"'\n]+)["']?/);
  if (match) {
    console.log(`   ✅ SAM_API_KEY found: ${match[1].substring(0, 15)}...\n`);
  } else {
    console.log('   ❌ SAM_API_KEY not found in .env.local\n');
  }
} else {
  console.log('   ❌ .env.local file does not exist\n');
}

// Check which will be used
console.log('3️⃣  Which key will Next.js use?');
if (shellApiKey) {
  console.log(`   Shell env var (PROBLEM!): ${shellApiKey.substring(0, 15)}...`);
  console.log('\n❌ FIX REQUIRED:\n');
  console.log('   Solution 1: Use ./dev.sh to start the server');
  console.log('   Solution 2: Close terminal and open a new one');
  console.log('   Solution 3: Run: unset SAM_API_KEY && npm run dev\n');
} else {
  console.log('   ✅ .env.local file (correct!)\n');
  console.log('✅ Environment is configured correctly!\n');
}

// Check shell config files
console.log('4️⃣  Checking shell config files:');
const homeDir = require('os').homedir();
const shellConfigs = ['.zshrc', '.bashrc', '.bash_profile', '.zprofile'];

for (const config of shellConfigs) {
  const configPath = path.join(homeDir, config);
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    if (content.includes('SAM_API_KEY')) {
      console.log(`   ⚠️  ${config} mentions SAM_API_KEY`);
    }
  }
}
console.log('');
