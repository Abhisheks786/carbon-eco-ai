const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
});

const generateRecommendations = async (footprintBreakdown) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY provided, returning fallback recommendations.");
      return getFallbackRecommendations(footprintBreakdown);
    }

    const prompt = `
You are an expert sustainability coach. Based on the following user's carbon footprint breakdown (in kg CO2 per year), generate exactly 3 personalized, actionable recommendations for them to reduce their emissions.

Footprint Breakdown:
${JSON.stringify(footprintBreakdown, null, 2)}

Return ONLY a valid JSON array of objects with the exact following schema, and no markdown formatting or extra text:
[
  {
    "id": "string (unique identifier like 'rec-1')",
    "title": "string (Short action title)",
    "description": "string (1-2 sentences explaining why and how)",
    "estimatedSavings": number (realistic estimated kg CO2 saved per year),
    "difficulty": "string (must be 'easy', 'medium', or 'hard')",
    "category": "string (must be 'transportation', 'energy', 'food', 'shopping', or 'waste')"
  }
]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text().trim();
    // Strip markdown formatting if the model accidentally included it
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini AI generation failed, falling back to static rules:", error);
    return getFallbackRecommendations(footprintBreakdown);
  }
};

const getFallbackRecommendations = (footprint) => {
  const recommendations = [];
  if (footprint) {
    if (footprint.transportation > 2000) {
      recommendations.push({
        id: 'fallback-1',
        title: 'Reduce Car Usage',
        description: 'Your transportation is your biggest emission source. Try using public transport 2-3 days a week.',
        estimatedSavings: 500,
        difficulty: 'medium',
        category: 'transportation',
      });
    }
    if (footprint.energy > 1000) {
      recommendations.push({
        id: 'fallback-2',
        title: 'Switch to Renewable Energy',
        description: 'Consider solar panels or signing up for renewable energy plans.',
        estimatedSavings: 800,
        difficulty: 'hard',
        category: 'energy',
      });
    }
    if (footprint.food > 800) {
      recommendations.push({
        id: 'fallback-3',
        title: 'Adopt Plant-Based Diet',
        description: 'Going vegetarian one day a week can reduce your food emissions significantly.',
        estimatedSavings: 200,
        difficulty: 'easy',
        category: 'food',
      });
    }
  }
  return recommendations;
};

module.exports = { generateRecommendations };
