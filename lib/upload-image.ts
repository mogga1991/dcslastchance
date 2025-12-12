import { supabaseAdmin } from "./supabase";

export const uploadImageAssets = async (buffer: Buffer, key: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from("uploads")
    .upload(key, buffer, {
      contentType: "image/*",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabaseAdmin.storage
    .from("uploads")
    .getPublicUrl(key);

  return publicUrlData.publicUrl;
};
