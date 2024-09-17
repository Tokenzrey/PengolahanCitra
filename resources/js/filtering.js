import {
	applyGrayscaleFilter,
	applyInvertFilter,
	applyMedianFilter,
} from "./enhancement.js";

document
	.getElementById("imageInput")
	.addEventListener("change", handleImageUpload);

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

// Fungsi untuk menerapkan pipeline filter berdasarkan urutan select
export function applyFilter() {
	const selects = document.querySelectorAll("#selectFilter select");
	// Mulai dari gambar asli
	ctxFiltered.drawImage(img, 0, 0); // Redraw the original image

	let imageData = ctxFiltered.getImageData(
		0,
		0,
		canvasFiltered.width,
		canvasFiltered.height
	);

	// Terapkan filter secara berurutan sesuai dengan select
	selects.forEach((select) => {
		const filter = select.value;

		// Terapkan filter berdasarkan pilihan user
		if (filter === "grayscale") {
			imageData = applyGrayscaleFilter(imageData);
		} else if (filter === "invert") {
			imageData = applyInvertFilter(imageData);
		} else if (filter === "median") {
			imageData = applyMedianFilter(
				imageData,
				canvasFiltered.width,
				canvasFiltered.height
			);
		}
	});

	// Terapkan perubahan data gambar pada canvas filtered
	ctxFiltered.putImageData(imageData, 0, 0);
}
