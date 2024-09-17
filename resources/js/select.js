import { applyFilter } from "./filtering.js";

// Inisialisasi awal dengan satu select
document.addEventListener("DOMContentLoaded", () => {
	initializeFilterSelect();
});

// Fungsi untuk inisialisasi filter dengan satu select
function initializeFilterSelect() {
	const container = document.getElementById("selectFilter");
	// Buat elemen select baru dengan index 1
	createFilterSelect(container, 1);
}

// Fungsi untuk menambahkan filter baru
export function addFilter() {
	const container = document.getElementById("selectFilter");
	const selects = container.querySelectorAll("select");

	if (selects.length < 6) {
		// Maksimal 6 filter
		const newIndex = selects.length + 1;
		createFilterSelect(container, newIndex);
	} else {
		alert("Maksimal 6 filter!");
	}
}

// Fungsi untuk menghapus filter terakhir
export function deleteFilter() {
	const container = document.getElementById("selectFilter");
	const selects = container.querySelectorAll("select");

	if (selects.length > 1) {
		// Minimal 1 filter harus ada
		container.removeChild(selects[selects.length - 1]);
		applyFilter();
	} else {
		alert("Minimal satu filter harus ada!");
	}
}

// Fungsi untuk membuat elemen select filter baru
function createFilterSelect(container, index) {
	const select = document.createElement("select");
	select.className = "mr-5";
	select.dataset.index = index; // Menambahkan atribut data-index

	const options = [
		{ value: "none", text: "None" },
		{ value: "grayscale", text: "Grayscale" },
		{ value: "invert", text: "Invert" },
		{ value: "median", text: "Median Filter" },
		// Tambahkan opsi lain jika diperlukan
	];

	options.forEach((option) => {
		const opt = document.createElement("option");
		opt.value = option.value;
		opt.textContent = option.text;
		select.appendChild(opt);
	});

	// Tambahkan event listener untuk filter change
	select.addEventListener("change", applyFilter);

	// Tambahkan elemen select ke dalam container
	container.appendChild(select);
}
