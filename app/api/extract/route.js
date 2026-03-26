import { GoogleGenerativeAI } from '@google/generative-ai';

const PROMPT = `You are a professional menu digitisation AI for a food delivery platform.
Extract ALL menu items from this restaurant menu image and return a JSON array.

Each item MUST have this exact structure:
{
  "name": "Item name (required, string)",
  "category": "Starters | Mains | Desserts | Beverages | Sides | Combos | Other",
  "isVeg": true | false | null,
  "price": "₹XXX or $X.XX as string, or null if not visible",
  "description": "Description text or null if not present",
  "missingFields": ["isVeg", "price", "description"],
  "confidence": 0.95
}

Rules:
- Extract EVERY item visible. Do not make up items.
- If the image is just a single food item and NOT a menu, extract just that one item.
- If the image is not food or a menu at all, return an empty array [].
- Category: infer from section headers or item type; default to "Other" if completely unsure.
- isVeg: true if green dot/leaf/VEG label, false if red dot/NON-VEG, null if unclear.
- price: extract with currency symbol exactly as shown, null if missing.
- confidence: float between 0.0 and 1.0 representing your confidence in this extraction.
- missingFields: list which of these fields (isVeg, price, description) are null or missing.
- Return ONLY the raw JSON array — no markdown, no explanation, no code fences.`;

export async function POST(request) {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('API Key is not set');
    return Response.json({ error: 'API key not configured.', code: 'quota_exceeded' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType } },
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

    let items = [];
    try {
      items = JSON.parse(cleaned);
    } catch (e) {
      // Sometimes Gemini adds extra text. Try to extract just the array.
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        items = JSON.parse(match[0]);
      } else {
        throw e;
      }
    }

    if (!Array.isArray(items)) {
      return Response.json({ error: 'Unexpected AI response format' }, { status: 500 });
    }

    // Post-processing & normalization
    const normalized = items.map((item, idx) => {
      let cat = item.category || 'Other';
      const name = (item.name || '').toLowerCase();

      // Smart Touch Categorization
      if (cat === 'Other' || cat === 'Mains') {
        if (name.includes('paneer') || name.includes('chicken') || name.includes('mutton') || name.includes('dal')) {
          cat = 'Mains';
        } else if (name.includes('soup') || name.includes('tikka') || name.includes('kebab') || name.includes('roll')) {
          cat = 'Starters';
        } else if (name.includes('ice cream') || name.includes('jamun') || name.includes('brownie')) {
          cat = 'Desserts';
        } else if (name.includes('naan') || name.includes('roti') || name.includes('rice')) {
          cat = 'Sides';
        }
      }

      const missingFields = Array.isArray(item.missingFields) ? item.missingFields : [];
      // map old flags to missingFields if model used old naming
      if (Array.isArray(item.flags)) {
        if (item.flags.includes('missing_veg_info')) missingFields.push('isVeg');
        if (item.flags.includes('missing_price')) missingFields.push('price');
        if (item.flags.includes('missing_description')) missingFields.push('description');
      }

      return {
        id: `item-${idx}`,
        name: item.name || 'Unknown Item',
        category: cat,
        isVeg: item.isVeg !== undefined ? item.isVeg : null,
        price: item.price || null,
        description: item.description || null,
        missingFields: [...new Set(missingFields)], // deduplicate
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.85, 
        flags: [] // keeping for backwards compatibility with UI if needed
      };
    });

    return Response.json({ items: normalized, count: normalized.length });

  } catch (err) {
    const msg = err.message || '';
    console.error('Extract API error:', msg);

    if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('billing')) {
      return Response.json({ error: 'AI quota reached.', code: 'quota_exceeded' }, { status: 429 });
    }
    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Failed to parse AI response. The model output was not valid JSON.' }, { status: 422 });
    }
    return Response.json({ error: msg || 'Extraction failed.' }, { status: 500 });
  }
}
