import json
from fastapi import HTTPException
from src.services import image_processing
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
