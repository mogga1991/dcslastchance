import { createClient } from '@/lib/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload images to Supabase Storage
 * @param files - Array of File objects to upload
 * @param folder - Folder name in the bucket (e.g., 'listings', 'avatars')
 * @returns Array of uploaded image URLs
 */
export async function uploadImages(
  files: File[],
  folder: string = 'listings'
): Promise<UploadResult[]> {
  const supabase = createClient();
  const results: UploadResult[] = [];

  console.log(`[Image Upload] Starting upload of ${files.length} file(s) to folder: ${folder}`);

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    const errorMsg = 'Authentication required to upload images';
    console.error('[Image Upload] Auth error:', authError?.message || 'No user');
    throw new Error(errorMsg);
  }

  console.log(`[Image Upload] User authenticated: ${user.id}`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[Image Upload] Processing file ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const error = `${file.name} is not an image file (type: ${file.type})`;
        console.warn(`[Image Upload] ${error}`);
        results.push({
          url: '',
          path: '',
          error
        });
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        const error = `${file.name} exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        console.warn(`[Image Upload] ${error}`);
        results.push({
          url: '',
          path: '',
          error
        });
        continue;
      }

      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${folder}/${user.id}/${fileName}`;

      console.log(`[Image Upload] Uploading to path: ${filePath}`);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`[Image Upload] Upload failed for ${file.name}:`, error);
        results.push({
          url: '',
          path: '',
          error: `Failed to upload ${file.name}: ${error.message}`
        });
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      console.log(`[Image Upload] ✅ Success: ${file.name} -> ${publicUrl}`);

      results.push({
        url: publicUrl,
        path: filePath,
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Image Upload] Unexpected error for ${file.name}:`, error);
      results.push({
        url: '',
        path: '',
        error: `Unexpected error uploading ${file.name}: ${errorMsg}`
      });
    }
  }

  const successCount = results.filter(r => r.url).length;
  const failCount = results.filter(r => r.error).length;
  console.log(`[Image Upload] Complete: ${successCount} succeeded, ${failCount} failed`);

  return results;
}

/**
 * Delete an image from Supabase Storage
 * @param path - File path in storage (from UploadResult.path)
 */
export async function deleteImage(path: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from('uploads')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}

/**
 * Delete multiple images from Supabase Storage
 * @param paths - Array of file paths in storage
 */
export async function deleteImages(paths: string[]): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from('uploads')
    .remove(paths);

  if (error) {
    console.error('Error deleting images:', error);
    return false;
  }

  return true;
}
