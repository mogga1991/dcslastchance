#!/usr/bin/env node
// Quick script to fix remaining lint issues

const fs = require('fs');

// Fix files with simple unused import removals
const fixes = [
  {
    file: 'app/dashboard/gsa-leasing/_components/expiring-lease-card.tsx',
    find: 'any',
    replace: 'unknown'
  },
  {
    file: 'app/dashboard/gsa-leasing/_components/express-interest-modal.tsx',
    find: "We've notified the broker",
    replace: "We&apos;ve notified the broker"
  },
  {
    file: 'app/dashboard/gsa-leasing/_components/express-interest-modal.tsx',
    find: "broker's availability",
    replace: "broker&apos;s availability"
  },
  {
    file: 'app/dashboard/gsa-leasing/_components/express-interest-modal.tsx',
    find: "Don't have a listing yet",
    replace: "Don&apos;t have a listing yet"
  },
  {
    file: 'app/dashboard/gsa-leasing/_components/express-interest-modal.tsx',
    find: "We'll match you",
    replace: "We&apos;ll match you"
  }
];

console.log('Manual fixes needed - see output');
