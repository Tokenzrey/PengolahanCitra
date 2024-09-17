export function applyInvertFilter(imageData) {
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		data[i] = 255 - data[i]; // Red
		data[i + 1] = 255 - data[i + 1]; // Green
		data[i + 2] = 255 - data[i + 2]; // Blue
	}

	return imageData;
}

export function applyGrayscaleFilter(imageData) {
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
		data[i] = avg; // Red
		data[i + 1] = avg; // Green
		data[i + 2] = avg; // Blue
	}

	return imageData;
}

export function applyMedianFilter(imageData, width, height) {
	const data = imageData.data;
	const windowSize = 3; // Ukuran jendela (3x3)
	const halfWindow = Math.floor(windowSize / 2);
	const result = new Uint8ClampedArray(data); // Hasilnya akan disimpan di array baru

	// Loop melalui setiap piksel
	for (let y = halfWindow; y < height - halfWindow; y++) {
		for (let x = halfWindow; x < width - halfWindow; x++) {
			// Buat array untuk menyimpan tetangga warna masing-masing channel
			const reds = [];
			const greens = [];
			const blues = [];

			// Ambil semua piksel di sekitar jendela 3x3
			for (let j = -halfWindow; j <= halfWindow; j++) {
				for (let i = -halfWindow; i <= halfWindow; i++) {
					const pixelIndex = ((y + j) * width + (x + i)) * 4;
					const red = data[pixelIndex];
					const green = data[pixelIndex + 1];
					const blue = data[pixelIndex + 2];

					// Tambahkan nilai masing-masing channel ke dalam array tetangga
					reds.push(red);
					greens.push(green);
					blues.push(blue);
				}
			}

			// Urutkan nilai intensitas tetangga untuk setiap channel
			reds.sort((a, b) => a - b);
			greens.sort((a, b) => a - b);
			blues.sort((a, b) => a - b);

			// Ambil nilai median untuk setiap channel
			const medianRed = reds[Math.floor(reds.length / 2)];
			const medianGreen = greens[Math.floor(greens.length / 2)];
			const medianBlue = blues[Math.floor(blues.length / 2)];

			// Setel piksel di posisi tengah jendela ke nilai median
			const pixelIndex = (y * width + x) * 4;
			result[pixelIndex] = medianRed; // Red
			result[pixelIndex + 1] = medianGreen; // Green
			result[pixelIndex + 2] = medianBlue; // Blue
			result[pixelIndex + 3] = data[pixelIndex + 3]; // Alpha tetap sama
		}
	}

	// Update image data dengan hasil yang sudah difilter
	imageData.data.set(result);

	return imageData;
}
