document
	.getElementById("imageInput")
	.addEventListener("change", handleImageUpload);
document.getElementById("filterSelect").addEventListener("change", applyFilter);

let img = new Image();
let canvas = document.getElementById("imageCanvas");
let ctx = canvas.getContext("2d");

function handleImageUpload(event) {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			img.src = e.target.result;
			img.onload = function () {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
			};
		};
		reader.readAsDataURL(file);
	}
}

function applyFilter() {
	const filter = document.getElementById("filterSelect").value;
	ctx.drawImage(img, 0, 0); // Redraw the image to clear previous filters

	if (filter === "grayscale") {
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
			data[i] = avg; // Red
			data[i + 1] = avg; // Green
			data[i + 2] = avg; // Blue
		}
		ctx.putImageData(imageData, 0, 0);
	} else if (filter === "invert") {
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let data = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 255 - data[i]; // Red
			data[i + 1] = 255 - data[i + 1]; // Green
			data[i + 2] = 255 - data[i + 2]; // Blue
		}
		ctx.putImageData(imageData, 0, 0);
	}
	// Add more filter implementations as needed
}
