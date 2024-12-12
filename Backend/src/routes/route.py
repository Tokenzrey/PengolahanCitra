from fastapi import FastAPI, APIRouter, UploadFile, Form
from src.controllers import image_controller

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Success"}

@router.post("/enhancement")
async def enhancement(image: UploadFile, filters: str = Form(...)):
    return await image_controller.enhance_image(image, filters)

@router.post("/process-image")
async def process_image(image: UploadFile, model_type: str = Form(...)):
    return await image_controller.process_image(image, model_type)

def init_routes(app: FastAPI):
    app.include_router(router)
