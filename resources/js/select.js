import { applyFilter } from "./filtering.js";

document.addEventListener("DOMContentLoaded", () => {
	initializeSingleFilterSelect();
});

// Fungsi untuk inisialisasi filter dengan satu select
function initializeSingleFilterSelect() {
	const container = document.getElementById("selectFilter");
	container.innerHTML = ""; // Hapus elemen select sebelumnya jika ada
	createSingleFilterSelect(container);
}

// Fungsi untuk membuat elemen select filter
function createSingleFilterSelect(container) {
	const select = document.createElement("select");
	select.className = "mr-5";

	const options = [
		{ value: "base", text: "Base CNN" },
		{ value: "edge", text: "Edge Detection" },
		{ value: "boundary", text: "Boundary Extraction" },
	];

	options.forEach((option) => {
		const opt = document.createElement("option");
		opt.value = option.value;
		opt.textContent = option.text;
		select.appendChild(opt);
	});

	// Event listener untuk perubahan filter tanpa reload
	select.addEventListener("change", (event) => {
		event.preventDefault(); // Cegah reload
		applyFilter(); // Tembak API untuk memproses gambar dengan filter baru
	});

	container.appendChild(select);
}
