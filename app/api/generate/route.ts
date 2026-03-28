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
You are a helpful home cooking assistant.

The user has these ingredients:
${ingredients}

Suggest 3 simple dishes they can cook at home.

For each dish, provide:
1. Dish name
2. Short description
3. Simple step-by-step instructions

Keep it practical and realistic.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return NextResponse.json({
      result: response.output_text,
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate recipes." },
      { status: 500 }
    );
  }
}