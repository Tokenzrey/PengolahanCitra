from fastapi import FastAPI, APIRouter, UploadFile, Form
from src.controllers import image_controller

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Success"}

@router.post("/enhancement")
async def enhancement(image: UploadFile, filters: str = Form(...)):
    return await image_controller.enhance_image(image, filters)

def init_routes(app: FastAPI):
    app.include_router(router)
