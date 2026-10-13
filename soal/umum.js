/* =====================================================================
   PAKET SOAL: Pengetahuan Umum (tingkat SD)
   Soal lama game dipindah ke sini. Cara membuat paket baru: salin
   soal/_template.js, ubah isinya, lalu daftarkan di index.html.
   ===================================================================== */
window.PAKET_SOAL = window.PAKET_SOAL || [];
window.PAKET_SOAL.push({
  id: 'umum',
  nama: 'Pengetahuan Umum',
  deskripsi: 'Matematika, sains, sejarah, dan budaya tingkat SD.',
  ikon: '🌏',
  soal: {
    // ===== TINGKAT MUDAH — dipakai untuk soal 1–5 (minimal 5 soal) =====
    mudah: [
      {
        question: 'Berapa hasil dari 7 + 8?',
        options: ['14', '15', '16', '17'],
        correctAnswer: 1,
        explanation: '7 ditambah 8 sama dengan 15.'
      },
      {
        question: 'Hewan manakah yang berkembang biak dengan cara bertelur?',
        options: ['Kucing', 'Sapi', 'Ayam', 'Kelinci'],
        correctAnswer: 2,
        explanation: 'Ayam bertelur, lalu telurnya menetas menjadi anak ayam. Kucing, sapi, dan kelinci melahirkan anaknya.'
      },
      {
        question: 'Apa warna bendera negara Indonesia?',
        options: ['Merah dan putih', 'Merah dan kuning', 'Putih dan biru', 'Merah dan hijau'],
        correctAnswer: 0,
        explanation: 'Bendera Indonesia bernama Sang Merah Putih, dengan warna merah di atas dan putih di bawah.'
      },
      {
        question: 'Organ tubuh manakah yang berfungsi untuk bernapas?',
        options: ['Jantung', 'Paru-paru', 'Lambung', 'Ginjal'],
        correctAnswer: 1,
        explanation: 'Paru-paru menyerap oksigen dari udara yang kita hirup dan mengeluarkan karbon dioksida.'
      },
      {
        question: 'Apa lambang sila pertama Pancasila?',
        options: ['Rantai', 'Pohon beringin', 'Bintang', 'Kepala banteng'],
        correctAnswer: 2,
        explanation: 'Sila pertama, "Ketuhanan Yang Maha Esa", berlambang bintang.'
      },
      {
        question: 'Planet tempat manusia tinggal bernama ...',
        options: ['Mars', 'Venus', 'Bumi', 'Jupiter'],
        correctAnswer: 2,
        explanation: 'Manusia tinggal di planet Bumi, planet ketiga dari Matahari.'
      },
      {
        question: 'Bagian tumbuhan yang menyerap air dari dalam tanah adalah ...',
        options: ['Daun', 'Akar', 'Bunga', 'Buah'],
        correctAnswer: 1,
        explanation: 'Akar menyerap air dan zat hara dari dalam tanah, lalu menyalurkannya ke bagian tumbuhan lain.'
      }
    ],

    // ===== TINGKAT SEDANG — dipakai untuk soal 6–10 (minimal 5 soal) =====
    sedang: [
      {
        question: 'Indonesia memproklamasikan kemerdekaan pada tanggal ...',
        options: ['28 Oktober 1928', '10 November 1945', '17 Agustus 1945', '1 Juni 1945'],
        correctAnswer: 2,
        explanation: 'Proklamasi kemerdekaan Indonesia dibacakan pada 17 Agustus 1945.'
      },
      {
        question: 'Gas yang dihasilkan tumbuhan saat berfotosintesis dan dibutuhkan manusia untuk bernapas adalah ...',
        options: ['Karbon dioksida', 'Oksigen', 'Nitrogen', 'Hidrogen'],
        correctAnswer: 1,
        explanation: 'Saat berfotosintesis, tumbuhan menghasilkan oksigen yang kita butuhkan untuk bernapas.'
      },
      {
        question: 'Tari Reog Ponorogo berasal dari provinsi ...',
        options: ['Bali', 'Jawa Timur', 'Sumatra Utara', 'Maluku'],
        correctAnswer: 1,
        explanation: 'Reog Ponorogo berasal dari Kabupaten Ponorogo di Jawa Timur.'
      },
      {
        question: 'Berapa hasil dari 12 × 6?',
        options: ['66', '72', '76', '82'],
        correctAnswer: 1,
        explanation: '12 dikali 6 sama dengan 72.'
      },
      {
        question: 'Perubahan wujud benda cair menjadi gas disebut ...',
        options: ['Membeku', 'Mencair', 'Menguap', 'Mengembun'],
        correctAnswer: 2,
        explanation: 'Menguap adalah perubahan dari cair menjadi gas, misalnya air yang dipanaskan menjadi uap air.'
      },
      {
        question: 'Hewan pemakan tumbuhan disebut ...',
        options: ['Karnivora', 'Herbivora', 'Omnivora', 'Insektivora'],
        correctAnswer: 1,
        explanation: 'Herbivora adalah hewan pemakan tumbuhan, contohnya sapi dan kambing.'
      },
      {
        question: 'Apa lawan kata (antonim) dari "rajin"?',
        options: ['Tekun', 'Giat', 'Ulet', 'Malas'],
        correctAnswer: 3,
        explanation: 'Antonim berarti lawan kata. Lawan kata rajin adalah malas.'
      }
    ],

    // ===== TINGKAT SANGAT SULIT — dipakai untuk soal 11–15 (minimal 5 soal) =====
    // Catatan: soal di bawah ini hasil pindahan dari game lama dan tingkatnya baru "menengah SD".
    // Ganti dengan soal yang benar-benar sulit jika ingin.
    sangatSulit: [
      {
        question: 'Planet terbesar di tata surya adalah ...',
        options: ['Saturnus', 'Jupiter', 'Bumi', 'Neptunus'],
        correctAnswer: 1,
        explanation: 'Jupiter adalah planet terbesar di tata surya kita.'
      },
      {
        question: 'Siapakah pencipta lagu "Indonesia Raya"?',
        options: ['Ismail Marzuki', 'Ki Hajar Dewantara', 'W.R. Supratman', 'R.A. Kartini'],
        correctAnswer: 2,
        explanation: 'Lagu "Indonesia Raya" diciptakan oleh Wage Rudolf Supratman.'
      },
      {
        question: 'Hewan manakah yang mengalami metamorfosis sempurna?',
        options: ['Belalang', 'Kupu-kupu', 'Kecoa', 'Capung'],
        correctAnswer: 1,
        explanation: 'Kupu-kupu berubah dari telur, ulat, kepompong, lalu menjadi kupu-kupu dewasa. Itulah metamorfosis sempurna.'
      },
      {
        question: 'Selat yang memisahkan Pulau Jawa dan Pulau Sumatra adalah ...',
        options: ['Selat Bali', 'Selat Malaka', 'Selat Sunda', 'Selat Makassar'],
        correctAnswer: 2,
        explanation: 'Selat Sunda terletak di antara Pulau Jawa dan Pulau Sumatra.'
      },
      {
        question: 'Sebuah persegi panjang memiliki panjang 12 cm dan lebar 5 cm. Berapa luasnya?',
        options: ['17 cm²', '34 cm²', '60 cm²', '120 cm²'],
        correctAnswer: 2,
        explanation: 'Luas persegi panjang = panjang × lebar = 12 × 5 = 60 cm².'
      },
      {
        question: 'Samudra terluas di dunia adalah Samudra ...',
        options: ['Atlantik', 'Hindia', 'Arktik', 'Pasifik'],
        correctAnswer: 3,
        explanation: 'Samudra Pasifik adalah samudra terluas dan terdalam di dunia.'
      }
    ]
  }
});
