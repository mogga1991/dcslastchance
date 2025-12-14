import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI Extraction Endpoint
 * Takes a document ID and extracts RFP data using Claude
 */
export async function POST(req: NextRequest) {
  try {
    const { documentId, analysisType = "full_analysis" } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    // Step 1: Get document from database
    const { data: document, error: docError } = await supabaseAdmin
      .from("piq_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Step 2: Get signed URL for the PDF
    const { data: urlData } = await supabaseAdmin.storage
      .from("piq-documents")
      .createSignedUrl(document.storage_path, 3600);

    if (!urlData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate PDF URL" },
        { status: 500 }
      );
    }

    // Step 3: Download PDF content (for text extraction)
    // In production, you'd use a PDF parsing library here
    // For now, we'll simulate with a placeholder
    const pdfText = await extractPDFText(urlData.signedUrl);

    // Step 4: Call Claude for extraction
    const extractionPrompt = getExtractionPrompt(analysisType);
    const extractedData = await extractWithClaude(pdfText, extractionPrompt);

    // Step 5: Save analysis to database
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from("piq_analysis")
      .insert({
        org_id: document.org_id,
        opportunity_id: document.opportunity_id,
        document_id: documentId,
        schema_version: "1.0",
        analysis: extractedData.analysis,
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to save analysis: ${analysisError.message}`);
    }

    // Step 6: Save scorecard if included
    if (extractedData.scorecard) {
      await supabaseAdmin.from("piq_scorecards").insert({
        org_id: document.org_id,
        opportunity_id: document.opportunity_id,
        analysis_id: analysis.id,
        schema_version: "1.0",
        scorecard: extractedData.scorecard,
      });
    }

    // Step 7: Save compliance matrix if included
    if (extractedData.matrix) {
      await supabaseAdmin.from("piq_compliance_matrices").insert({
        org_id: document.org_id,
        opportunity_id: document.opportunity_id,
        analysis_id: analysis.id,
        schema_version: "1.0",
        matrix: extractedData.matrix,
      });
    }

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      opportunityId: document.opportunity_id,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * Extract text from PDF
 * In production, use pdf-parse or similar library
 */
async function extractPDFText(pdfUrl: string): Promise<string> {
  // TODO: Implement actual PDF text extraction
  // For now, return placeholder
  return `[PDF content would be extracted here from ${pdfUrl}]`;
}

/**
 * Get extraction prompt based on analysis type
 */
function getExtractionPrompt(analysisType: string): string {
  if (analysisType === "quick_scan") {
    return QUICK_SCAN_PROMPT;
  }
  return FULL_ANALYSIS_PROMPT;
}

/**
 * Call Claude API for extraction
 */
async function extractWithClaude(
  pdfText: string,
  systemPrompt: string
): Promise<{
  analysis: any;
  scorecard?: any;
  matrix?: any;
}> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    temperature: 0,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Analyze this RFP document and extract the requested information:\n\n${pdfText}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Parse JSON response
  try {
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : content.text;
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Failed to parse Claude response as JSON");
  }
}

/**
 * Quick Scan Extraction Prompt
 */
const QUICK_SCAN_PROMPT = `You are an expert RFP analyst. Extract the following information from the document:

Return ONLY valid JSON in this exact format:

{
  "analysis": {
    "extraction_metadata": {
      "document_type": "rfp",
      "extraction_confidence": "high",
      "extracted_at": "2024-12-13T00:00:00Z"
    },
    "opportunity_snapshot": {
      "title": "...",
      "agency": "...",
      "solicitation_number": "..."
    },
    "key_dates": {
      "questions_due": { "date": "YYYY-MM-DD", "time": "HH:MM" },
      "proposal_due": { "date": "YYYY-MM-DD", "time": "HH:MM" },
      "anticipated_award": "YYYY-MM-DD"
    }
  }
}`;

/**
 * Full Analysis Extraction Prompt
 */
const FULL_ANALYSIS_PROMPT = `You are an expert RFP analyst. Perform a comprehensive analysis of this government solicitation.

Extract ALL the following information and return ONLY valid JSON:

{
  "analysis": {
    "extraction_metadata": {
      "document_type": "rfp",
      "extraction_confidence": "high",
      "extracted_at": "ISO timestamp"
    },
    "opportunity_snapshot": {
      "solicitation_number": "string",
      "title": "string",
      "agency": "string",
      "naics_code": "string",
      "set_aside": { "type": "string", "percentage": number },
      "contract_type": "string",
      "estimated_value": { "low": number, "high": number },
      "security_requirements": { "clearance_level": "string" }
    },
    "key_dates": {
      "questions_due": { "date": "YYYY-MM-DD", "time": "HH:MM" },
      "proposal_due": { "date": "YYYY-MM-DD", "time": "HH:MM" },
      "anticipated_award": "YYYY-MM-DD"
    },
    "requirements": {
      "technical_requirements": [
        { "description": "string", "priority": "Must|Should|May" }
      ],
      "management_requirements": [
        { "description": "string", "priority": "Must|Should|May" }
      ]
    },
    "evaluation_criteria": {
      "evaluation_method": "LPTA|Best_Value|Tradeoff",
      "factors": [
        { "name": "string", "weight": number, "description": "string" }
      ]
    }
  },
  "scorecard": {
    "overall_score": number (0-100),
    "decision": "STRONG_BID|CONDITIONAL_BID|EVALUATE_FURTHER|NO_BID",
    "confidence": number (0-100),
    "category_scores": {
      "technical_alignment": { "score": number, "weight": 0.25, "weighted": number },
      "past_performance": { "score": number, "weight": 0.20, "weighted": number },
      "competitive_position": { "score": number, "weight": 0.20, "weighted": number },
      "resource_availability": { "score": number, "weight": 0.15, "weighted": number },
      "strategic_value": { "score": number, "weight": 0.10, "weighted": number },
      "pursuit_roi": { "score": number, "weight": 0.10, "weighted": number }
    },
    "strengths": ["string"],
    "weaknesses": ["string"],
    "hard_stops": [{ "type": "string", "detail": "string" }]
  },
  "matrix": {
    "compliance_matrix": {
      "metadata": {
        "total_requirements": number,
        "must_have_count": number,
        "should_have_count": number,
        "may_have_count": number
      },
      "rows": [
        {
          "req_id": "REQ-001",
          "priority": "Must|Should|May",
          "requirement_type": "string",
          "requirement_statement": "string",
          "status": "Not Started",
          "source": {
            "page": number,
            "section": "string",
            "text_snippet": "string",
            "confidence": number
          }
        }
      ]
    }
  }
}

Important:
- Extract ALL requirements with page numbers
- Calculate realistic bid scores based on typical government contractor capabilities
- Flag any hard stops (clearance, certifications, mandatory requirements)
- Be thorough and accurate`;
