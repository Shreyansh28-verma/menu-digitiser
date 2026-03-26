import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const PROMPT = `You are a professional menu digitisation AI for a food delivery platform.
Extract ALL menu items from this restaurant menu image and return a JSON array.

Each item MUST have this exact structure:
{
  "name": "Item name (required, string)",
  "category": "Starters | Mains | Desserts | Beverages | Sides | Combos",
  "isVeg": true | false | null,
  "price": "₹XXX or $X.XX as string, or null if not visible",
  "description": "Description text or null if not present",
  "flags": ["missing_veg_info", "missing_price", "missing_description"]
}

Rules:
- Extract EVERY item visible — do not skip any
- Category: infer from section headers or item type; default to "Mains" if unsure
- isVeg: true if green dot/leaf/VEG label, false if red dot/NON-VEG, null if unclear
- price: extract with currency symbol exactly as shown, null if missing
- description: extract any description text shown, null if none
- flags: add "missing_veg_info" if isVeg is null, "missing_price" if price is null, "missing_description" if description is null
- Return ONLY the raw JSON array — no markdown, no explanation, no code fences`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
      PROMPT,
    ]);

    const rawContent = result.response.text().trim();
    if (!rawContent) {
      return Response.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Strip any accidental markdown fences
    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const items = JSON.parse(cleaned);

    if (!Array.isArray(items)) {
      return Response.json({ error: 'Unexpected AI response format' }, { status: 500 });
    }

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

    const msg = err.message || '';
    if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('billing')) {
      return Response.json({
        error: 'AI service quota reached. Showing demo results instead.',
        code: 'quota_exceeded'
      }, { status: 429 });
    }

    return Response.json({ error: 'Something went wrong. Please try again or use the demo mode.' }, { status: 500 });
  }
}
