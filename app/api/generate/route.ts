import { NextRequest, NextResponse } from "next/server";
import { openai } from "../../../lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { ingredients } = await req.json();

    if (!ingredients || typeof ingredients !== "string") {
      return NextResponse.json(
        { error: "Ingredients are required." },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI cooking masterchef.

The user has these ingredients:
${ingredients}

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation before or after the JSON.

Return this exact shape:
{
  "recipes": [
    {
      "name": "string",
      "description": "string",
      "time": number,
      "servings": number,
      "matchPercent": number,
      "missingIngredients": number,
      "imageEmoji": "string",
      "ingredientsNeeded": ["string"],
      "steps": ["string"]
    }
  ]
}

Requirements:
- Return exactly 6 recipes
- Make recipes realistic for a normal home cook
- matchPercent should be between 0 and 100
- missingIngredients should be a non-negative integer
- imageEmoji should be one food-related emoji
- Keep description short
- Keep steps concise
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate recipes." },
      { status: 500 }
    );
  }
}