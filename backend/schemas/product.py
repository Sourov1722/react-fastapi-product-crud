from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# Common fields
class ProductBase(BaseModel):

    name: str = Field(..., min_length=2, max_length=100)

    description: Optional[str] = None

    price: float = Field(..., gt=0)

    stock: int = Field(0, ge=0)


# For creating a product
class ProductCreate(ProductBase):
    pass


# For updating selected fields
class ProductUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    description: Optional[str] = None

    price: Optional[float] = Field(
        default=None,
        gt=0
    )

    stock: Optional[int] = Field(
        default=None,
        ge=0
    )


# For returning product data
class ProductResponse(ProductBase):

    id: int

    created_at: datetime

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
