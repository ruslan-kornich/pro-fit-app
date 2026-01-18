import base64
import json
import logging
import re
from typing import Optional, List

from openai import AsyncOpenAI

from app.config.settings import settings
from app.schemas.food import FoodAnalysisResponse, RecommendationResponse, DishAnalysisResponse, FoodItemAnalysis

logger = logging.getLogger(__name__)


def extract_json_from_response(text: str) -> str:
    """Extract JSON object from response that may contain extra text."""
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        return match.group(0)
    return text


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def analyze_food_photo(self, image_data: bytes, mime_type: str = "image/jpeg") -> FoodAnalysisResponse:
        base64_image = base64.b64encode(image_data).decode("utf-8")

        prompt = """Analyze this food image. Identify the food and estimate its nutritional content.
Return a JSON object with the following fields:
- name: string (name of the food/dish)
- calories: integer (estimated calories)
- protein: number (grams of protein)
- fat: number (grams of fat)
- carbs: number (grams of carbohydrates)
- grams: number (estimated portion size in grams)
- confidence: number (0-1, how confident you are in this analysis)

Only return the JSON object, no additional text."""

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
                max_tokens=500,
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

    async def analyze_food_photo_detailed(self, image_data: bytes, mime_type: str = "image/jpeg") -> DishAnalysisResponse:
        logger.info(f"analyze_food_photo_detailed called, image_size={len(image_data)} bytes")
        base64_image = base64.b64encode(image_data).decode("utf-8")

        prompt = """You are a nutrition expert analyzing a food photo.

1. First, identify the MAIN DISH name (e.g., "Chicken with rice and salad")
2. Then break down ALL visible ingredients/components separately

Return ONLY a valid JSON object:
{
  "dish_name": "Main dish name",
  "items": [
    {"name": "Ingredient 1", "calories": 250, "protein": 20, "fat": 15, "carbs": 5, "grams": 150},
    {"name": "Ingredient 2", "calories": 130, "protein": 3, "fat": 0.5, "carbs": 28, "grams": 100}
  ],
  "confidence": 0.7
}

Important:
- dish_name = overall name of the meal
- items = EACH separate ingredient with its own nutritional values
- Estimate realistic portion sizes based on visual analysis"""

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
                max_tokens=1000,
            )

            content = response.choices[0].message.content.strip()
            json_content = extract_json_from_response(content)
            data = json.loads(json_content)
            return self._build_dish_analysis_response(data)
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from OpenAI response")
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
        calorie_goal: Optional[int],
        recent_foods: List[str],
    ) -> RecommendationResponse:
        prompt = f"""Based on the following daily nutritional intake, provide personalized nutrition recommendations.

Today's intake:
- Calories: {daily_calories} kcal (goal: {calorie_goal or 'not set'} kcal)
- Protein: {daily_protein:.1f}g
- Fat: {daily_fat:.1f}g
- Carbs: {daily_carbs:.1f}g

Recent foods consumed: {', '.join(recent_foods) if recent_foods else 'No data'}

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
                max_tokens=800,
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


openai_service = OpenAIService()
