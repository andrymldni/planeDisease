// Tambahkan event listener untuk pengunggahan gambar dan tombol prediksi
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('predictButton').addEventListener('click', predictDisease);

let model; // Variabel untuk menyimpan model TensorFlow
const diseaseData = [
    { 
        name: 'Bacterial',
        symptoms: [
            "Bercak daun berwarna coklat, hitam, atau kuning dengan tepi tidak teratur.",
            "Busuk pada akar, batang, atau buah.",
            "Exudat bakteri berupa cairan kental atau lendir.",
            "Kerdil dan pertumbuhan tidak normal.",
            "Klorosis (daun menguning).",
        ],
        treatment: [
            "Identifikasi Tanaman yang Terinfeksi.",
            "Cabut dan Musnahkan Tanaman yang Terinfeksi.",
            "Aplikasi Bakterisida.",
            "Pemantauan dan Perawatan Lanjutan.",
            "Pengelolaan Linkungan Tanaman."
        ]
    },
    { 
        name: 'Fungal',
        symptoms: [
            "Bercak daun berwarna coklat atau hitam.",
            "Lapisan tepung putih pada daun (embun tepung).",
            "Busuk pada akar, batang, atau buah.",
            "Pertumbuhan jamur berbentuk bulu atau kapas.",
            "Necrosis (jaringan mati).",
        ],
        treatment: [
            "Aplikasi fungisida.",
            "Rotasi tanaman.",
            "Sanitasi alat pertanian.",
            "Penggunaan varietas tahan jamur.",
            "pengaturan Waktu dan Jarak Tanam."
        ]
    },
    { 
        name: 'Hama',
        symptoms: [
            "Gigitan atau lubang pada daun dan buah.",
            "Daun menguning atau rontok.",
            "Kerusakan pada akar.",
            "Daun menggulung atau melengkung.",
            "Adanya eksudat madu dan jamur jelaga.",
        ],
        treatment: [
            "Pengendalian secara mekanis.",
            "Pengendalian biologis dengan musuh alami.",
            "Aplikasi insektisida.",
            "Sanitasi kebun.",
            "Penggunaan Varietas Tahan dan Seed Treatment."
        ]
    },
    { 
        name: 'Healthy',
        symptoms: ["Tanaman tampak sehat tanpa gejala penyakit atau hama."],
        treatment: [
            "Pemupukan dan penyiraman yang cukup.",
            "Perawatan rutin dan pemantauan secara berkala untuk mencegah serangan penyakit atau hama.",
            "Rotasi tanaman untuk mencegah penumpukan patogen di dalam tanah."
        ]
    },
    { 
        name: 'Virus',
        symptoms: [
            "Mosaik dan mottle pada daun.",
            "Klorosis (daun menguning).",
            "Distorsi daun.",
            "Stunting (kererdilan).",
            "Bintik nekrotik.",
        ],
        treatment: [
            "Penggunaan bibit sehat.",
            "Pengendalian vektor penular.",
            "Pemusnahan tanaman yang terinfeksi.",
            "Rotasi tanaman.",
            "Pengelolaan Tanaman yang Terinfeksi."

        ]
    }
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

// Menampilkan pop-up dengan ciri-ciri dan penanganan
function showPopup(disease) {
    let symptomsList = disease.symptoms.map(symptom => `<li>${symptom}</li>`).join('');
    let treatmentList = disease.treatment.map(treat => `<li>${treat}</li>`).join('');
    let popupContent = `
        <div class="popup-content">
            <h2>${disease.name} Disease</h2>
            <h3>Ciri-ciri:</h3>
            <ul>${symptomsList}</ul>
            <h3>Treatment:</h3>
            <ul>${treatmentList}</ul>
            <button class="close-button" onclick="closePopup()">Close</button>
        </div>
    `;
    let popup = document.createElement('div');
    popup.id = 'popup';
    popup.innerHTML = popupContent;
    document.body.appendChild(popup);
}

// Menutup pop-up
function closePopup() {
    let popup = document.getElementById('popup');
    if (popup) {
        popup.remove();
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
        showPopup(disease); // Tampilkan pop-up setelah prediksi
    } catch (error) {
        console.error('Prediction error:', error);
        alert('Failed to predict disease.');
    }
}

// Mulai memuat model saat halaman dimuat
loadModel();
document.getElementById('predictButton').disabled = true; // Nonaktifkan tombol sampai model dimuat
