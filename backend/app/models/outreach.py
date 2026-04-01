from pydantic import BaseModel, Field


class ColdOutreachResult(BaseModel):
    subject_line: str = Field(..., description="Email subject line")
    email_body: str = Field(..., description="Full email body")
    hiring_manager_tip: str = Field(..., description="Tip on where to find hiring manager")
    tone: str = Field(default="professional", description="Email tone")
