/**
 * Multi-layered Meal Intelligence System
 * Layer 1: Local string similarity (FREE)
 * Layer 2: Local calorie rules engine (FREE)
 * Layer 3: Nutritionix API (1000 free/day)
 * Layer 4: Claude Haiku (minimal cost for edge cases)
 */

// ============ LAYER 1: LOCAL DUPLICATE DETECTION ============

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity percentage between two strings
 */
function stringSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity);
}

/**
 * Normalize meal name for comparison (handles common variations)
 */
function normalizeMealName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
    .trim();
}

/**
 * Check if meal is a duplicate using local string matching
 * Returns: { isDuplicate: boolean, matchedMeal: string|null, confidence: number }
 */
export function checkDuplicateLocal(mealName, existingMeals) {
  const normalized = normalizeMealName(mealName);

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const meal of existingMeals) {
    const existingNormalized = normalizeMealName(meal.name);
    const similarity = stringSimilarity(normalized, existingNormalized);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = meal;
    }
  }

  // Threshold: 90%+ = definite duplicate, 75-89% = potential duplicate
  const isDuplicate = highestSimilarity >= 90;
  const isPotentialDuplicate = highestSimilarity >= 75;

  return {
    isDuplicate,
    isPotentialDuplicate,
    matchedMeal: isDuplicate || isPotentialDuplicate ? bestMatch : null,
    confidence: highestSimilarity,
    method: 'local'
  };
}

// ============ LAYER 2: LOCAL CALORIE ESTIMATION ============

/**
 * Rule-based calorie estimation based on meal characteristics
 */
const calorieRules = {
  // Base calories by meal type
  mealTypeBase: {
    'Breakfast': 350,
    'Lunch': 500,
    'Dinner': 450
  },

  // Cuisine modifiers
  cuisineModifier: {
    'Indian - Gujarati': 1.1,
    'Indian - Punjabi': 1.2,
    'Indian - South Indian': 0.95,
    'Chinese': 1.15,
    'Italian': 1.2,
    'Continental': 1.0,
    'Asian - Other': 1.05
  },

  // Taste modifiers
  tasteModifier: {
    'mild': 0.9,
    'spicy': 1.0,
    'sweet': 1.15
  },

  // Keyword modifiers (additive)
  keywords: {
    // High calorie indicators
    'fried': 150,
    'deep fried': 200,
    'butter': 100,
    'cheese': 120,
    'paneer': 100,
    'cream': 100,
    'masala': 80,
    'tikka': 80,
    'paratha': 120,
    'pizza': 150,
    'pasta': 100,
    'noodles': 80,
    'biryani': 150,
    'pulao': 100,

    // Low calorie indicators
    'steamed': -50,
    'grilled': -30,
    'salad': -80,
    'soup': -100,
    'boiled': -50,
    'roasted': -20,

    // Portion size indicators
    'bowl': 50,
    'large': 80,
    'small': -50,
    'mini': -80
  }
};

/**
 * Estimate calories using local rules engine
 */
export function estimateCaloriesLocal(mealName, mealType, cuisine, taste) {
  // Start with base calories
  let calories = calorieRules.mealTypeBase[mealType] || 400;

  // Apply cuisine modifier
  const cuisineMod = calorieRules.cuisineModifier[cuisine] || 1.0;
  calories *= cuisineMod;

  // Apply taste modifier
  const tasteMod = calorieRules.tasteModifier[taste] || 1.0;
  calories *= tasteMod;

  // Check for keywords
  const lowerName = mealName.toLowerCase();
  let keywordAdjustment = 0;

  for (const [keyword, adjustment] of Object.entries(calorieRules.keywords)) {
    if (lowerName.includes(keyword)) {
      keywordAdjustment += adjustment;
    }
  }

  calories += keywordAdjustment;

  // Add some randomness to avoid exact duplicates
  const variance = Math.random() * 40 - 20; // ±20 calories
  calories += variance;

  // Round to nearest 5
  calories = Math.round(calories / 5) * 5;

  // Ensure reasonable bounds
  calories = Math.max(150, Math.min(800, calories));

  return {
    calories,
    confidence: 60, // Local estimation has moderate confidence
    method: 'local_rules'
  };
}

// ============ LAYER 3: NUTRITIONIX API ============

/**
 * Query Nutritionix API for calorie data
 * Free tier: 1000 requests/day
 */
export async function getCaloriesNutritionix(mealName) {
  const apiKey = process.env.REACT_APP_NUTRITIONIX_API_KEY;
  const appId = process.env.REACT_APP_NUTRITIONIX_APP_ID;

  if (!apiKey || !appId) {
    throw new Error('Nutritionix API credentials not configured');
  }

  try {
    const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': appId,
        'x-app-key': apiKey
      },
      body: JSON.stringify({
        query: mealName
      })
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      return {
        calories: Math.round(food.nf_calories),
        confidence: 85,
        method: 'nutritionix',
        details: {
          protein: food.nf_protein,
          carbs: food.nf_total_carbohydrate,
          fat: food.nf_total_fat
        }
      };
    }

    throw new Error('No nutritional data found');
  } catch (error) {
    console.error('Nutritionix API error:', error);
    return null;
  }
}

// ============ LAYER 4: CLAUDE HAIKU (EDGE CASES) ============

/**
 * Use Claude Haiku for complex analysis (only when other methods fail)
 */
export async function analyzeWithClaude(mealName, cuisine, taste, existingMeals) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const existingMealNames = existingMeals.slice(0, 20).map(m => m.name).join(', ');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4.0',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Analyze this meal for duplicates and estimate calories.

Meal: "${mealName}"
Cuisine: ${cuisine}
Taste: ${taste}

Existing meals: ${existingMealNames}

Return ONLY valid JSON:
{
  "calories": <number>,
  "isDuplicate": <boolean>,
  "duplicateOf": "<meal name or null>",
  "confidence": <0-100>,
  "reasoning": "<brief explanation>"
}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      calories: result.calories,
      isDuplicate: result.isDuplicate,
      matchedMeal: result.duplicateOf,
      confidence: result.confidence,
      method: 'claude_haiku',
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

// ============ ORCHESTRATOR: MULTI-LAYERED INTELLIGENCE ============

/**
 * Main intelligence function that uses all layers
 * Cost optimization: Only escalates to paid APIs when needed
 */
export async function analyzeMealIntelligent(mealName, mealType, cuisine, taste, existingMeals, options = {}) {
  const {
    skipNutritionix = false,
    skipClaude = false,
    forceLocal = false
  } = options;

  const result = {
    mealName,
    calories: null,
    isDuplicate: false,
    matchedMeal: null,
    confidence: 0,
    method: null,
    costIncurred: 0,
    layers: []
  };

  // LAYER 1: Local duplicate detection (always run - FREE)
  const duplicateCheck = checkDuplicateLocal(mealName, existingMeals);
  result.layers.push({ layer: 1, method: 'local_duplicate', result: duplicateCheck });

  if (duplicateCheck.isDuplicate) {
    result.isDuplicate = true;
    result.matchedMeal = duplicateCheck.matchedMeal.name;
    result.calories = duplicateCheck.matchedMeal.calories;
    result.confidence = duplicateCheck.confidence;
    result.method = 'local_duplicate_match';
    return result;
  }

  // LAYER 2: Local calorie estimation (always run - FREE)
  const localCalories = estimateCaloriesLocal(mealName, mealType, cuisine, taste);
  result.layers.push({ layer: 2, method: 'local_rules', result: localCalories });
  result.calories = localCalories.calories;
  result.confidence = localCalories.confidence;
  result.method = 'local_rules';

  // If forcing local only, stop here
  if (forceLocal) {
    return result;
  }

  // LAYER 3: Nutritionix API for better accuracy (1000 free/day)
  if (!skipNutritionix) {
    try {
      const nutritionixData = await getCaloriesNutritionix(mealName);
      if (nutritionixData) {
        result.layers.push({ layer: 3, method: 'nutritionix', result: nutritionixData });
        result.calories = nutritionixData.calories;
        result.confidence = nutritionixData.confidence;
        result.method = 'nutritionix';
        return result; // Success with free API
      }
    } catch (error) {
      console.log('Nutritionix unavailable, continuing with local estimate');
    }
  }

  // LAYER 4: Claude Haiku for edge cases (only if confidence is low)
  if (!skipClaude && result.confidence < 70 && duplicateCheck.isPotentialDuplicate) {
    try {
      const claudeData = await analyzeWithClaude(mealName, cuisine, taste, existingMeals);
      if (claudeData) {
        result.layers.push({ layer: 4, method: 'claude_haiku', result: claudeData });
        result.calories = claudeData.calories;
        result.isDuplicate = claudeData.isDuplicate;
        result.matchedMeal = claudeData.matchedMeal;
        result.confidence = claudeData.confidence;
        result.method = 'claude_haiku';
        result.costIncurred = 0.0002; // Approximate cost
      }
    } catch (error) {
      console.log('Claude unavailable, using local estimate');
    }
  }

  return result;
}

// ============ HELPER FUNCTIONS ============

/**
 * Get usage statistics
 */
export function getIntelligenceStats(analysisHistory) {
  const stats = {
    totalAnalyses: analysisHistory.length,
    methodBreakdown: {},
    totalCost: 0,
    averageConfidence: 0
  };

  for (const analysis of analysisHistory) {
    stats.methodBreakdown[analysis.method] = (stats.methodBreakdown[analysis.method] || 0) + 1;
    stats.totalCost += analysis.costIncurred || 0;
    stats.averageConfidence += analysis.confidence;
  }

  stats.averageConfidence = Math.round(stats.averageConfidence / analysisHistory.length);

  return stats;
}
