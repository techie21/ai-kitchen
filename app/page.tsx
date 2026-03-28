"use client";

import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResult("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ingredients }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  }

  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h1>🍳 AI Kitchen</h1>
      <p>Tell me what’s in your fridge.</p>

      <textarea
        rows={5}
        style={{ width: "100%", marginTop: "10px" }}
        placeholder="eggs, tofu, spinach, soy sauce"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        style={{ marginTop: "10px", padding: "10px 20px" }}
      >
        {loading ? "Cooking..." : "Suggest dishes"}
      </button>

      {result && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          {result}
        </div>
      )}
    </main>
  );
}