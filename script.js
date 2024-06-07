// Tambahkan event listener untuk pengunggahan gambar dan tombol prediksi
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('predictButton').addEventListener('click', predictDisease);

let model; // Variabel untuk menyimpan model TensorFlow
const diseaseData = [
    { name: 'Bacterial' },
    { name: 'Fungal' },
    { name: 'Hama' },
    { name: 'Healthy' },
    { name: 'Virus' }
];

// Memuat model TensorFlow
async function loadModel() {
    try {
        model = await tf.loadLayersModel('model/model.json');
        console.log('Model loaded successfully!');
        document.getElementById('predictButton').disabled = false; // Aktifkan tombol setelah model dimuat
    } catch (error) {
        console.error('Failed to load model:', error);
    }
}

// Menangani pengunggahan gambar
function handleImageUpload(event) {
    const file = event.target.files[0];
    const img = document.getElementById('uploadedImage');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            img.style.display = 'block'; // Tampilkan gambar setelah diunggah
        };
        reader.readAsDataURL(file);
    } else {
        img.src = '';
        img.style.display = 'none'; // Sembunyikan gambar jika tidak ada file
    }
}

// Melakukan prediksi penyakit
async function predictDisease() {
    if (!model) {
        alert('Model is not loaded yet. Please wait.');
        return;
    }

    const imageElement = document.getElementById('uploadedImage');
    const fileInput = document.getElementById('imageUpload');

    if (!fileInput.files || !fileInput.files[0]) {
        alert('Please upload an image first.');
        return;
    }

    if (!imageElement.src) {
        alert('Please upload an image first.');
        return;
    }

    const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([256, 256]) // Sesuaikan ukuran dengan model Anda
        .toFloat()
        .expandDims();

    try {
        const predictions = await model.predict(tensor).data();
        const highestIndex = Array.from(predictions).indexOf(Math.max(...predictions));

        const disease = diseaseData[highestIndex]; // Mengambil nama penyakit berdasarkan indeks prediksi
        document.getElementById('result').innerHTML = `Predicted: ${disease.name}`;
    } catch (error) {
        console.error('Prediction error:', error);
        alert('Failed to predict disease.');
    }
}

// Mulai memuat model saat halaman dimuat
loadModel();
document.getElementById('predictButton').disabled = true; // Nonaktifkan tombol sampai model dimuat