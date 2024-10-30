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
        "invert": invert,
        "median": lambda img: cv2.medianBlur(img, 5),
        "brightness": lambda img: adjust_brightness(img, params.get('value', 30)),
        "histogram_eq": histogram_equalization,
        "clahe": apply_clahe,
        "ahe": apply_ahe,
        "regional_contrast": regional_contrast,
        "contrast_adjustment": lambda img: contrast_adjustment(img, params.get('alpha', 1.5), params.get('beta', 0)),
        "gamma_correction": lambda img: apply_gamma_correction(img, params.get('gamma', 0.5)),
        "thresholding": lambda img: thresholding(img, params.get('thresh', 128)),
        "linear_stretch": linear_stretch,
        "log_transform": apply_log_transform,
        "sharpen": sharpen,
        "edge_enhancement": edge_enhancement,
        "smoothing": lambda img: cv2.GaussianBlur(img, (5, 5), 0),
        "morphological": morphological,
        "edge_detection": lambda img: cv2.Canny(img, params.get('lower', 100), params.get('upper', 200)),
        "ideal_lpf": lambda img: apply_frequency_domain_filters(img, "ideal_lpf", {"cutoff": params.get('cutoff', 50)}),
        "butterworth_lpf": lambda img: apply_frequency_domain_filters(img, "butterworth_lpf", {"cutoff": params.get('cutoff', 50), "order": params.get('order', 2)}),
        "gaussian_lpf": lambda img: apply_frequency_domain_filters(img, "gaussian_lpf", {"cutoff": params.get('cutoff', 50)}),
        "ideal_hpf": lambda img: apply_frequency_domain_filters(img, "ideal_hpf", {"cutoff": params.get('cutoff', 50)}),
        "butterworth_hpf": lambda img: apply_frequency_domain_filters(img, "butterworth_hpf", {"cutoff": params.get('cutoff', 50), "order": params.get('order', 2)}),
        "gaussian_hpf": lambda img: apply_frequency_domain_filters(img, "gaussian_hpf", {"cutoff": params.get('cutoff', 50)}),
        "notch_filter": lambda img: apply_frequency_domain_filters(img, "notch", {"cutoff": params.get('cutoff', 50), "notch_centers": params.get('notch_centers', [(10, 20), (-10, -20)])}),
        "homomorphic_filter": lambda img: apply_frequency_domain_filters(img, "homomorphic", {
            "gammaL": params.get('gammaL', 0.5), 
            "gammaH": params.get('gammaH', 1.5), 
            "d0": params.get('d0', 30)
        })
    }

    # Get the function corresponding to the filter name
    function = filter_functions.get(filter_name, lambda img: img)
    
    # Call the function, passing the image and params where necessary
    return function(image)

# Define individual filter functions
def grayscale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def invert(img):
    return cv2.bitwise_not(img)

def adjust_brightness(img, value=30):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    v = np.clip(v + value, 0, 255)
    final_hsv = cv2.merge((h, s, v))
    return cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)

def histogram_equalization(img):
    if len(img.shape) == 2:
        return cv2.equalizeHist(img)
    channels = cv2.split(img)
    eq_channels = [cv2.equalizeHist(ch) for ch in channels]
    return cv2.merge(eq_channels)

def apply_clahe(img):
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    if len(img.shape) == 2:
        return clahe.apply(img)
    channels = cv2.split(img)
    clahe_channels = [clahe.apply(ch) for ch in channels]
    return cv2.merge(clahe_channels)

def apply_ahe(img):
    ahe = cv2.createCLAHE(clipLimit=40.0, tileGridSize=(8, 8))
    if len(img.shape) == 2:
        return ahe.apply(img)
    channels = cv2.split(img)
    ahe_channels = [ahe.apply(ch) for ch in channels]
    return cv2.merge(ahe_channels)

def regional_contrast(img):
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)

def contrast_adjustment(img, alpha=1.5, beta=0):
    return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

def apply_gamma_correction(img, gamma):
    inv_gamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in range(256)]).astype("uint8")
    return cv2.LUT(img, table)

def thresholding(img, thresh):
    return cv2.threshold(img, thresh, 255, cv2.THRESH_BINARY)[1]

def linear_stretch(img):
    return cv2.normalize(img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

def apply_log_transform(img):
    c = 255 / np.log(1 + np.max(img))
    log_image = c * (np.log(img + 1))
    return np.array(log_image, dtype=np.uint8)

def sharpen(img):
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)

def edge_enhancement(img):
    kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
    return cv2.filter2D(img, -1, kernel)

def morphological(img):
    kernel = np.ones((5, 5), np.uint8)
    return cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)





# FTT
def apply_frequency_domain_filters(img, filter_type, params):
    # Handle grayscale and color images
    if len(img.shape) == 2:
        # Grayscale image
        return process_channel(img, filter_type, params)
    else:
        # Color image: process each channel separately
        channels = cv2.split(img)
        filtered_channels = [process_channel(channel, filter_type, params) for channel in channels]
        return cv2.merge(filtered_channels)

def process_channel(channel, filter_type, params):
    # FFT transformation
    dft = fft2(channel)
    dft_shift = fftshift(dft)

    # Generate filter mask
    mask = create_frequency_filter(channel.shape, filter_type, params)

    # Apply mask and inverse FFT
    filtered_dft_shift = dft_shift * mask
    filtered_channel = np.real(ifft2(ifftshift(filtered_dft_shift)))

    # Normalize the result to range [0, 255]
    filtered_channel = np.clip(filtered_channel, 0, 255)
    return np.uint8(filtered_channel)

def create_frequency_filter(shape, filter_type, params):
    rows, cols = shape
    center_row, center_col = rows // 2, cols // 2
    mask = np.ones((rows, cols), dtype=np.float32)

    cutoff = params.get('cutoff', 50)
    order = params.get('order', 2)  # Only used for Butterworth filters
    notch_centers = params.get('notch_centers', [])
    gammaL = params.get('gammaL', 0.5)
    gammaH = params.get('gammaH', 1.5)
    d0 = params.get('d0', 30)

    for u in range(rows):
        for v in range(cols):
            distance = np.sqrt((u - center_row) ** 2 + (v - center_col) ** 2)

            # Ideal Low-Pass Filter (ILPF)
            if filter_type == "ideal_lpf":
                mask[u, v] = 1 if distance <= cutoff else 0

            # Butterworth Low-Pass Filter (BLPF)
            elif filter_type == "butterworth_lpf":
                mask[u, v] = 1 / (1 + (distance / cutoff) ** (2 * order))

            # Gaussian Low-Pass Filter (GLPF)
            elif filter_type == "gaussian_lpf":
                mask[u, v] = np.exp(-(distance ** 2) / (2 * (cutoff ** 2)))

            # Ideal High-Pass Filter (IHPF)
            elif filter_type == "ideal_hpf":
                mask[u, v] = 0 if distance <= cutoff else 1

            # Butterworth High-Pass Filter (BHPF)
            elif filter_type == "butterworth_hpf":
                mask[u, v] = 1 - 1 / (1 + (distance / cutoff) ** (2 * order))

            # Gaussian High-Pass Filter (GHPF)
            elif filter_type == "gaussian_hpf":
                mask[u, v] = 1 - np.exp(-(distance ** 2) / (2 * (cutoff ** 2)))

            # Notch Filter (band reject filter)
            elif filter_type == "notch":
                for (u0, v0) in notch_centers:
                    d1 = np.sqrt((u - (center_row + u0)) ** 2 + (v - (center_col + v0)) ** 2)
                    d2 = np.sqrt((u - (center_row - u0)) ** 2 + (v - (center_col - v0)) ** 2)
                    mask[u, v] *= (1 / (1 + (cutoff / (d1 + 1e-5)) ** (2 * order))) * (1 / (1 + (cutoff / (d2 + 1e-5)) ** (2 * order)))

            # Homomorphic Filter (frequency domain filter to enhance contrast)
            elif filter_type == "homomorphic":
                mask[u, v] = (gammaH - gammaL) * (1 - np.exp(-(distance ** 2) / (2 * (d0 ** 2)))) + gammaL

    return mask


