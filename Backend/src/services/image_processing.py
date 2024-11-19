import cv2
import numpy as np
import base64
from numpy.fft import fft2, ifft2, fftshift, ifftshift

def apply_filters(image_file, filters):
    # Memuat file gambar ke dalam array numpy
    try:
        raw = bytearray(image_file.read())
        image = np.asarray(raw, dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Gagal membaca gambar. Harap berikan file gambar yang valid.")
    except Exception as e:
        raise ValueError("Data gambar tidak valid: " + str(e))

    # Menerapkan filter secara berurutan
    for filter_obj in filters:
        filter_name = filter_obj.get('name')  # Nama filter
        params = filter_obj.get('params', {})  # Parameter tambahan untuk filter
        image = handle_filter(image, filter_name, params)

    # Mengode gambar hasil akhir menjadi base64 untuk transmisi via web
    _, buffer = cv2.imencode('.jpg', image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    return image_base64

def handle_filter(image, filter_name, params):
    # Daftar filter yang tersedia dan fungsi yang terkait
    filter_functions = {
        "grayscale": grayscale,  # Mengonversi gambar ke grayscale
        "boundary_extraction": boundary_extraction,  # Ekstraksi batas
        "global_thresholding": global_thresholding,  # Thresholding global
        "adaptive_thresholding": adaptive_thresholding,  # Thresholding adaptif
    }

    # Mendapatkan fungsi yang sesuai dengan nama filter
    function = filter_functions.get(filter_name, lambda img, params: img)
    
    # Memanggil fungsi, meneruskan gambar dan parameter
    return function(image, params)

# Fungsi untuk mengonversi gambar ke grayscale
def grayscale(img, params=None):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Fungsi untuk ekstraksi batas
def boundary_extraction(img, params=None):
    # Mengonversi ke grayscale jika gambar berwarna
    if len(img.shape) == 3:  # Periksa apakah gambar berwarna
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Mendefinisikan elemen struktur (kernel)
    kernel = np.ones((3, 3), np.uint8)
    
    # Melakukan erosi
    eroded = cv2.erode(img, kernel, iterations=1)
    
    # Mengurangi gambar erosi dari gambar asli untuk mendapatkan batas
    boundary = cv2.subtract(img, eroded)
    
    return boundary

# Fungsi untuk thresholding global menggunakan metode Otsu
def global_thresholding(img, params):
    """
    Mengaplikasikan thresholding global menggunakan metode Otsu.

    Thresholding global bekerja dengan memilih satu nilai ambang (threshold) untuk 
    seluruh gambar. Metode Otsu digunakan untuk menentukan nilai ambang optimal.

    Parameters:
    -----------
    img : numpy.ndarray
        Gambar input dalam format grayscale atau berwarna.
    params : dict
        Parameter tambahan (tidak digunakan pada thresholding global).

    Returns:
    --------
    binary : numpy.ndarray
        Gambar biner hasil thresholding global.
    """
    # Mengonversi ke grayscale jika belum
    if len(img.shape) == 3:  # Periksa apakah gambar berwarna
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
    # Menerapkan thresholding global dengan metode Otsu
    _, binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return binary

# Fungsi untuk adaptive thresholding
def adaptive_thresholding(img, params):
    """
    Mengaplikasikan adaptive thresholding untuk menghasilkan gambar biner.

    Parameters:
    -----------
    img : numpy.ndarray
        Gambar input dalam format grayscale atau berwarna.
    params : dict
        Parameter tambahan:
        - "block_size" (int): Ukuran blok lokal (harus ganjil). Default: 11.
        - "constant_c" (int): Konstanta pengurang threshold. Default: 2.

    Returns:
    --------
    adaptive_binary : numpy.ndarray
        Gambar biner hasil adaptive thresholding.
    """
    # Mengonversi ke grayscale jika belum
    if len(img.shape) == 3:  # Periksa apakah gambar berwarna
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Mendapatkan parameter block size dan constant C
    block_size = params.get("block_size", 11)  # Default ukuran blok adalah 11 (harus ganjil)
    constant_c = params.get("constant_c", 2)   # Default konstanta C adalah 2
    
    # Menerapkan adaptive thresholding
    adaptive_binary = cv2.adaptiveThreshold(
        img, 255,  # Nilai maksimal untuk gambar biner
        cv2.ADAPTIVE_THRESH_MEAN_C,  # Metode adaptif (rata-rata atau Gaussian)
        cv2.THRESH_BINARY,  # Jenis threshold
        block_size,  # Ukuran wilayah untuk menghitung threshold
        constant_c  # Konstanta yang dikurangi dari hasil rata-rata
    )
    return adaptive_binary
