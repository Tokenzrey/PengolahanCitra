import tensorflow as tf
import numpy as np
import cv2
import os

# Load the pre-trained models
base_model = tf.keras.models.load_model('./src/models/model.keras')
edge_model = tf.keras.models.load_model('./src/models/modelCanny.keras')
boundary_model = tf.keras.models.load_model('./src/models/modelBE.keras')

# CIFAR-10 classes
CLASSES = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']

def apply_edge_detection(image):
    """Apply edge detection preprocessing to an image."""
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    return np.stack((edges,) * 3, axis=-1)  # Convert to 3-channel

def apply_boundary_extraction(image):
    """Apply boundary extraction preprocessing to an image."""
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    kernel = np.ones((3, 3), np.uint8)
    gradient = cv2.morphologyEx(blurred, cv2.MORPH_GRADIENT, kernel)
    return np.stack((gradient,) * 3, axis=-1)  # Convert to 3-channel

def process_image(image_file, model_type: str):
    """
    Service function to process the image using the specified CNN model type.

    Args:
        image_file (UploadFile): The uploaded image file.
        model_type (str): The type of CNN to use ('base', 'edge', 'boundary').

    Returns:
        str: Predicted class name.
    """
    # Read and preprocess the image
    file_bytes = image_file.file.read()
    np_img = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image format.")

    # Resize the image to 32x32 (CIFAR-10 format)
    img_resized = cv2.resize(img, (32, 32))

    # Apply preprocessing based on model type
    if model_type == "edge":
        img_resized = apply_edge_detection(img_resized)
    elif model_type == "boundary":
        img_resized = apply_boundary_extraction(img_resized)

    img_preprocessed = img_resized.astype('float32') / 255.0
    img_preprocessed = np.expand_dims(img_preprocessed, axis=0)  # Add batch dimension

    # Select the model
    if model_type == "base":
        model = base_model
    elif model_type == "edge":
        model = edge_model
    elif model_type == "boundary":
        model = boundary_model

    # Predict and get the predicted class
    predictions = model.predict(img_preprocessed)
    predicted_class_index = np.argmax(predictions)
    predicted_class_name = CLASSES[predicted_class_index]

    return predicted_class_name
