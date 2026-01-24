import base64
import json
import logging
import re

from openai import AsyncOpenAI

from app.config.settings import settings
from app.schemas.food import DishAnalysisResponse, FoodAnalysisResponse, FoodItemAnalysis, RecommendationResponse
from app.schemas.profiles import AICalorieRecommendationResponse

logger = logging.getLogger(__name__)


def extract_json_from_response(text: str) -> str:
    """Extract JSON object from response that may contain extra text."""
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return match.group(0)
    return text


def get_language_instruction(language: str = "uk") -> str:
    """Get language instruction for the prompt."""
    if language == "uk":
        return "IMPORTANT: Respond with ALL text content in Ukrainian language. Use Ukrainian for food names, descriptions, and all other text."
    return "IMPORTANT: Respond with ALL text content in English language. Use English for food names, descriptions, and all other text."


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def analyze_food_photo(
        self,
        image_data: bytes,
        mime_type: str = "image/jpeg",
        language: str = "uk",
    ) -> FoodAnalysisResponse:
        base64_image = base64.b64encode(image_data).decode("utf-8")
        language_instruction = get_language_instruction(language)

        prompt = f"""{language_instruction}

You are an expert nutritionist analyzing a food photo.

TASK: Identify the food/dish and estimate its total nutritional content with accurate weight.

WEIGHT ESTIMATION REFERENCES:
- Standard dinner plate = 25-27cm diameter
- Palm-sized meat/fish = ~100-120g
- Fist-sized rice/pasta = ~150-180g cooked
- Deck of cards = ~85g meat
- Tennis ball = ~130g rice/grains
- Typical main dish = 200-500g total

ANALYSIS STEPS:
1. Identify what food/dish is shown (be specific - include cooking method if visible)
2. Estimate total portion weight in grams using plate size as reference
3. Calculate nutritional values based on estimated weight

Return ONLY a valid JSON object:
{{
  "name": "Specific food name with cooking method if applicable",
  "calories": 350,
  "protein": 25.0,
  "fat": 12.0,
  "carbs": 30.0,
  "grams": 250,
  "confidence": 0.85
}}

RULES:
- Name should be descriptive (e.g., "Grilled salmon fillet with lemon" not just "fish")
- GRAMS field is critical - estimate realistic total weight of the portion
- Calculate calories proportionally to weight (e.g., rice = 130kcal/100g, chicken = 165kcal/100g)
- Include ALL visible components in the calorie count (sauces, oils, sides)
- Consider cooking method: fried foods have more fat, grilled less
- Confidence 0.9+ only for clearly identifiable, simple foods"""

        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}",
                                    "detail": "high",
                                },
                            },
                        ],
                    }
                ],
                max_completion_tokens=500,
            )

            content = response.choices[0].message.content.strip()
            json_content = extract_json_from_response(content)
            data = json.loads(json_content)

            return FoodAnalysisResponse(
                name=data.get("name", "Unknown food"),
                calories=int(data.get("calories", 200)),
                protein=float(data.get("protein", 0)) if data.get("protein") else None,
                fat=float(data.get("fat", 0)) if data.get("fat") else None,
                carbs=float(data.get("carbs", 0)) if data.get("carbs") else None,
                grams=float(data.get("grams", 100)) if data.get("grams") else None,
                confidence=float(data.get("confidence", 0.5)) if data.get("confidence") else None,
            )
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from OpenAI response")
            return FoodAnalysisResponse(
                name="Unknown food",
                calories=200,
                protein=10,
                fat=8,
                carbs=20,
                grams=150,
                confidence=0.3,
            )
        except Exception as error:
            logger.error(f"OpenAI API error: {error}")
            raise

    async def analyze_food_photo_detailed(
        self,
        image_data: bytes,
        mime_type: str = "image/jpeg",
        language: str = "uk",
    ) -> DishAnalysisResponse:
        logger.info(f"analyze_food_photo_detailed called, image_size={len(image_data)} bytes, language={language}")
        base64_image = base64.b64encode(image_data).decode("utf-8")
        language_instruction = get_language_instruction(language)

        system_prompt = f"""{language_instruction}

You are an expert nutritionist and food analyst with 20+ years of experience in visual food recognition and portion estimation. You have extensive knowledge of:
- International cuisines and their typical ingredients
- Cooking methods and how they affect nutritional values
- Visual portion estimation techniques
- Hidden ingredients (oils, sauces, seasonings)"""

        user_prompt = f"""{language_instruction}

Analyze this food photo carefully and thoroughly.

STEP 1 - VISUAL ANALYSIS:
Look at the image and identify:
- What type of dish is this? (breakfast, lunch, dinner, snack, dessert)
- What cuisine does it appear to be? (Italian, Asian, American, etc.)
- What cooking method was likely used? (fried, baked, raw, grilled, boiled)
- What is the approximate plate/container size for scale reference?

STEP 2 - INGREDIENT IDENTIFICATION:
Identify ALL visible components, including:
- Main protein sources (meat, fish, eggs, legumes, tofu)
- Carbohydrate sources (rice, pasta, bread, potatoes)
- Vegetables and greens (be specific: lettuce vs spinach vs cabbage)
- Sauces, dressings, and condiments (estimate type and amount)
- Oils and fats used in cooking (visible shine = oil present)
- Garnishes and toppings (cheese, nuts, seeds, herbs)

STEP 3 - PORTION/WEIGHT ESTIMATION:
For each ingredient, estimate weight in grams using these references:
- Standard dinner plate = 25-27cm diameter
- Palm-sized portion of meat/fish = ~100-120g
- Fist-sized portion of rice/pasta = ~150-180g cooked
- Cupped handful of vegetables = ~80-100g
- Tablespoon of sauce/oil = ~15g
- Slice of bread = ~30-40g
- Medium egg = ~50g
- Cheese slice = ~20-30g

Visual estimation technique:
1. Identify plate/container size as scale reference
2. Estimate each ingredient's coverage area and thickness
3. Compare to known food volumes (deck of cards = 85g meat, tennis ball = 130g rice)

STEP 4 - NUTRITIONAL CALCULATION:
Calculate nutrition per ingredient based on:
- Standard nutritional databases (USDA)
- Cooking method adjustments (frying adds ~30% calories from oil absorption)
- Sauce/dressing additions

Return ONLY a valid JSON object (no markdown, no explanation):
{{
  "dish_name": "Descriptive name of the complete meal",
  "items": [
    {{"name": "Specific ingredient name", "calories": 250, "protein": 20.0, "fat": 15.0, "carbs": 5.0, "grams": 150}},
    {{"name": "Another ingredient", "calories": 130, "protein": 3.0, "fat": 0.5, "carbs": 28.0, "grams": 100}}
  ],
  "confidence": 0.85
}}

CRITICAL RULES:
- Be SPECIFIC with ingredient names (e.g., "Grilled chicken breast" not just "chicken")
- Include cooking oils/fats if food appears fried or sautéed (add as separate item "Cooking oil")
- Include visible sauces as separate items with estimated amounts
- For mixed dishes, try to separate components (rice separate from meat separate from vegetables)
- Confidence should be 0.9+ only if ingredients are clearly visible and identifiable
- If something is partially hidden or uncertain, still include it with lower confidence reflected in the overall score
- Minimum 2 items, even for simple foods (e.g., "Toast" = bread + butter)
- WEIGHT IS CRITICAL: Always provide realistic grams for each item - this directly affects calorie accuracy
- Calculate calories based on grams (e.g., chicken breast = 165 kcal/100g, white rice = 130 kcal/100g cooked)
- Total meal weight should typically be 200-500g for a main dish"""

        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_VISION_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}",
                                    "detail": "high",
                                },
                            },
                        ],
                    },
                ],
                max_completion_tokens=1500,
            )

            content = response.choices[0].message.content.strip()
            logger.info(f"OpenAI raw response: {content[:500]}")
            json_content = extract_json_from_response(content)
            data = json.loads(json_content)
            return self._build_dish_analysis_response(data)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse JSON from OpenAI response: {content[:500]}")
            return self._get_fallback_dish_response()
        except Exception as error:
            logger.error(f"OpenAI API error: {error}")
            raise

    def _build_dish_analysis_response(self, data: dict) -> DishAnalysisResponse:
        items = []
        total_calories = 0
        total_grams = 0.0
        total_protein = 0.0
        total_fat = 0.0
        total_carbs = 0.0

        for item_data in data.get("items", []):
            item = FoodItemAnalysis(
                name=item_data.get("name", "Unknown"),
                calories=int(item_data.get("calories", 0)),
                protein=float(item_data.get("protein", 0)) if item_data.get("protein") is not None else None,
                fat=float(item_data.get("fat", 0)) if item_data.get("fat") is not None else None,
                carbs=float(item_data.get("carbs", 0)) if item_data.get("carbs") is not None else None,
                grams=float(item_data.get("grams", 0)) if item_data.get("grams") is not None else None,
            )
            items.append(item)

            total_calories += item.calories
            total_grams += item.grams or 0
            total_protein += item.protein or 0
            total_fat += item.fat or 0
            total_carbs += item.carbs or 0

        return DishAnalysisResponse(
            dish_name=data.get("dish_name", "Mixed meal"),
            total_calories=total_calories,
            total_grams=total_grams,
            total_protein=total_protein,
            total_fat=total_fat,
            total_carbs=total_carbs,
            items=items,
            confidence=float(data.get("confidence", 0.5)) if data.get("confidence") is not None else None,
        )

    def _get_fallback_dish_response(self) -> DishAnalysisResponse:
        return DishAnalysisResponse(
            dish_name="Mixed meal (manual entry recommended)",
            total_calories=450,
            total_grams=350.0,
            total_protein=25.0,
            total_fat=15.0,
            total_carbs=45.0,
            items=[
                FoodItemAnalysis(
                    name="Main component",
                    calories=300,
                    protein=20,
                    fat=12,
                    carbs=25,
                    grams=200,
                ),
                FoodItemAnalysis(
                    name="Side dish",
                    calories=150,
                    protein=5,
                    fat=3,
                    carbs=20,
                    grams=150,
                ),
            ],
            confidence=0.2,
        )

    async def get_recommendations(
        self,
        daily_calories: int,
        daily_protein: float,
        daily_fat: float,
        daily_carbs: float,
        calorie_goal: int | None,
        recent_foods: list[str],
        language: str = "uk",
    ) -> RecommendationResponse:
        language_instruction = get_language_instruction(language)

        prompt = f"""{language_instruction}

Based on the following daily nutritional intake, provide personalized nutrition recommendations.

Today's intake:
- Calories: {daily_calories} kcal (goal: {calorie_goal or "not set"} kcal)
- Protein: {daily_protein:.1f}g
- Fat: {daily_fat:.1f}g
- Carbs: {daily_carbs:.1f}g

Recent foods consumed: {", ".join(recent_foods) if recent_foods else "No data"}

Return a JSON object with:
- recommendations: array of 3-5 specific, actionable recommendations (strings)
- insights: string with a brief overall assessment of the diet
- protein_status: string ("low", "adequate", "high")
- balance_score: integer 1-100 (overall diet balance score)

Only return the JSON object, no additional text."""

        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=800,
            )

            content = response.choices[0].message.content.strip()
            json_content = extract_json_from_response(content)
            data = json.loads(json_content)

            return RecommendationResponse(
                recommendations=data.get("recommendations", []),
                insights=data.get("insights", ""),
                protein_status=data.get("protein_status", "adequate"),
                balance_score=int(data.get("balance_score", 50)),
            )
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from OpenAI response")
            return RecommendationResponse(
                recommendations=[
                    "Track your meals consistently for better insights",
                    "Aim for a balanced distribution of macronutrients",
                    "Stay hydrated throughout the day",
                ],
                insights="Keep logging your meals to get personalized recommendations.",
                protein_status="adequate",
                balance_score=50,
            )
        except Exception as error:
            logger.error(f"OpenAI API error: {error}")
            raise

    async def get_calorie_recommendation(
        self,
        weight_kg: float | None,
        height_cm: float | None,
        age_years: int | None,
        gender: str | None,
        activity_level: float | None,
        goal: str,
        current_calorie_norm: int | None,
        language: str = "uk",
    ) -> AICalorieRecommendationResponse:
        language_instruction = get_language_instruction(language)

        activity_descriptions = {
            1.2: "sedentary (little or no exercise)",
            1.375: "lightly active (light exercise 1-3 days/week)",
            1.55: "moderately active (moderate exercise 3-5 days/week)",
            1.725: "very active (hard exercise 6-7 days/week)",
            1.9: "extra active (very hard exercise & physical job)",
        }
        activity_desc = activity_descriptions.get(activity_level, f"activity factor {activity_level}")

        goal_descriptions = {
            "lose": "lose weight",
            "maintain": "maintain current weight",
            "gain": "gain weight/muscle",
        }
        goal_desc = goal_descriptions.get(goal, goal)

        prompt = f"""{language_instruction}

You are an expert nutritionist providing personalized calorie recommendations.

User profile:
- Weight: {weight_kg or "not provided"} kg
- Height: {height_cm or "not provided"} cm
- Age: {age_years or "not provided"} years
- Gender: {gender or "not provided"}
- Activity level: {activity_desc}
- Goal: {goal_desc}
- Current calorie target: {current_calorie_norm or "not set"} kcal/day

Based on this profile, provide a personalized calorie recommendation using the Mifflin-St Jeor equation as a base, adjusted for activity level and goal.

Return a JSON object with:
- recommended_calories_min: lower bound of healthy calorie range (integer)
- recommended_calories_max: upper bound of healthy calorie range (integer)
- recommended_calories_optimal: optimal daily calories for their goal (integer)
- explanation: detailed explanation of why this range is recommended (2-3 sentences)
- personalized_tips: array of 3-4 specific, actionable tips for achieving their goal
- factors_considered: array of factors that influenced the recommendation

Only return the JSON object, no additional text."""

        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=1000,
            )

            content = response.choices[0].message.content.strip()
            json_content = extract_json_from_response(content)
            data = json.loads(json_content)

            return AICalorieRecommendationResponse(
                recommended_calories_min=int(data.get("recommended_calories_min", 1500)),
                recommended_calories_max=int(data.get("recommended_calories_max", 2500)),
                recommended_calories_optimal=int(data.get("recommended_calories_optimal", 2000)),
                explanation=data.get("explanation", "Based on your profile data."),
                personalized_tips=data.get("personalized_tips", []),
                factors_considered=data.get("factors_considered", []),
            )
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from OpenAI calorie recommendation response")
            return AICalorieRecommendationResponse(
                recommended_calories_min=1500,
                recommended_calories_max=2500,
                recommended_calories_optimal=2000,
                explanation="Unable to generate personalized recommendation. Please try again.",
                personalized_tips=[
                    "Track your meals consistently",
                    "Stay hydrated",
                    "Eat a balanced diet",
                ],
                factors_considered=["Default recommendation"],
            )
        except Exception as error:
            logger.error(f"OpenAI API error: {error}")
            raise


openai_service = OpenAIService()
