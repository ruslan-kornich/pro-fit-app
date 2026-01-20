from typing import List

from pydantic import BaseModel


class NutritionSearchResult(BaseModel):
    name: str
    calories: float
    protein_g: float
    fat_total_g: float
    carbohydrates_total_g: float
    serving_size_g: float


class NutritionSearchResponse(BaseModel):
    query: str
    results: List[NutritionSearchResult]
