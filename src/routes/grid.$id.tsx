import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, rectSortingStrategy, horizontalListSortingStrategy, useSortable, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronLeft, Plus, Menu, Home, Search, Send, Link2, UserPlus, Camera, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  addHighlight, addPost, deleteHighlight, deletePost, getGrid, orderPosts, savePositions, updateGrid, updateHighlight, updatePost, uploadMedia,
  type Grid, type Highlight, type Post, type PostKind,
} from "@/lib/api";
import { GridIcon, ReelsIcon, TaggedIcon, PinIcon, CarouselIcon, ReelBadgeIcon, PlayIcon, VerifiedIcon, ThreadsIcon } from "@/components/ig/icons";
import { ActionSheet, SheetButton } from "@/components/ig/Sheet";

export const Route = createFileRoute("/grid/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Profile preview — Gridplan" },
      { name: "description", content: "Edit and rearrange your Instagram grid in a pixel-exact profile preview." },
      { property: "og:title", content: "Profile preview — Gridplan" },
      { property: "og:description", content: "Pixel-exact Instagram profile planner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GridPage,
});

type Tab = "grid" | "reels" | "tagged";

function GridPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["grid", id], queryFn: () => getGrid(id) });
  const [posts, setPosts] = useState<Post[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [tab, setTab] = useState<Tab>("grid");
  const [uploadMenu, setUploadMenu] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeHl, setActiveHl] = useState<Highlight | null>(null);
  const [newHl, setNewHl] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [busy, setBusy] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<PostKind>("photo");

  useEffect(() => {
    if (data) { setPosts(orderPosts(data.posts)); setHighlights(data.highlights); setGrid(data.grid); }
  }, [data]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["grid", id] });
  const run = async (fn: () => Promise<unknown>) => {
    setBusy((b) => b + 1);
    try { await fn(); await refresh(); } catch (e) { toast.error((e as Error).message); } finally { setBusy((b) => b - 1); }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (isLoading || !grid) {
    return <Shell><div className="flex h-[60vh] items-center justify-center text-ig-muted">{error ? "Grid not found" : <Loader2 className="h-6 w-6 animate-spin" />}</div></Shell>;
  }

  const onPostsDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = posts.findIndex((p) => p.id === active.id);
    const to = posts.findIndex((p) => p.id === over.id);
    const moved = posts[from];
    const target = posts[to];
    let next = arrayMove(posts, from, to);
    // Crossing the pinned boundary pins / unpins the post, like dragging it in or out of the pinned row.
    if (moved.pinned !== target.pinned) {
      next = next.map((p) => (p.id === moved.id ? { ...p, pinned: target.pinned } : p));
      if (target.pinned && next.filter((p) => p.pinned).length > 3) {
        toast.error("Instagram allows up to 3 pinned posts");
        return;
      }
      updatePost(moved.id, { pinned: target.pinned });
    }
    setPosts(next);
    savePositions("posts", next.map((p) => p.id)).catch((err) => toast.error(err.message));
  };

  const onHlDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(highlights, highlights.findIndex((h) => h.id === active.id), highlights.findIndex((h) => h.id === over.id));
    setHighlights(next);
    savePositions("highlights", next.map((h) => h.id)).catch((err) => toast.error(err.message));
  };

  const pickFiles = (kind: PostKind) => {
    pendingKind.current = kind;
    setUploadMenu(false);
    fileRef.current?.click();
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const kind = pendingKind.current;
    run(async () => {
      // New uploads go to the top of the unpinned section, like a fresh Instagram post.
      const minPos = Math.min(0, ...posts.filter((p) => !p.pinned).map((p) => p.position));
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        const k: PostKind = kind === "photo" && f.type.startsWith("video") ? "reel" : kind;
        await addPost(id, f, k, minPos - (list.length - i));
      }
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const reels = posts.filter((p) => p.kind === "reel");

  return (
    <Shell>
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-11 items-center justify-between bg-background px-3">
        <div className="flex items-center gap-1">
          <Link to="/" aria-label="All grids" className="p-1.5"><ChevronLeft className="h-6 w-6" strokeWidth={2} /></Link>
          <button aria-label="Create" onClick={() => setUploadMenu(true)} className="p-1.5"><Plus className="h-[26px] w-[26px]" strokeWidth={2} /></button>
        </div>
        <button onClick={() => setEditProfile(true)} className="flex items-center gap-1 text-[20px] font-bold tracking-tight">
          {grid.username}
          {grid.verified && <VerifiedIcon className="h-[18px] w-[18px]" />}
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-1">
          <span className="p-1.5"><ThreadsIcon className="h-6 w-6" /></span>
          <span className="p-1.5"><Menu className="h-[26px] w-[26px]" strokeWidth={2} /></span>
        </div>
      </header>

      {/* Header */}
      <section className="px-4 pt-2">
        <div className="flex items-center gap-6">
          <AvatarUpload grid={grid} onChange={(url) => run(() => updateGrid(id, { avatar_url: url }))} />
          <div className="flex-1">
            <div className="mb-1 text-[14px] font-semibold leading-tight">{grid.display_name}</div>
            <div className="flex justify-between pr-2 text-ig-text">
              <Stat n={String(posts.length)} label="posts" />
              <Stat n={grid.followers} label="followers" />
              <Stat n={grid.following} label="following" />
            </div>
          </div>
        </div>

        <div className="mt-3 text-[14px] leading-[18px]">
          {grid.category && <div className="text-ig-muted">{grid.category}</div>}
          {grid.bio && <div className="whitespace-pre-wrap">{grid.bio}</div>}
          {grid.website && (
            <a href={grid.website.startsWith("http") ? grid.website : `https://${grid.website}`} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 font-semibold text-ig-link">
              <Link2 className="h-3.5 w-3.5 -rotate-45" strokeWidth={2.5} />
              {grid.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-3 flex gap-1.5">
          <button onClick={() => setEditProfile(true)} className="ig-btn flex-1">Edit profile</button>
          <button onClick={() => { navigator.clipboard?.writeText(location.href); toast("Link copied"); }} className="ig-btn flex-1">Share profile</button>
          <button className="ig-btn w-8" aria-label="Discover people"><UserPlus className="h-4 w-4" strokeWidth={2.2} /></button>
        </div>
      </section>

      {/* Highlights */}
      <section className="no-scrollbar mt-4 flex gap-4 overflow-x-auto px-4 pb-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onHlDragEnd}>
          <SortableContext items={highlights.map((h) => h.id)} strategy={horizontalListSortingStrategy}>
            {highlights.map((h) => <HighlightItem key={h.id} h={h} onClick={() => setActiveHl(h)} />)}
          </SortableContext>
        </DndContext>
        <button onClick={() => setNewHl(true)} className="flex w-16 shrink-0 flex-col items-center gap-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ig-ring">
            <Plus className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <span className="text-[12px]">New</span>
        </button>
      </section>

      {/* Tabs */}
      <nav className="sticky top-11 z-20 mt-3 flex bg-background">
        {([["grid", GridIcon], ["reels", ReelsIcon], ["tagged", TaggedIcon]] as const).map(([t, Icon]) => (
          <button key={t} onClick={() => setTab(t)} aria-label={t}
            className={`flex h-11 flex-1 items-center justify-center border-b ${tab === t ? "border-ig-text text-ig-text" : "border-ig-border text-ig-muted"}`}>
            <Icon className="h-6 w-6" />
          </button>
        ))}
      </nav>

      {/* Content */}
      {tab === "grid" && (
        posts.length === 0 ? (
          <Empty title="Share photos" sub="When you share photos, they will appear on your profile." action="Share your first photo" onAction={() => pickFiles("photo")} />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onPostsDragEnd}>
            <SortableContext items={posts.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-[2px]">
                {posts.map((p) => <PostTile key={p.id} post={p} onClick={() => setActivePost(p)} />)}
              </div>
            </SortableContext>
          </DndContext>
        )
      )}
      {tab === "reels" && (
        reels.length === 0 ? (
          <Empty title="Share a reel" sub="Reels you share will appear here." action="Upload a reel" onAction={() => pickFiles("reel")} />
        ) : (
          <div className="grid grid-cols-3 gap-[2px]">
            {reels.map((p) => (
              <button key={p.id} onClick={() => setActivePost(p)} className="relative aspect-[9/16] overflow-hidden bg-ig-tile">
                <Media post={p} />
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[13px] font-semibold text-background drop-shadow">
                  <PlayIcon className="h-4 w-4" /> 0
                </span>
              </button>
            ))}
          </div>
        )
      )}
      {tab === "tagged" && <Empty title="Photos and videos of you" sub="When people tag you in photos and videos, they'll appear here." />}

      <div className="h-24" />

      {/* Bottom nav */}
      <footer className="fixed bottom-0 left-1/2 z-30 flex h-[50px] w-full max-w-[470px] -translate-x-1/2 items-center justify-around border-t border-ig-border bg-background pb-[env(safe-area-inset-bottom)]">
        <Home className="h-[26px] w-[26px]" strokeWidth={2} />
        <ReelsIcon className="h-[26px] w-[26px]" />
        <Send className="h-[25px] w-[25px]" strokeWidth={2} />
        <Search className="h-[26px] w-[26px]" strokeWidth={2} />
        <div className="h-7 w-7 overflow-hidden rounded-full border-2 border-ig-text bg-ig-tile">
          {grid.avatar_url && <img src={grid.avatar_url} alt="" className="h-full w-full object-cover" />}
        </div>
      </footer>

      {busy > 0 && (
        <div className="fixed left-1/2 top-14 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ig-text px-4 py-2 text-sm text-background shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </div>
      )}

      {/* Upload menu */}
      <ActionSheet open={uploadMenu} onClose={() => setUploadMenu(false)} title="Create">
        <SheetButton onClick={() => pickFiles("photo")}><GridIcon className="h-6 w-6" /> Post</SheetButton>
        <SheetButton onClick={() => pickFiles("carousel")}><CarouselIcon className="h-6 w-6" /> Carousel post</SheetButton>
        <SheetButton onClick={() => pickFiles("reel")}><ReelsIcon className="h-6 w-6" /> Reel</SheetButton>
        <SheetButton onClick={() => { setUploadMenu(false); setNewHl(true); }}><Plus className="h-6 w-6" /> Story highlight</SheetButton>
      </ActionSheet>

      {/* Post actions */}
      <ActionSheet open={!!activePost} onClose={() => setActivePost(null)}>
        {activePost && (
          <>
            <div className="mx-auto my-3 aspect-[3/4] w-32 overflow-hidden rounded-md bg-ig-tile"><Media post={activePost} /></div>
            <SheetButton onClick={() => {
              const p = activePost; setActivePost(null);
              if (!p.pinned && posts.filter((x) => x.pinned).length >= 3) return toast.error("Instagram allows up to 3 pinned posts");
              run(() => updatePost(p.id, { pinned: !p.pinned }));
            }}>
              <PinIcon className="h-5 w-5" /> {activePost.pinned ? "Unpin from profile" : "Pin to your profile"}
            </SheetButton>
            {(["photo", "carousel", "reel"] as PostKind[]).filter((k) => k !== activePost.kind).map((k) => (
              <SheetButton key={k} onClick={() => { const p = activePost; setActivePost(null); run(() => updatePost(p.id, { kind: k })); }}>
                {k === "reel" ? <ReelBadgeIcon className="h-5 w-5" /> : k === "carousel" ? <CarouselIcon className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                Mark as {k === "photo" ? "single photo" : k}
              </SheetButton>
            ))}
            <SheetButton danger onClick={() => { const p = activePost; setActivePost(null); run(() => deletePost(p.id)); }}>
              <Trash2 className="h-5 w-5" /> Delete
            </SheetButton>
            <SheetButton onClick={() => setActivePost(null)}>Cancel</SheetButton>
          </>
        )}
      </ActionSheet>

      <HighlightEditor
        open={newHl || !!activeHl}
        hl={activeHl}
        onClose={() => { setNewHl(false); setActiveHl(null); }}
        onSave={(title, file) => {
          const h = activeHl;
          setNewHl(false); setActiveHl(null);
          run(async () => {
            if (h) {
              const cover_url = file ? await uploadMedia(file) : h.cover_url;
              await updateHighlight(h.id, { title, cover_url });
            } else {
              await addHighlight(id, title, file, highlights.length);
            }
          });
        }}
        onDelete={() => { const h = activeHl!; setActiveHl(null); run(() => deleteHighlight(h.id)); }}
      />

      <ProfileEditor open={editProfile} grid={grid} onClose={() => setEditProfile(false)}
        onSave={(patch) => { setEditProfile(false); setGrid({ ...grid, ...patch }); run(() => updateGrid(id, patch)); }} />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen sm:py-6">
      <div className="relative mx-auto min-h-screen w-full max-w-[470px] bg-background text-ig-text sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[28px] sm:shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="text-[16px] font-semibold">{n}</span>
      <span className="text-[14px]">{label}</span>
    </div>
  );
}

function AvatarUpload({ grid, onChange }: { grid: Grid; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={() => ref.current?.click()} className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-full bg-ig-tile" aria-label="Change profile photo">
      {grid.avatar_url ? <img src={grid.avatar_url} alt="" className="h-full w-full object-cover" /> : <Camera className="m-auto h-8 w-8 text-ig-muted" />}
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-ig-overlay"><Loader2 className="h-6 w-6 animate-spin text-background" /></div>}
      <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setLoading(true);
        try { onChange(await uploadMedia(f)); } catch (err) { toast.error((err as Error).message); } finally { setLoading(false); }
      }} />
    </button>
  );
}

function Media({ post }: { post: Post }) {
  return post.media_type === "video"
    ? <video src={`${post.media_url}#t=0.1`} muted playsInline preload="metadata" className="pointer-events-none h-full w-full object-cover" />
    : <img src={post.media_url} alt="" draggable={false} className="pointer-events-none h-full w-full select-none object-cover" />;
}

function PostTile({ post, onClick }: { post: Post; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, touchAction: "manipulation" }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative aspect-[3/4] cursor-grab overflow-hidden bg-ig-tile active:cursor-grabbing ${isDragging ? "scale-105 opacity-90 shadow-2xl" : ""}`}
    >
      <Media post={post} />
      <div className="pointer-events-none absolute right-1.5 top-1.5 flex gap-1 text-background drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]">
        {post.pinned && <PinIcon className="h-[18px] w-[18px]" />}
        {!post.pinned && post.kind === "reel" && <ReelBadgeIcon className="h-[18px] w-[18px]" />}
        {!post.pinned && post.kind === "carousel" && <CarouselIcon className="h-[20px] w-[20px]" />}
      </div>
    </div>
  );
}

function HighlightItem({ h, onClick }: { h: Highlight; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: h.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      {...attributes} {...listeners}
      onClick={onClick}
      className="flex w-16 shrink-0 cursor-grab flex-col items-center gap-1"
    >
      <div className="h-16 w-16 rounded-full border border-ig-ring p-[3px]">
        <div className="h-full w-full overflow-hidden rounded-full bg-ig-tile">
          {h.cover_url && <img src={h.cover_url} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" />}
        </div>
      </div>
      <span className="w-full truncate text-center text-[12px]">{h.title}</span>
    </div>
  );
}

function Empty({ title, sub, action, onAction }: { title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="mb-4 flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-ig-text"><Camera className="h-8 w-8" strokeWidth={1.5} /></div>
      <h2 className="text-[24px] font-extrabold">{title}</h2>
      <p className="mt-2 text-[14px] text-ig-muted">{sub}</p>
      {action && <button onClick={onAction} className="mt-4 text-[14px] font-semibold text-ig-blue">{action}</button>}
    </div>
  );
}

const field = "w-full rounded-lg border border-ig-border bg-background px-3 py-2 text-[14px] outline-none focus:border-ig-muted";

function HighlightEditor({ open, hl, onClose, onSave, onDelete }: {
  open: boolean; hl: Highlight | null; onClose: () => void; onSave: (title: string, file: File | null) => void; onDelete: () => void;
}) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => { if (open) { setTitle(hl?.title ?? "Highlights"); setFile(null); setPreview(hl?.cover_url ?? null); } }, [open, hl]);
  return (
    <ActionSheet open={open} onClose={onClose} title={hl ? "Edit highlight" : "New highlight"}>
      <div className="flex flex-col items-center gap-4 p-5">
        <label className="cursor-pointer">
          <div className="h-24 w-24 rounded-full border border-ig-ring p-1">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-ig-tile">
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Camera className="h-7 w-7 text-ig-muted" />}
            </div>
          </div>
          <div className="mt-2 text-center text-[14px] font-semibold text-ig-blue">{preview ? "Change cover" : "Add cover"}</div>
          <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={16} placeholder="Highlight name" className={field} />
        <button onClick={() => onSave(title.trim() || "Highlights", file)} className="h-9 w-full rounded-lg bg-ig-blue text-[14px] font-semibold text-primary-foreground">
          {hl ? "Save" : "Add"}
        </button>
        {hl && <button onClick={onDelete} className="text-[14px] font-semibold text-destructive">Delete highlight</button>}
      </div>
    </ActionSheet>
  );
}

function ProfileEditor({ open, grid, onClose, onSave }: { open: boolean; grid: Grid; onClose: () => void; onSave: (p: Partial<Grid>) => void }) {
  const [f, setF] = useState(grid);
  useEffect(() => { if (open) setF(grid); }, [open, grid]);
  const set = (k: keyof Grid) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const row = (label: string, k: keyof Grid, multiline = false) => (
    <label className="block">
      <span className="mb-1 block text-[12px] text-ig-muted">{label}</span>
      {multiline
        ? <textarea rows={4} value={String(f[k] ?? "")} onChange={set(k)} className={field} maxLength={150} />
        : <input value={String(f[k] ?? "")} onChange={set(k)} className={field} />}
    </label>
  );
  return (
    <ActionSheet open={open} onClose={onClose} title="Edit profile">
      <div className="space-y-3 p-5">
        {row("Grid name (only you see this)", "name")}
        {row("Username", "username")}
        {row("Name", "display_name")}
        {row("Category", "category")}
        {row("Bio", "bio", true)}
        {row("Link", "website")}
        <div className="grid grid-cols-2 gap-3">
          {row("Followers", "followers")}
          {row("Following", "following")}
        </div>
        <label className="flex items-center justify-between text-[14px]">
          Verified badge
          <input type="checkbox" checked={f.verified} onChange={(e) => setF({ ...f, verified: e.target.checked })} className="h-5 w-5 accent-[var(--ig-blue)]" />
        </label>
        <button
          onClick={() => onSave({ name: f.name, username: f.username, display_name: f.display_name, category: f.category, bio: f.bio, website: f.website, followers: f.followers, following: f.following, verified: f.verified })}
          className="h-9 w-full rounded-lg bg-ig-blue text-[14px] font-semibold text-primary-foreground"
        >Done</button>
      </div>
    </ActionSheet>
  );
}
