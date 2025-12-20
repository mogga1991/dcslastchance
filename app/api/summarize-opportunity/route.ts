/**
 * API Route: /api/summarize-opportunity
 * 
 * Generates AI summaries of GSA opportunities with caching
 * 
 * GET /api/summarize-opportunity?id=<opportunity_id>
 *   - Returns cached summary if exists
 *   - Returns null if no summary (doesn't auto-generate)
 * 
 * POST /api/summarize-opportunity
 *   - Body: { opportunityId: string, forceRefresh?: boolean }
 *   - Generates new summary (or returns cached)
 *   - Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  summarizeOpportunity, 
  generateFallbackSummary,
  type OpportunityInput,
  type OpportunitySummary 
} from '@/lib/ai/summarize-opportunity';

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

// =============================================================================
// GET - Retrieve cached summary
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('id');
    
    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Missing opportunity ID' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseAdmin();
    
    // Check cache
    const { data: cached, error } = await supabase
      .from('ai_summaries')
      .select('summary, model_used, created_at, prompt_version')
      .eq('opportunity_id', opportunityId)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected)
      console.error('Cache lookup error:', error);
    }
    
    if (cached) {
      return NextResponse.json({
        summary: cached.summary,
        cached: true,
        model: cached.model_used,
        generatedAt: cached.created_at,
        promptVersion: cached.prompt_version
      });
    }
    
    return NextResponse.json({
      summary: null,
      cached: false,
      message: 'No cached summary. POST to generate.'
    });
    
  } catch (error) {
    console.error('GET /api/summarize-opportunity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Generate summary
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, forceRefresh = false, useFallback = false } = body;
    
    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Missing opportunityId' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseAdmin();
    
    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('ai_summaries')
        .select('summary, model_used, created_at, prompt_version')
        .eq('opportunity_id', opportunityId)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (cached) {
        return NextResponse.json({
          summary: cached.summary,
          cached: true,
          model: cached.model_used,
          generatedAt: cached.created_at
        });
      }
    }
    
    // Fetch opportunity data
    const { data: opportunity, error: fetchError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    
    if (fetchError || !opportunity) {
      // Try fetching by notice_id
      const { data: oppByNotice } = await supabase
        .from('opportunities')
        .select('*')
        .eq('notice_id', opportunityId)
        .single();
      
      if (!oppByNotice) {
        return NextResponse.json(
          { error: 'Opportunity not found' },
          { status: 404 }
        );
      }
      
      Object.assign(opportunity || {}, oppByNotice);
    }
    
    // Build input for summarization
    const input: OpportunityInput = {
      title: opportunity.title || '',
      description: opportunity.description || '',
      solicitationNumber: opportunity.solicitation_number || opportunity.notice_id,
      placeOfPerformance: {
        state: opportunity.state || opportunity.place_state,
        city: opportunity.city || opportunity.place_city,
        zip: opportunity.zip || opportunity.place_zip
      },
      responseDeadline: opportunity.response_deadline || opportunity.response_date
    };
    
    let summary: OpportunitySummary;
    let model = 'fallback';
    let tokensUsed = 0;
    let generationTimeMs = 0;
    let promptVersion = 'v1';
    
    // Generate summary
    if (useFallback || !process.env.ANTHROPIC_API_KEY) {
      // Use regex-based fallback
      summary = generateFallbackSummary(input);
      model = 'fallback-regex';
    } else {
      // Use Claude API
      try {
        const result = await summarizeOpportunity(input);
        summary = result.summary;
        model = result.model;
        tokensUsed = result.tokensUsed;
        generationTimeMs = result.generationTimeMs;
        promptVersion = result.promptVersion;
      } catch (aiError) {
        console.error('AI summarization failed, using fallback:', aiError);
        summary = generateFallbackSummary(input);
        model = 'fallback-error';
      }
    }
    
    // Cache the result
    const { error: cacheError } = await supabase
      .from('ai_summaries')
      .upsert({
        opportunity_id: opportunityId,
        notice_id: opportunity.notice_id,
        summary,
        raw_description: input.description?.slice(0, 10000), // Truncate for storage
        model_used: model,
        tokens_used: tokensUsed,
        generation_time_ms: generationTimeMs,
        prompt_version: promptVersion,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }, {
        onConflict: 'opportunity_id'
      });
    
    if (cacheError) {
      console.error('Failed to cache summary:', cacheError);
    }
    
    return NextResponse.json({
      summary,
      cached: false,
      model,
      tokensUsed,
      generationTimeMs,
      promptVersion
    });
    
  } catch (error) {
    console.error('POST /api/summarize-opportunity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
