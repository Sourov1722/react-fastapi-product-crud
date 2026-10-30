from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models.product import Product
from api.endpoints.products import router as products_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create application
app = FastAPI()


# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Include Product Router
app.include_router(
    products_router,
    prefix="/products",
    tags=["Products"]
)


@app.get("/")
def home():
    return {"message": "Product API is running"}