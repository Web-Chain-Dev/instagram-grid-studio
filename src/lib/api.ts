import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Grid = Tables<"grids">;
export type Post = Tables<"posts">;
export type Highlight = Tables<"highlights">;
export type PostKind = "photo" | "reel" | "carousel";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("No URL");
  return data.signedUrl;
}

export async function listGrids() {
  const { data, error } = await supabase.from("grids").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function createGrid(name: string) {
  const { data, error } = await supabase.from("grids").insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGrid(id: string) {
  const { error } = await supabase.from("grids").delete().eq("id", id);
  if (error) throw error;
}

export async function getGrid(id: string) {
  const [g, p, h] = await Promise.all([
    supabase.from("grids").select("*").eq("id", id).single(),
    supabase.from("posts").select("*").eq("grid_id", id).order("position"),
    supabase.from("highlights").select("*").eq("grid_id", id).order("position"),
  ]);
  if (g.error) throw g.error;
  if (p.error) throw p.error;
  if (h.error) throw h.error;
  return { grid: g.data, posts: p.data, highlights: h.data };
}

export async function updateGrid(id: string, patch: TablesUpdate<"grids">) {
  const { error } = await supabase.from("grids").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addPost(gridId: string, file: File, kind: PostKind, position: number) {
  const url = await uploadMedia(file);
  const media_type = file.type.startsWith("video") ? "video" : "image";
  const { data, error } = await supabase
    .from("posts")
    .insert({ grid_id: gridId, media_url: url, media_type, kind, position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(id: string, patch: TablesUpdate<"posts">) {
  const { error } = await supabase.from("posts").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function savePositions(table: "posts" | "highlights", ids: string[]) {
  await Promise.all(
    ids.map((id, i) => supabase.from(table).update({ position: i }).eq("id", id)),
  );
}

export async function addHighlight(gridId: string, title: string, file: File | null, position: number) {
  const cover_url = file ? await uploadMedia(file) : null;
  const { data, error } = await supabase
    .from("highlights")
    .insert({ grid_id: gridId, title, cover_url, position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHighlight(id: string, patch: TablesUpdate<"highlights">) {
  const { error } = await supabase.from("highlights").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteHighlight(id: string) {
  const { error } = await supabase.from("highlights").delete().eq("id", id);
  if (error) throw error;
}

/** Instagram shows pinned posts first (newest pin order preserved), then the rest by position. */
export function orderPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.position - b.position;
  });
}
