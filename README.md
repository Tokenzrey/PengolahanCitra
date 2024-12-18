### Kelompok 
|    NRP     |      Name      |
| :--------: | :------------: |
| 5025221052 | Muhammad Syarif Hidayatullah |
| 5025221038 | Rafli Syahputra Pane |
| 5025221017 | Valentino Reswara Ajiputra |


# Filtering Image With Spatial and Frequency

## Description

This project provides a web application that allows users to upload an image, apply various filters, and view the results in a canvas. The filters include grayscale and invert options, and you can extend the list of filters as needed. The application uses HTML, CSS, and JavaScript to handle image processing and user interactions.

## Features

- **Image Upload**: Allows users to upload an image file.
- **Filter Selection**: Users can choose from a list of filters to apply to the uploaded image.
- **Canvas Display**: Displays the image on a canvas element with applied filters and the original photo.

## Technologies Used

- **HTML**: For the structure of the web page.
- **CSS**: For styling the page and form elements.
- **JavaScript**: For handling image upload, filter application, and canvas rendering.

## Getting Started

### Prerequisites

- A modern web browser
- Basic understanding of HTML, CSS, and JavaScript

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tokenzrey/PengolahanCitra.git
   ```
    
2. **Navigate to the project directory:**
   ```bash
   cd resources
   ```

3. Open the `index.html` file in your web browser: use extennsion `open live with server`.
4. Navigate to the backend directory:
   ```bash
   cd ../Backend
   ```

5. Create a Python virtual environment:
   ```bash
   python -m venv env
   ```

6. Activate the virtual environment:
   ```bash
   .\env\Scripts\activate
   ```

7. Install the required packages:
   ```bash
   pip install --no-cache-dir -r requirements.txt 
   pip install --no-cache-dir -r requirements-dev.txt
   ```

8. Run the backend server using Uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 5000 --reload
   ```