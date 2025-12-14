/**
 * ProposalIQ Storage Utilities
 * Handles PDF uploads, signed URL generation, and document management
 */

import { supabase, supabaseAdmin } from "@/lib/supabase";

const BUCKET_NAME = "piq-documents";

export type UploadDocumentParams = {
  orgId: string;
  opportunityId: string;
  file: File;
  userId?: string;
};

export type DocumentMetadata = {
  id: string;
  org_id: string;
  opportunity_id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  page_count?: number;
  created_at: string;
};

/**
 * Upload a document to Supabase Storage and create database record
 */
export async function uploadDocument(params: UploadDocumentParams): Promise<DocumentMetadata> {
  const { orgId, opportunityId, file, userId } = params;

  // Generate unique storage path: org_id/opportunity_id/filename_timestamp
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${orgId}/${opportunityId}/${timestamp}_${safeName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create database record
  const { data: docData, error: dbError } = await supabase
    .from("piq_documents")
    .insert({
      org_id: orgId,
      opportunity_id: opportunityId,
      filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Failed to create document record: ${dbError.message}`);
  }

  return docData;
}

/**
 * Generate a signed URL for viewing a document (valid for 1 hour)
 */
export async function getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Get document by ID with signed URL
 */
export async function getDocumentWithUrl(documentId: string) {
  const { data: doc, error } = await supabase
    .from("piq_documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !doc) {
    throw new Error(`Document not found: ${error?.message}`);
  }

  const signedUrl = await getSignedUrl(doc.storage_path);

  return {
    ...doc,
    url: signedUrl,
  };
}

/**
 * List all documents for an opportunity
 */
export async function listOpportunityDocuments(opportunityId: string) {
  const { data, error } = await supabase
    .from("piq_documents")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list documents: ${error.message}`);
  }

  return data;
}

/**
 * Delete a document (removes from storage and database)
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // Get document to find storage path
  const { data: doc, error: fetchError } = await supabase
    .from("piq_documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    throw new Error(`Document not found: ${fetchError?.message}`);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([doc.storage_path]);

  if (storageError) {
    console.error("Failed to delete from storage:", storageError);
  }

  // Delete database record
  const { error: dbError } = await supabase
    .from("piq_documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    throw new Error(`Failed to delete document record: ${dbError.message}`);
  }
}

/**
 * Update document metadata (e.g., after text extraction)
 */
export async function updateDocumentMetadata(
  documentId: string,
  updates: {
    page_count?: number;
    extracted_text?: string;
    extracted_meta?: Record<string, unknown>;
  }
) {
  const { error } = await supabase
    .from("piq_documents")
    .update(updates)
    .eq("id", documentId);

  if (error) {
    throw new Error(`Failed to update document metadata: ${error.message}`);
  }
}
