import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch capability documents
    const { data: documents, error } = await supabase
      .from("capability_documents")
      .select("*")
      .eq("org_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching capability documents:", error);
      return NextResponse.json(
        { error: "Failed to fetch capability documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Capability documents API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = [
      "capability_statement",
      "cpars",
      "ppq",
      "resume",
      "insurance_coi",
      "license",
      "bonding_letter",
      "safety_plan",
      "cyber_policy",
      "other",
    ];

    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("capability-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("capability-documents").getPublicUrl(fileName);

    // Create document record
    const { data: document, error } = await supabase
      .from("capability_documents")
      .insert({
        org_id: user.id,
        document_type: documentType,
        filename: file.name,
        mime_type: file.type,
        storage_url: publicUrl,
        file_size_bytes: file.size,
        created_by: user.id,
        status: "uploaded",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating document record:", error);
      return NextResponse.json(
        { error: "Failed to create document record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Capability documents API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
