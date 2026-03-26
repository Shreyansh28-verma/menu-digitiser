import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a professional menu digitisation AI assistant for a food delivery platform.
Your job is to extract menu items from restaurant menu images and return structured JSON.

RULES:
1. Extract EVERY menu item visible in the image
2. Assign each item a category from: Starters, Mains, Desserts, Beverages, Sides, Combos
   - Use context clues (section headers, item names, descriptions) to determine category
   - If no category header exists, infer from the item type
   - Default to "Mains" when unsure
3. For isVeg field: true if vegetarian (green dot/leaf/VEG label), false if non-vegetarian (red dot/NON-VEG label), null if not mentioned
4. For price: extract as string including currency symbol (e.g. "₹180", "$12.99"), null if not visible
5. For description: extract any description text, null if not present
6. Generate flags for any missing critical fields: "missing_veg_info", "missing_price", "missing_description"
7. Do NOT make up prices or descriptions — only extract what is visible
8. Return ONLY valid JSON, no explanations or markdown code blocks`;

const USER_PROMPT = `Please extract all menu items from this restaurant menu image and return a JSON array.

Each item in the array must have this exact structure:
{
  "name": "Item name (required)",
  "category": "Starters|Mains|Desserts|Beverages|Sides|Combos",
  "isVeg": true|false|null,
  "price": "₹XXX or null",
  "description": "Description text or null",
  "flags": ["missing_veg_info", "missing_price", "missing_description"] 
}

The "flags" array should contain only the applicable flag strings for missing data.
Return ONLY the JSON array, no other text.`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high',
              },
            },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return Response.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse JSON — strip any accidental markdown fences
    let cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const items = JSON.parse(cleaned);

    if (!Array.isArray(items)) {
      return Response.json({ error: 'Unexpected AI response format' }, { status: 500 });
    }

    // Normalize and validate each item
    const normalized = items.map((item, idx) => ({
      id: `item-${idx}`,
      name: item.name || 'Unknown Item',
      category: item.category || 'Mains',
      isVeg: item.isVeg !== undefined ? item.isVeg : null,
      price: item.price || null,
      description: item.description || null,
      flags: Array.isArray(item.flags) ? item.flags : [],
    }));

    return Response.json({ items: normalized, count: normalized.length });
  } catch (err) {
    console.error('Extract API error:', err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Failed to parse AI response. Try a clearer image.' }, { status: 422 });
    }
    // Handle OpenAI quota / billing errors cleanly
    const msg = err.message || '';
    if (err.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('billing')) {
      return Response.json({ error: 'AI service quota reached. Please try the demo mode to see a sample extraction.', code: 'quota_exceeded' }, { status: 429 });
    }
    return Response.json({ error: 'Something went wrong. Please try again or use the demo mode.' }, { status: 500 });
  }
}
