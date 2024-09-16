document
	.getElementById("imageInput")
	.addEventListener("change", handleImageUpload);
document.getElementById("filterSelect").addEventListener("change", applyFilter);

let img = new Image();
let canvasOri = document.getElementById("imageCanvasOriginal");
let canvasFiltered = document.getElementById("imageCanvas");
let ctxOri = canvasOri.getContext("2d");
let ctxFiltered = canvasFiltered.getContext("2d");

let containerComparasion = document.getElementById("containerComparasion");

function handleImageUpload(event) {
	// Tampilkan section canvas jika belum terlihat
	if (!containerComparasion.classList.contains("!block")) {
		containerComparasion.classList.remove("hidden");
		containerComparasion.classList.add("!block");
	}
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			img.src = e.target.result;
			img.onload = function () {
				// Set ukuran canvas sesuai dengan ukuran gambar
				canvasOri.width = img.width;
				canvasOri.height = img.height;
				canvasFiltered.width = img.width;
				canvasFiltered.height = img.height;

				// Gambar asli
				ctxOri.drawImage(img, 0, 0);
				// Gambar yang akan difilter
				ctxFiltered.drawImage(img, 0, 0);
			};
		};
		reader.readAsDataURL(file);
	}
}

function applyFilter() {
	const filter = document.getElementById("filterSelect").value;
	ctxFiltered.drawImage(img, 0, 0); // Redraw the image to clear previous filters

	let imageData = ctxFiltered.getImageData(
		0,
		0,
		canvasFiltered.width,
		canvasFiltered.height
	);
	let data = imageData.data;

	if (filter === "grayscale") {
		for (let i = 0; i < data.length; i += 4) {
			let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
			data[i] = avg; // Red
			data[i + 1] = avg; // Green
			data[i + 2] = avg; // Blue
		}
	} else if (filter === "invert") {
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 255 - data[i]; // Red
			data[i + 1] = 255 - data[i + 1]; // Green
			data[i + 2] = 255 - data[i + 2]; // Blue
		}
	}

	// Terapkan perubahan data gambar pada canvas filtered
	ctxFiltered.putImageData(imageData, 0, 0);
}
