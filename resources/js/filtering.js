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

// Importing this function implies it's declared in another module
export async function applyFilter() {
	const imageInput = document.getElementById("imageInput").files[0];
	const selects = document.querySelectorAll("#selectFilter select");

	// Creating filters as an array of objects with 'name' and 'params'
	const filters = Array.from(selects)
		.map((select) => ({
			name: select.value,
			params: {} // You can add actual params here based on filter type if needed
		}))
		.filter((filter) => filter.name !== "none");

	const formData = new FormData();
	formData.append("image", imageInput);
	formData.append("filters", JSON.stringify(filters));

	ctxFiltered.drawImage(img, 0, 0);

	selects.forEach((select) => (select.disabled = true));

	if (!imageInput || filters.length === 0) {
		console.error("Image or filters are missing");
		return; // Exit if there's no image or filters
	}

	try {
		const response = await fetch("http://localhost:5000/enhancement", {
			method: "POST",
			body: formData
		});
		if (!response.ok) {
			throw new Error("Server Error");
		}
		const result = await response.json();
		displayFilteredImage(result.data);
	} catch (error) {
		console.error("Network Error:", error);
	} finally {
		selects.forEach((select) => (select.disabled = false));
	}
}

function displayFilteredImage(imageBase64) {
	const image = new Image();
	image.onload = () => {
		ctxFiltered.clearRect(0, 0, canvasFiltered.width, canvasFiltered.height);
		ctxFiltered.drawImage(
			image,
			0,
			0,
			canvasFiltered.width,
			canvasFiltered.height
		);
	};
	image.src = `data:image/jpeg;base64,${imageBase64}`;
}
