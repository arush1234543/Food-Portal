import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import config from "../config/config.js";
import Food from "../models/Food.model.js";

const searchSchema = z.object({
    search: z.string().nullable(),
    cuisine: z.string().nullable(),
    category: z.string().nullable(),
    vegetarian: z.boolean().nullable(),
    vegan: z.boolean().nullable(),
    spicy: z.boolean().nullable(),
    maxPrice: z.number().nullable(),
    minPrice: z.number().nullable(),
    minRating: z.number().nullable(),
    tags: z.array(z.string())
});

const model = new ChatOpenAI({
    model: "openrouter/free",
    temperature: 0,
    maxRetries: 1,
    apiKey: config.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

const searchModel = model.withStructuredOutput(searchSchema);

export async function findFood(query) {
    if (!query?.trim()) return null;

    return await searchModel.invoke([
        {
            role: "system",
            content: `
You are a food search parser.

Convert the user's request into the provided structured schema.

Rules:
- Return only structured data.
- Use null for unspecified fields.
- tags must always be an array.
- search = main dish, food, or ingredient.
- cuisine = requested cuisine.
- category = requested food category.
- vegetarian = true only for explicit vegetarian requests.
- vegetarian = false only for explicit non-vegetarian requests.
- vegan = true only for explicit vegan requests.
- vegan = false only for explicit non-vegan requests.
- spicy = true for explicit spicy requests.
- spicy = false for explicit mild or non-spicy requests.
- maxPrice = explicit maximum price.
- minPrice = explicit minimum price.
- minRating = explicit minimum rating.
- tags = characteristics or ingredients that do not already have their own schema field.
- Do not put search, cuisine, category, vegetarian, vegan, or spicy values into tags.
- Never infer properties that were not requested.
`
        },
        {
            role: "user",
            content: query.trim()
        }
    ]);
}
