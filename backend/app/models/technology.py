from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class OriginModel(BaseModel):
    institution: Optional[str] = None
    country: Optional[str] = None
    organization: Optional[str] = None

class FundingRound(BaseModel):
    amount: Optional[int] = None
    currency: str = "USD"
    date: Optional[datetime] = None
    investors: List[str] = []
    round_type: Optional[str] = None # Seed, Series A, Grant

class TechnologyBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    origin: OriginModel = Field(default_factory=OriginModel)
    funding: List[FundingRound] = []
    status: Optional[str] = None
    maturity_level: Optional[int] = Field(None, ge=1, le=9)
    market_adoption: Optional[str] = None # low, medium, high
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class TechnologyCreate(TechnologyBase):
    pass

class TechnologyUpdate(TechnologyBase):
    name: Optional[str] = None 
    # Partial updates allowed for other fields via automatic Pydantic behavior if not required, 
    # but for explicit PATCH endpoints often useful to have all Optional.
    # For simplicity, reusing Base but usually would treat all as optional.

class Technology(TechnologyBase):
    id: UUID
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True
