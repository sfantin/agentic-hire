from pydantic import BaseModel, Field


class SkillGap(BaseModel):
    skill: str = Field(..., description="Skill name")
    frequency: int = Field(..., ge=0, description="How many jobs require this skill")
    percentage: float = Field(..., ge=0.0, le=100.0, description="Percentage of jobs")


class GapAnalysisResult(BaseModel):
    skill_gaps: list[SkillGap] = Field(..., description="Top skills with gaps")
    recommendation: str = Field(..., description="AI recommendation for learning")
    analysis_period_days: int = Field(default=30, description="Number of days analyzed")
