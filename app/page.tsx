"use client";

import { useMemo, useState } from "react";

type Recipe = {
  name: string;
  description: string;
  time: number;
  servings: number;
  matchPercent: number;
  missingIngredients: number;
  imageEmoji: string;
  ingredientsNeeded: string[];
  steps: string[];
};

const sidebarItems = [
  { label: "Dashboard", count: null, active: false, icon: "⌂" },
  { label: "Pantry", count: 4, active: false, icon: "◫" },
  { label: "Recipes", count: 8, active: true, icon: "🍳" },
  { label: "Shopping list", count: 12, active: false, icon: "🛒" },
];

export default function Home() {
  const [ingredients, setIngredients] = useState("eggs, salmon, salt, pepper");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate recipes.");
      }

      setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecipes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(q) ||
        recipe.description.toLowerCase().includes(q)
    );
  }, [recipes, search]);

  const totalItems = ingredients
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean).length;

  const dishesPossible = recipes.filter((r) => r.matchPercent >= 50).length;
  const expiringSoon = Math.max(1, Math.min(5, totalItems));
  const itemsLow = Math.max(0, 6 - totalItems);

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#111827]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-gray-200 bg-white px-4 py-6">
          <div className="mb-8 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white">
              🍽️
            </div>
            <div>
              <h1 className="text-xl font-semibold">AI Kitchen</h1>
              <p className="text-sm text-gray-500">Smart pantry</p>
            </div>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Main
          </p>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  item.active ? "bg-gray-100 font-semibold" : "text-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {item.count}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <section className="px-6 py-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">
                Recipe suggestions
              </h2>
              <p className="mt-1 text-gray-500">
                Discover what you can cook with your ingredients
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl border border-gray-200 bg-white px-5 py-3 font-medium shadow-sm">
                + Add item
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-2xl bg-[#0b1020] px-5 py-3 font-medium text-white shadow-sm disabled:opacity-60"
              >
                {loading ? "Cooking..." : "What can I cook?"}
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-1">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Pantry / fridge ingredients
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none ring-0 placeholder:text-gray-400"
                placeholder="eggs, salmon, onion, soy sauce"
              />
              <p className="mt-2 text-xs text-gray-400">
                Separate ingredients with commas
              </p>
            </div>

            <MetricCard
              title="Total items"
              value={totalItems}
              subtitle="in pantry"
            />
            <MetricCard
              title="Dishes possible"
              value={dishesPossible}
              subtitle="with what you have"
            />
            <MetricCard
              title="Items low"
              value={itemsLow}
              subtitle="below threshold"
            />
          </div>

          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-gray-400">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
                placeholder="Search recipes..."
              />
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <p className="text-gray-500">
              Showing {filteredRecipes.length} recipe
              {filteredRecipes.length === 1 ? "" : "s"}{" "}
              {recipes.length > 0 ? "(sorted by ingredient match)" : ""}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="h-52 animate-pulse bg-gray-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredRecipes.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              Click <span className="font-medium">What can I cook?</span> to
              generate recipe cards.
            </div>
          )}

          {!loading && filteredRecipes.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRecipes
                .sort((a, b) => b.matchPercent - a.matchPercent)
                .map((recipe, index) => (
                  <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} />
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-lg text-gray-500">{title}</p>
      <p className="mt-3 text-5xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-gray-500">{subtitle}</p>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100">
        <span className="text-7xl">{recipe.imageEmoji || "🍽️"}</span>
        <div className="absolute right-4 top-4 rounded-full bg-gray-700 px-3 py-1 text-sm font-semibold text-white">
          {recipe.matchPercent}% match
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-3xl font-semibold tracking-tight">{recipe.name}</h3>
        <p className="mt-3 line-clamp-2 text-lg text-gray-500">
          {recipe.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>◔</span>
            <span>{recipe.time} min</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="font-medium text-amber-600">
            Need {recipe.missingIngredients} ingredients
          </p>
          <button className="font-medium text-[#0b1020]">
            View recipe →
          </button>
        </div>
      </div>
    </article>
  );
}