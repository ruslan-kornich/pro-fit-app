import logging
from typing import List, Optional

import httpx

from app.config.settings import settings
from app.schemas.nutrition_search import NutritionSearchResult, NutritionSearchResponse

logger = logging.getLogger(__name__)


class NutritionSearchError(Exception):
    pass


class NutritionSearchService:
    def __init__(self):
        self.api_url = settings.USDA_API_URL
        self.api_key = settings.USDA_API_KEY

    async def search(self, query: str) -> NutritionSearchResponse:
        if not self.api_key:
            raise NutritionSearchError("USDA API key is not configured. Get free key at https://fdc.nal.usda.gov/api-key-signup.html")

        request_body = {
            "query": query,
            "pageSize": 15,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.api_url}?api_key={self.api_key}",
                    json=request_body,
                )

                if response.status_code == 403:
                    logger.error("USDA API authentication failed")
                    raise NutritionSearchError("Invalid API key")

                if response.status_code == 429:
                    logger.warning("USDA API rate limit exceeded")
                    raise NutritionSearchError("Rate limit exceeded. Please try again later.")

                response.raise_for_status()
                data = response.json()

                results = self._parse_results(data)
                return NutritionSearchResponse(query=query, results=results)

        except httpx.TimeoutException:
            logger.error("USDA API request timed out")
            raise NutritionSearchError("Request timed out. Please try again.")
        except httpx.HTTPStatusError as error:
            logger.error(f"USDA API HTTP error: {error}")
            raise NutritionSearchError(f"API error: {error.response.status_code}")
        except NutritionSearchError:
            raise
        except Exception as error:
            logger.error(f"USDA API unexpected error: {error}")
            raise NutritionSearchError("An unexpected error occurred")

    def _parse_results(self, data: dict) -> List[NutritionSearchResult]:
        results = []
        foods = data.get("foods", [])

        for item in foods:
            description = item.get("description", "")
            if not description:
                continue

            brand = item.get("brandName") or item.get("brandOwner") or ""
            name = f"{description} ({brand})" if brand else description

            nutrients = self._extract_nutrients(item.get("foodNutrients", []))

            result = NutritionSearchResult(
                name=name,
                calories=nutrients.get("calories", 0),
                protein_g=nutrients.get("protein", 0),
                fat_total_g=nutrients.get("fat", 0),
                carbohydrates_total_g=nutrients.get("carbs", 0),
                serving_size_g=100.0,
            )
            results.append(result)

        return results

    def _extract_nutrients(self, food_nutrients: list) -> dict:
        nutrients = {
            "calories": 0,
            "protein": 0,
            "fat": 0,
            "carbs": 0,
        }

        nutrient_mapping = {
            "Energy": "calories",
            "Protein": "protein",
            "Total lipid (fat)": "fat",
            "Carbohydrate, by difference": "carbs",
        }

        for nutrient in food_nutrients:
            nutrient_name = nutrient.get("nutrientName", "")
            value = nutrient.get("value", 0)

            if nutrient_name in nutrient_mapping:
                key = nutrient_mapping[nutrient_name]
                nutrients[key] = float(value) if value else 0

        return nutrients


nutrition_search_service = NutritionSearchService()
