// Element untuk menampilkan hasil prediksi
let resultContainer = document.getElementById("predictionResult");
let resultText = document.getElementById("predictedClass");

// Fungsi untuk menangani unggahan gambar
document
	.getElementById("imageInput")
	.addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
	const file = event.target.files[0];

	if (file) {
		// Langsung panggil applyFilter setelah gambar diunggah
		applyFilter();
	}
}

// Fungsi untuk menampilkan hasil prediksi
function displayPredictedClass(predictedClass) {
	// Perbarui elemen dengan predicted class
	resultText.textContent = `Predicted Class: ${predictedClass}`;

	// Tampilkan hasil jika sebelumnya tersembunyi
	if (resultContainer.classList.contains("hidden")) {
		resultContainer.classList.remove("hidden");
	}
}

// Fungsi untuk memproses filter
export async function applyFilter() {
	const imageInput = document.getElementById("imageInput").files[0];
	const select = document.querySelector("#selectFilter select");

	// Validasi input
	if (!imageInput || !select.value) {
		console.error("Image or filter type is missing");
		return; // Keluar jika tidak ada gambar atau filter
	}

	const formData = new FormData();
	formData.append("image", imageInput);
	formData.append("model_type", select.value);

	// Nonaktifkan select saat API berjalan
	select.disabled = true;

	try {
		const response = await fetch("http://localhost:5000/process-image", {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error("Server Error");
		}
		const result = await response.json();
		displayPredictedClass(result.predicted_class);
	} catch (error) {
		console.error("Network Error:", error);
	} finally {
		// Aktifkan kembali select setelah API selesai
		select.disabled = false;
	}
}
