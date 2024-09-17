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
	let windowSize = 3;
	const result = new Uint8ClampedArray(data);
	console.log(data);
	const channels = data.length / (width * height);
	const filterWindow = [];
	const limit = (windowSize - 1) / 2;

	for (let i = limit * -1; i < limit + 1; i += 1) {
		for (let j = limit * -1; j < limit + 1; j += 1) {
		filterWindow.push([i, j]);
		}
	}

	for (let col = 0; col < width; col += 1) {
		for (let row = 0; row < height; row += 1) {
		const index = (row * width + col) * channels;
		const arrRed = [];
		const arrGreen = [];
		const arrBlue = [];

		for (let z = 0; z < filterWindow.length; z += 1) {
			const i = ((row + filterWindow[z][0]) * width + (col + filterWindow[z][1])) * channels;

			if (i<0){
				arrRed.push(0);
				arrGreen.push(0);
				arrBlue.push(0);
			}

			arrRed.push(data[i]);
			arrGreen.push(data[i+1]);
			arrBlue.push(data[i+2]);
		}

		const redSorted = arrRed.sort((a, b) => a - b);
		const greenSorted = arrGreen.sort((a, b) => a - b);
		const blueSorted = arrBlue.sort((a, b) => a - b);

		const medianRed = redSorted[Math.floor(redSorted.length / 2)];
		const medianGreen = greenSorted[Math.floor(redSorted.length / 2)];
		const medianBlue = blueSorted[Math.floor(redSorted.length / 2)];

		result[index] = medianRed;
		result[index + 1] = medianGreen;
		result[index + 2] = medianBlue;

		if (channels === 4) result[index + 3] = 255;
		}
	}

	imageData.data.set(result);
	console.log(imageData);
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
