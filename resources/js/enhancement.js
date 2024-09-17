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
	const windowSize = 3;
	const halfWindow = Math.floor(windowSize / 2);
	const result = new Uint8ClampedArray(data);

	// Helper function to get pixel data with boundary checks
	function getPixel(x, y) {
		// Handle out-of-bounds by reflecting the pixel location
		const clampedX = Math.min(Math.max(x, 0), width - 1);
		const clampedY = Math.min(Math.max(y, 0), height - 1);
		const index = (clampedY * width + clampedX) * 4;
		return [data[index], data[index + 1], data[index + 2]];
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const reds = [];
			const greens = [];
			const blues = [];

			for (let j = -halfWindow; j <= halfWindow; j++) {
				for (let i = -halfWindow; i <= halfWindow; i++) {
					const [r, g, b] = getPixel(x + i, y + j);
					reds.push(r);
					greens.push(g);
					blues.push(b);
				}
			}

			// Sort and find median
			reds.sort((a, b) => a - b);
			greens.sort((a, b) => a - b);
			blues.sort((a, b) => a - b);

			const medianRed = reds[Math.floor(reds.length / 2)];
			const medianGreen = greens[Math.floor(greens.length / 2)];
			const medianBlue = blues[Math.floor(blues.length / 2)];

			const pixelIndex = (y * width + x) * 4;
			result[pixelIndex] = medianRed;
			result[pixelIndex + 1] = medianGreen;
			result[pixelIndex + 2] = medianBlue;
			result[pixelIndex + 3] = data[pixelIndex + 3]; // Alpha remains unchanged
		}
	}

	// Update image data with filtered results
	imageData.data.set(result);

	return imageData;
}

export function applyUnsharpMask(
	imageData,
	width,
	height,
	amount = 1,
	radius = 1
) {
	const data = imageData.data;
	const result = new Uint8ClampedArray(data);
	const radius2 = radius * radius;

	// Apply a simplified Gaussian blur for the unsharp mask
	function gaussianBlur(x, y) {
		let sum = [0, 0, 0];
		let weightSum = 0;

		// Gaussian kernel weights (simplified)
		const kernelSize = 2 * radius + 1;
		const kernel = [];

		for (let j = -radius; j <= radius; j++) {
			for (let i = -radius; i <= radius; i++) {
				const dist = Math.sqrt(i * i + j * j);
				if (dist <= radius) {
					const weight = Math.exp((-dist * dist) / (2 * radius2));
					kernel.push({ dx: i, dy: j, weight });
					weightSum += weight;
				}
			}
		}

		// Apply weighted average for blur
		kernel.forEach(({ dx, dy, weight }) => {
			const nx = Math.min(Math.max(x + dx, 0), width - 1);
			const ny = Math.min(Math.max(y + dy, 0), height - 1);
			const idx = (ny * width + nx) * 4;
			sum[0] += data[idx] * weight;
			sum[1] += data[idx + 1] * weight;
			sum[2] += data[idx + 2] * weight;
		});

		return [sum[0] / weightSum, sum[1] / weightSum, sum[2] / weightSum];
	}

	// Perform unsharp masking
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;

			// Apply Gaussian blur
			const [blurR, blurG, blurB] = gaussianBlur(x, y);

			// Unsharp mask formula: original + amount * (original - blurred)
			result[idx] = Math.min(
				255,
				Math.max(0, data[idx] + amount * (data[idx] - blurR))
			);
			result[idx + 1] = Math.min(
				255,
				Math.max(0, data[idx + 1] + amount * (data[idx + 1] - blurG))
			);
			result[idx + 2] = Math.min(
				255,
				Math.max(0, data[idx + 2] + amount * (data[idx + 2] - blurB))
			);
			result[idx + 3] = data[idx + 3]; // Alpha remains unchanged
		}
	}

	imageData.data.set(result);
	return imageData;
}
