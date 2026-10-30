from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.product import Product

from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)


router = APIRouter()


# --------------------------------------------------
# 1. CREATE PRODUCT
# --------------------------------------------------

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock
    )

    try:
        db.add(new_product)

        db.commit()

        db.refresh(new_product)

    except Exception:
        db.rollback()
        raise

    return new_product


# --------------------------------------------------
# 2. READ ALL PRODUCTS
# --------------------------------------------------

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):

    query = db.query(Product)

    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%")
        )

    products = query.offset(skip).limit(limit).all()

    return products


# --------------------------------------------------
# 3. READ ONE PRODUCT
# --------------------------------------------------

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# --------------------------------------------------
# 4. UPDATE PRODUCT (PUT)
# --------------------------------------------------

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    db_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if db_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    update_data = product.model_dump()

    try:
        for key, value in update_data.items():
            setattr(db_product, key, value)

        db.commit()

        db.refresh(db_product)

    except Exception:
        db.rollback()
        raise

    return db_product


# --------------------------------------------------
# 5. PARTIAL UPDATE PRODUCT (PATCH)
# --------------------------------------------------

@router.patch(
    "/{product_id}",
    response_model=ProductResponse
)
def partial_update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):

    db_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if db_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    update_data = product.model_dump(
        exclude_unset=True
    )

    # Prevent NULL for required database fields
    for field in ("name", "price", "stock"):
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=422,
                detail=f"{field} cannot be null"
            )

    try:
        for key, value in update_data.items():
            setattr(db_product, key, value)

        db.commit()

        db.refresh(db_product)

    except Exception:
        db.rollback()
        raise

    return db_product


# --------------------------------------------------
# 6. DELETE PRODUCT
# --------------------------------------------------

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    db_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if db_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    try:
        db.delete(db_product)

        db.commit()

    except Exception:
        db.rollback()
        raise

    return None
