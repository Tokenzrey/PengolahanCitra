import json
from fastapi import HTTPException
from fastapi.responses import FileResponse
from src.services import image_processing
from src.services import cnn_services
import asyncio

async def enhance_image(image_file, filters: str):
    try:
        filters = json.loads(filters)  # Convert filter string to list of objects
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid filters format")

    if not filters:
        raise HTTPException(status_code=400, detail="No filters provided")

    # Process the image asynchronously
    try:
        result = await asyncio.to_thread(image_processing.apply_filters, image_file.file, filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
    
    # Return the processed image as base64
    return {"message": "Image processed successfully", "data": result}

async def process_image(image_file, model_type: str):
    """
    Controller function to process the image using the specified CNN model type.

    Args:
        image_file (UploadFile): The uploaded image file.
        model_type (str): The type of CNN to use ('base', 'edge', 'boundary').

    Returns:
        dict: Predicted class as string.
    """
    if model_type not in ["base", "edge", "boundary"]:
        raise HTTPException(status_code=400, detail="Invalid model type. Choose from 'base', 'edge', or 'boundary'.")

    try:
        # Process the image asynchronously
        predicted_class = await asyncio.to_thread(cnn_services.process_image, image_file, model_type)
        return {"message": "Image processed successfully", "predicted_class": predicted_class}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
