import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchOpportunityById } from "@/lib/sam-gov";

/**
 * GET /api/analyses
 *
 * Fetches all analyses for the authenticated user's organization
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 }
      );
    }

    // Fetch analyses with their related opportunity and scorecard data
    const { data: analyses, error } = await supabase
      .from("opportunity_analysis")
      .select(`
        *,
        opportunity:opportunities(*),
        scorecard:opportunity_scorecards(*)
      `)
      .eq("org_id", membership.org_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses:", error);
      return NextResponse.json(
        { error: "Failed to fetch analyses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/analyses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analyses
 *
 * Creates a new analysis from a SAM.gov opportunity
 *
 * Body:
 * {
 *   notice_id: string;        // SAM.gov notice ID
 *   analysis_type?: string;   // "quick_scan" | "full_analysis" | "deep_dive" (default: "full_analysis")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { notice_id, analysis_type = "full_analysis" } = body;

    if (!notice_id) {
      return NextResponse.json(
        { error: "notice_id is required" },
        { status: 400 }
      );
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found for user" },
        { status: 404 }
      );
    }

    // Step 1: Fetch opportunity from SAM.gov
    console.log(`Fetching SAM.gov opportunity: ${notice_id}`);
    const samOpportunity = await fetchOpportunityById(notice_id);

    if (!samOpportunity) {
      return NextResponse.json(
        { error: "Opportunity not found in SAM.gov" },
        { status: 404 }
      );
    }

    // Step 2: Check if opportunity already exists in database
    let opportunityId: string;
    const { data: existingOpp } = await supabase
      .from("opportunities")
      .select("id")
      .eq("org_id", membership.org_id)
      .eq("notice_id", notice_id)
      .single();

    if (existingOpp) {
      opportunityId = existingOpp.id;
      console.log(`Using existing opportunity: ${opportunityId}`);
    } else {
      // Step 3: Create new opportunity record
      const { data: newOpp, error: oppError } = await supabase
        .from("opportunities")
        .insert({
          org_id: membership.org_id,
          source: "SAM",
          notice_id: notice_id,
          solicitation_number: samOpportunity.solicitationNumber,
          title: samOpportunity.title,
          agency: samOpportunity.department,
          posted_date: samOpportunity.postedDate,
          due_date: samOpportunity.responseDeadLine,
          status: "new",
          raw: samOpportunity,
        })
        .select()
        .single();

      if (oppError || !newOpp) {
        console.error("Error creating opportunity:", oppError);
        return NextResponse.json(
          { error: "Failed to create opportunity record" },
          { status: 500 }
        );
      }

      opportunityId = newOpp.id;
      console.log(`Created new opportunity: ${opportunityId}`);
    }

    // Step 4: Create analysis placeholder (status: processing)
    const { data: analysis, error: analysisError } = await supabase
      .from("opportunity_analysis")
      .insert({
        org_id: membership.org_id,
        opportunity_id: opportunityId,
        schema_version: "1.0",
        analysis: {
          status: "processing",
          analysis_type,
          started_at: new Date().toISOString(),
          source_data: {
            notice_id,
            title: samOpportunity.title,
            agency: samOpportunity.department,
            description: samOpportunity.description,
          }
        },
        created_by: user.id,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      console.error("Error creating analysis:", analysisError);
      return NextResponse.json(
        { error: "Failed to create analysis record" },
        { status: 500 }
      );
    }

    // Step 5: Trigger async analysis (you can integrate with n8n or background job here)
    // For MVP, return immediately with processing status
    // TODO: Call your n8n webhook or analysis service here

    // Example n8n webhook integration (uncomment when ready):
    /*
    const n8nWebhook = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhook) {
      await fetch(n8nWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_WEBHOOK_AUTH}`,
        },
        body: JSON.stringify({
          analysis_id: analysis.id,
          opportunity_id: opportunityId,
          org_id: membership.org_id,
          notice_id,
          analysis_type,
          sam_data: samOpportunity,
        }),
      });
    }
    */

    return NextResponse.json({
      success: true,
      data: {
        analysis_id: analysis.id,
        opportunity_id: opportunityId,
        status: "processing",
        message: "Analysis started. You will be notified when complete.",
      },
    }, { status: 202 }); // 202 Accepted

  } catch (error) {
    console.error("Unexpected error in POST /api/analyses:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/analyses/:id
 *
 * Updates an existing analysis (typically called by n8n webhook after processing)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // For webhook calls, verify auth token
    const authHeader = request.headers.get("authorization");
    const webhookAuth = process.env.N8N_WEBHOOK_AUTH;

    // Check if this is a webhook call or user call
    const isWebhook = authHeader === `Bearer ${webhookAuth}`;

    if (!isWebhook) {
      // Regular user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { analysis_id, analysis_data, scorecard_data, compliance_matrix } = body;

    if (!analysis_id) {
      return NextResponse.json(
        { error: "analysis_id is required" },
        { status: 400 }
      );
    }

    // Update analysis
    if (analysis_data) {
      const { error: updateError } = await supabase
        .from("opportunity_analysis")
        .update({
          analysis: analysis_data,
        })
        .eq("id", analysis_id);

      if (updateError) {
        console.error("Error updating analysis:", updateError);
        return NextResponse.json(
          { error: "Failed to update analysis" },
          { status: 500 }
        );
      }
    }

    // Create scorecard if provided
    if (scorecard_data) {
      const { data: analysisRecord } = await supabase
        .from("opportunity_analysis")
        .select("org_id, opportunity_id")
        .eq("id", analysis_id)
        .single();

      if (analysisRecord) {
        await supabase
          .from("opportunity_scorecards")
          .insert({
            org_id: analysisRecord.org_id,
            opportunity_id: analysisRecord.opportunity_id,
            analysis_id,
            schema_version: "1.0",
            scorecard: scorecard_data,
          });
      }
    }

    // Create compliance matrix if provided
    if (compliance_matrix) {
      const { data: analysisRecord } = await supabase
        .from("opportunity_analysis")
        .select("org_id, opportunity_id")
        .eq("id", analysis_id)
        .single();

      if (analysisRecord) {
        await supabase
          .from("opportunity_compliance_matrices")
          .insert({
            org_id: analysisRecord.org_id,
            opportunity_id: analysisRecord.opportunity_id,
            analysis_id,
            schema_version: "1.0",
            matrix: compliance_matrix,
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Analysis updated successfully",
    });

  } catch (error) {
    console.error("Unexpected error in PUT /api/analyses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
