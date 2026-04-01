from pydantic import BaseModel, Field, model_validator


class QualificationResult(BaseModel):
    match_score: int = Field(ge=0, le=100)
    reasoning: str
    missing_skills: list[str]
    strong_points: list[str]
    is_high_match: bool = False

    @model_validator(mode="after")
    def set_high_match(self) -> "QualificationResult":
        self.is_high_match = self.match_score >= 85
        return self
