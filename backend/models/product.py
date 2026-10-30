from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime

from database import Base


class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    description = Column(Text, nullable=True)

    price = Column(Float, nullable=False)

    stock = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.now, nullable=False)

    updated_at = Column(
        DateTime,
        default=None,
        onupdate=datetime.now,
        nullable=True
    )
