import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Pool } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      opportunity_id,
      opportunity_title,
      user_email,
      user_phone,
      property_address,
      property_id,
      message,
    } = body;

    // Validate required fields
    if (!opportunity_id || !opportunity_title || !user_email || !property_address) {
      return NextResponse.json(
        { error: "Missing required fields: opportunity_id, opportunity_title, user_email, property_address" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (user_phone && user_phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(user_phone)) {
        return NextResponse.json(
          { error: "Invalid phone format" },
          { status: 400 }
        );
      }
    }

    // Connect to Neon database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Find or create user in Neon by email
    const userResult = await pool.query(
      'SELECT id FROM "user" WHERE email = $1 LIMIT 1',
      [user_email.trim()]
    );

    let neonUserId = userResult.rows[0]?.id;

    if (!neonUserId) {
      // User doesn't exist, use Supabase user ID as fallback
      neonUserId = user.id;
    }

    // Create inquiry in Neon database
    const result = await pool.query(
      `INSERT INTO opportunity_inquiries
       (opportunity_id, opportunity_title, user_id, user_email, user_phone, property_address, property_id, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        opportunity_id.trim(),
        opportunity_title.trim(),
        neonUserId,
        user_email.trim(),
        user_phone?.trim() || null,
        property_address.trim(),
        property_id || null,
        message?.trim() || null,
        'new'
      ]
    );

    await pool.end();

    return NextResponse.json(
      {
        success: true,
        inquiry: result.rows[0],
        message: "Interest submitted successfully! We'll be in touch within 24 hours.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's inquiries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");

    // Connect to Neon database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Get user's email from Supabase
    const userEmail = user.email;

    // Build query
    let query = `SELECT * FROM opportunity_inquiries WHERE user_email = $1`;
    const params: (string | number)[] = [userEmail || ''];

    // Add status filter if provided
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    await pool.end();

    return NextResponse.json({
      success: true,
      inquiries: result.rows,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
