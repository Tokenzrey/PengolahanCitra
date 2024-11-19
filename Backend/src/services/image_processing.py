import cv2
import numpy as np
import base64
from numpy.fft import fft2, ifft2, fftshift, ifftshift

def apply_filters(image_file, filters):
    # Load image file into numpy array
    try:
        raw = bytearray(image_file.read())
        image = np.asarray(raw, dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Failed to decode image. Please provide a valid image file.")
    except Exception as e:
        raise ValueError("Invalid image data: " + str(e))

    # Apply each filter sequentially
    for filter_obj in filters:
        filter_name = filter_obj.get('name')
        params = filter_obj.get('params', {})
        image = handle_filter(image, filter_name, params)

    # Encode the final image as base64 for web transmission
    _, buffer = cv2.imencode('.jpg', image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    return image_base64

def handle_filter(image, filter_name, params):
    # Define available filters and their handling functions
    filter_functions = {
        "grayscale": grayscale,
    }

    # Get the function corresponding to the filter name
    function = filter_functions.get(filter_name, lambda img: img)
    
    # Call the function, passing the image and params where necessary
    return function(image)

# Define individual filter functions
def grayscale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)