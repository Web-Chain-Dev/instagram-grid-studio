import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Grid3x3 } from "lucide-react";
import { createGrid, deleteGrid, listGrids } from "@/lib/api";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gridplan — Your Instagram grids" },
      { name: "description", content: "Plan your Instagram feed with a pixel-exact profile preview. Upload, pin and rearrange posts, reels and highlights." },
      { property: "og:title", content: "Gridplan — Your Instagram grids" },
      { property: "og:description", content: "Pixel-exact Instagram profile planner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const { data: grids = [], isLoading } = useQuery({ queryKey: ["grids"], queryFn: listGrids });
  const create = useMutation({
    mutationFn: () => createGrid(name.trim() || "New grid"),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: ["grids"] });
      nav({ to: "/grid/$id", params: { id: g.id } });
    },
  });
  const remove = useMutation({
    mutationFn: deleteGrid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grids"] }),
  });

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12">
      <div className="mb-10 flex items-center gap-3">
        <div className="ig-story-ring flex h-11 w-11 items-center justify-center rounded-xl">
          <Grid3x3 className="h-6 w-6 text-background" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gridplan</h1>
          <p className="text-sm text-muted-foreground">Your Instagram grids, exactly as they'll look.</p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
        className="mb-8 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New grid name (e.g. Summer feed)"
          className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-ig-blue px-4 text-sm font-semibold text-primary-foreground hover:opacity-90" disabled={create.isPending}>
          <Plus className="h-4 w-4" /> Create
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : grids.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-sm text-muted-foreground">
          No grids yet. Create your first one above.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {grids.map((g) => (
            <li key={g.id} className="group relative rounded-2xl border bg-background p-4 transition hover:shadow-md">
              <Link to="/grid/$id" params={{ id: g.id }} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-ig-tile">
                  {g.avatar_url && <img src={g.avatar_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{g.name}</div>
                  <div className="truncate text-sm text-muted-foreground">@{g.username}</div>
                </div>
              </Link>
              <button
                aria-label="Delete grid"
                onClick={() => confirm(`Delete "${g.name}"?`) && remove.mutate(g.id)}
                className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground opacity-60 hover:bg-muted hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
