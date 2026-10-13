/* =====================================================================
   TEMPLATE PAKET SOAL
   ---------------------------------------------------------------------
   CARA MEMBUAT TOPIK BARU
   1. Salin file ini, beri nama sesuai topik, misalnya soal/sains.js
   2. Ubah id, nama, deskripsi, dan ikon di bawah (id harus unik, tanpa spasi).
   3. Ganti isi soal. Tiap tingkat WAJIB punya minimal 5 soal.
      Kalau punya lebih dari 5, game memilih 5 secara acak tiap permainan.
   4. Daftarkan file di index.html, sebelum baris <script src="game.js">:
        <script src="soal/sains.js"></script>
   5. Muat ulang halaman. Topik baru muncul di pop-up "Topik soal".

   ATURAN SETIAP SOAL
   - question      : teks pertanyaan.
   - options       : tepat 4 pilihan. Urutan tidak penting, game mengacaknya.
   - correctAnswer : nomor jawaban benar di dalam options, mulai dari 0.
                     0 = pilihan pertama, 1 = kedua, 2 = ketiga, 3 = keempat.
   - explanation   : penjelasan yang tampil setelah menjawab (boleh dikosongkan).
   - Pakai tanda kutip tunggal ' '. Kalau teks memuat tanda ', tulis \' atau
     pakai tanda kutip ganda " " untuk teks itu.
   - Jangan lupa koma di antara soal, dan tanda kurung tutup ] dan }.

   Soal yang salah format dilewati. Alasannya tampil di Console browser
   (F12), dan topik yang belum lengkap tampil terkunci di pop-up.
   ===================================================================== */
window.PAKET_SOAL = window.PAKET_SOAL || [];     // baris ini jangan diubah
window.PAKET_SOAL.push({
  id: 'contoh',                                  // unik, huruf kecil tanpa spasi
  nama: 'Nama Topik',                            // tampil di menu dan pop-up
  deskripsi: 'Satu kalimat tentang isi topik ini.',
  ikon: '⭐',                                    // emoji atau 1 huruf (boleh dihapus)
  soal: {
    // ===== TINGKAT MUDAH — dipakai untuk soal 1–5 =====
    mudah: [
      {
        question: 'Tulis pertanyaan mudah nomor 1 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan mudah nomor 2 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan mudah nomor 3 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan mudah nomor 4 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan mudah nomor 5 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      }
    ],

    // ===== TINGKAT SEDANG — dipakai untuk soal 6–10 =====
    sedang: [
      {
        question: 'Tulis pertanyaan sedang nomor 1 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sedang nomor 2 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sedang nomor 3 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sedang nomor 4 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sedang nomor 5 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      }
    ],

    // ===== TINGKAT SANGAT SULIT — dipakai untuk soal 11–15 =====
    sangatSulit: [
      {
        question: 'Tulis pertanyaan sangat sulit nomor 1 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sangat sulit nomor 2 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sangat sulit nomor 3 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sangat sulit nomor 4 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      },
      {
        question: 'Tulis pertanyaan sangat sulit nomor 5 di sini.',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswer: 0,
        explanation: 'Tulis penjelasan jawaban yang benar di sini.'
      }
    ]
  }
});
