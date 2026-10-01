import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import config from "../config/config.js";

const moderationSchema = z.object({
    appropriate: z.boolean(),
    reason: z.string()
});

const model = new ChatOpenAI({
    model: "openrouter/free",
    temperature: 0,
    apiKey: config.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1"
    }
});

const moderationModel = model.withStructuredOutput(
    moderationSchema
);

export async function isAppropriate(text) {
    if (!text?.trim()) {
        return {
            appropriate: true,
            reason: "Empty text"
        };
    }

    return await moderationModel.invoke([
        {
            role: "system",
            content: `
You are a text moderation system.

Determine whether the user's text is appropriate for a food-delivery application.

Mark text as inappropriate if it contains:
- Hate or harassment
- Threats
- Explicit sexual content
- Instructions for dangerous or illegal activity
- Severe abusive content

Normal food-delivery instructions, casual language, and mild slang are appropriate.

Return:
- appropriate: true or false
- reason: a short explanation
`
        },
        {
            role: "user",
            content: text.trim()
        }
    ]);
}