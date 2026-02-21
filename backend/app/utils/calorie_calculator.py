from enum import Enum, StrEnum


class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"


class ActivityLevel(float, Enum):
    SEDENTARY = 1.2
    LIGHTLY_ACTIVE = 1.375
    MODERATELY_ACTIVE = 1.55
    VERY_ACTIVE = 1.725
    EXTRA_ACTIVE = 1.9


class Goal(StrEnum):
    LOSE = "lose"
    MAINTAIN = "maintain"
    GAIN = "gain"


GOAL_CALORIE_ADJUSTMENTS = {
    Goal.LOSE: -500,
    Goal.MAINTAIN: 0,
    Goal.GAIN: 300,
}


def calculate_bmr(weight_kg: float, height_cm: float, age_years: int, gender: Gender) -> float:
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.

    Men: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
    Women: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
    """
    base_bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age_years)

    if gender == Gender.MALE:
        return base_bmr + 5
    else:
        return base_bmr - 161


def calculate_daily_calorie_norm(
    weight_kg: float | None,
    height_cm: float | None,
    age_years: int | None,
    gender: str | None,
    activity_level: float | None = None,
    goal: str | None = None,
) -> int | None:
    """
    Calculate Total Daily Energy Expenditure (TDEE) with goal adjustment.
    TDEE = BMR × activity_level + goal_adjustment
    """
    if not all([weight_kg, height_cm, age_years, gender]):
        return None

    try:
        gender_enum = Gender(gender.lower()) if gender else None
        if not gender_enum:
            return None
    except ValueError:
        return None

    bmr = calculate_bmr(weight_kg, height_cm, age_years, gender_enum)

    activity_multiplier = activity_level or ActivityLevel.SEDENTARY.value

    tdee = bmr * activity_multiplier

    goal_adjustment = 0
    if goal:
        try:
            goal_enum = Goal(goal.lower())
            goal_adjustment = GOAL_CALORIE_ADJUSTMENTS.get(goal_enum, 0)
        except ValueError:
            pass

    return round(tdee + goal_adjustment)
