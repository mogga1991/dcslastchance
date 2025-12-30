/**
 * Find a SAM.gov opportunity with PDF attachment for testing
 * Run: npx tsx scripts/find-pdf-for-test.ts
 */

import dotenv from 'dotenv';
import { fetchGSALeaseOpportunities } from '../lib/sam-gov';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function findPDFForTest() {
  try {
    console.log('🔍 Searching for SAM.gov opportunity with PDF attachment...\n');

    const opportunities = await fetchGSALeaseOpportunities();

    console.log(`Found ${opportunities.length} total opportunities\n`);

    // Find first opportunity with PDF attachments
    for (const opp of opportunities) {
      if (opp.resourceLinks && opp.resourceLinks.length > 0) {
        const pdfLinks = opp.resourceLinks.filter(link =>
          link.toLowerCase().endsWith('.pdf')
        );

        if (pdfLinks.length > 0) {
          console.log('✅ Found opportunity with PDF attachment:\n');
          console.log(`Title: ${opp.title}`);
          console.log(`Notice ID: ${opp.noticeId}`);
          console.log(`Solicitation #: ${opp.solicitationNumber}`);
          console.log(`\nPDF Attachments (${pdfLinks.length}):`);

          pdfLinks.forEach((link, i) => {
            console.log(`  ${i + 1}. ${link}`);
          });

          console.log('\n📋 To test PDF processor, run:');
          console.log(`\nnpx tsx scripts/test-pdf-processor.ts "${pdfLinks[0]}"\n`);

          process.exit(0);
        }
      }
    }

    console.log('❌ No opportunities found with PDF attachments in current results.');
    console.log('Try expanding the date range or checking SAM.gov directly.\n');
  } catch (error) {
    console.error('\n❌ Error finding PDF:');
    console.error(error);
    process.exit(1);
  }
}

// Run search
findPDFForTest();
