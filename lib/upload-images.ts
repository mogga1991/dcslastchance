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

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to upload images');
  }

  for (const file of files) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        results.push({
          url: '',
          path: '',
          error: `${file.name} is not an image file`
        });
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        results.push({
          url: '',
          path: '',
          error: `${file.name} exceeds 10MB limit`
        });
        continue;
      }

      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${folder}/${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
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

      results.push({
        url: publicUrl,
        path: filePath,
      });

    } catch (error) {
      console.error('Error uploading file:', file.name, error);
      results.push({
        url: '',
        path: '',
        error: `Unexpected error uploading ${file.name}`
      });
    }
  }

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
