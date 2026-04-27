import client from "./supabaseClient.js";

const tableName = process.env.GENERATED_POSTS_TABLE || "generated_posts";

export async function saveGeneration(payload) {
  const record = {
    theme: payload.theme,
    post_type: payload.postType,
    slide_count: payload.slideCount,
    slides: payload.slides,
    raw_output: payload.rawOutput,
    handle: payload.handle,
    custom_cta: payload.customCta || null,
    selected_color: payload.selectedColor,
    selected_illustration: payload.selectedIllus,
    illustration_position: payload.illusPos,
    font_size: payload.fontSize,
    download_base_name: payload.downloadBaseName || null,
  };

  const { data, error } = await client
    .from(tableName)
    .insert(record)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save generation to "${tableName}". ${error.message}`
    );
  }

  return data;
}

export default saveGeneration;
