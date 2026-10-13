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
  id: 'pumum',                                  // unik, huruf kecil tanpa spasi
  nama: 'Pengetahuan Umum',                            // tampil di menu dan pop-up
  deskripsi: 'Soal Pengetahuan Umum Tingkat SD.',
  ikon: '🌎',                                    // emoji atau 1 huruf (boleh dihapus)
  soal: {
    // ===== TINGKAT MUDAH — 20 SOAL =====
    mudah: [
      {
        question: 'Apa nama planet tempat manusia tinggal?',
        options: ['Mars', 'Bumi', 'Jupiter', 'Venus'],
        correctAnswer: 1,
        explanation: 'Bumi adalah planet tempat manusia, hewan, dan tumbuhan hidup. Bumi memiliki air, udara, dan kondisi yang mendukung kehidupan.'
      },
      {
        question: 'Berapa jumlah hari dalam satu minggu?',
        options: ['5 hari', '6 hari', '7 hari', '8 hari'],
        correctAnswer: 2,
        explanation: 'Satu minggu terdiri atas tujuh hari, yaitu Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, dan Minggu.'
      },
      {
        question: 'Hewan apakah yang sering dijuluki raja hutan?',
        options: ['Harimau', 'Gajah', 'Singa', 'Serigala'],
        correctAnswer: 2,
        explanation: 'Singa sering dijuluki raja hutan karena kekuatan dan kedudukannya sebagai predator. Singa umumnya hidup di padang rumput dan sabana.'
      },
      {
        question: 'Apa warna bendera Indonesia?',
        options: ['Merah dan putih', 'Merah dan biru', 'Putih dan hijau', 'Kuning dan merah'],
        correctAnswer: 0,
        explanation: 'Bendera Indonesia disebut Sang Merah Putih. Warna merah berada di bagian atas dan putih di bagian bawah.'
      },
      {
        question: 'Organ tubuh apa yang berfungsi memompa darah?',
        options: ['Paru-paru', 'Jantung', 'Lambung', 'Ginjal'],
        correctAnswer: 1,
        explanation: 'Jantung memompa darah ke seluruh tubuh untuk mengantarkan oksigen dan zat gizi.'
      },
      {
        question: 'Apa nama satelit alami Bumi?',
        options: ['Matahari', 'Mars', 'Bulan', 'Venus'],
        correctAnswer: 2,
        explanation: 'Bulan merupakan satelit alami Bumi. Bulan tampak bercahaya karena memantulkan cahaya Matahari.'
      },
      {
        question: 'Alat apakah yang digunakan untuk menunjukkan arah mata angin?',
        options: ['Termometer', 'Kompas', 'Stopwatch', 'Mikroskop'],
        correctAnswer: 1,
        explanation: 'Kompas memiliki jarum magnet yang membantu menunjukkan arah utara dan menentukan arah lainnya.'
      },
      {
        question: 'Hewan mamalia apakah yang umum dipelihara untuk menghasilkan susu?',
        options: ['Ayam', 'Ikan lele', 'Sapi', 'Bebek'],
        correctAnswer: 2,
        explanation: 'Sapi merupakan mamalia yang menghasilkan susu untuk anaknya. Susu sapi juga dapat dimanfaatkan manusia sebagai bahan pangan.'
      },
      {
        question: 'Apa nama dasar negara Indonesia?',
        options: ['Pancasila', 'Proklamasi', 'Sumpah Pemuda', 'Bhinneka Tunggal Ika'],
        correctAnswer: 0,
        explanation: 'Pancasila terdiri atas lima sila yang menjadi dasar negara dan pedoman kehidupan berbangsa di Indonesia.'
      },
      {
        question: 'Apa nama proses tumbuhan membuat makanan dengan bantuan cahaya Matahari?',
        options: ['Respirasi', 'Fotosintesis', 'Evaporasi', 'Fermentasi'],
        correctAnswer: 1,
        explanation: 'Dalam fotosintesis, tumbuhan menggunakan cahaya Matahari, air, dan karbon dioksida untuk menghasilkan gula serta melepaskan oksigen.'
      },
      {
        question: 'Apa ibu kota Indonesia yang saat ini masih menjalankan fungsi sebagai ibu kota negara?',
        options: ['Bandung', 'Surabaya', 'Jakarta', 'Semarang'],
        correctAnswer: 2,
        explanation: 'Jakarta masih menjalankan fungsi sebagai ibu kota negara selama proses pemindahan ke Ibu Kota Nusantara berlangsung sesuai ketentuan yang berlaku.'
      },
      {
        question: 'Berapa jumlah kaki laba-laba?',
        options: ['4', '6', '8', '10'],
        correctAnswer: 2,
        explanation: 'Laba-laba memiliki delapan kaki atau empat pasang kaki. Laba-laba termasuk kelompok arachnida, bukan serangga.'
      },
      {
        question: 'Apa nama samudra terluas di dunia?',
        options: ['Samudra Hindia', 'Samudra Pasifik', 'Samudra Arktik', 'Samudra Atlantik'],
        correctAnswer: 1,
        explanation: 'Samudra Pasifik merupakan samudra terluas di Bumi dan membentang di antara Asia, Australia, serta benua Amerika.'
      },
      {
        question: 'Alat indra apakah yang digunakan untuk mendengar?',
        options: ['Mata', 'Hidung', 'Telinga', 'Lidah'],
        correctAnswer: 2,
        explanation: 'Telinga menerima gelombang suara dan juga membantu tubuh menjaga keseimbangan.'
      },
      {
        question: 'Apa nama mata uang resmi Indonesia?',
        options: ['Ringgit', 'Rupiah', 'Baht', 'Yen'],
        correctAnswer: 1,
        explanation: 'Rupiah adalah mata uang resmi Indonesia dengan kode mata uang IDR.'
      },
      {
        question: 'Hewan apakah yang mengalami perubahan dari ulat menjadi kupu-kupu?',
        options: ['Kupu-kupu', 'Kucing', 'Kambing', 'Burung'],
        correctAnswer: 0,
        explanation: 'Kupu-kupu mengalami metamorfosis sempurna melalui empat tahap: telur, ulat, kepompong, dan kupu-kupu dewasa.'
      },
      {
        question: 'Apa nama kitab suci umat Islam?',
        options: ['Weda', 'Tripitaka', 'Al-Quran', 'Injil'],
        correctAnswer: 2,
        explanation: 'Al-Quran merupakan kitab suci umat Islam yang diyakini sebagai wahyu Allah kepada Nabi Muhammad saw.'
      },
      {
        question: 'Apa nama rumah adat yang berasal dari Sumatra Barat?',
        options: ['Rumah Gadang', 'Rumah Joglo', 'Rumah Honai', 'Rumah Tongkonan'],
        correctAnswer: 0,
        explanation: 'Rumah Gadang merupakan rumah adat masyarakat Minangkabau yang terkenal dengan bentuk atap melengkung menyerupai tanduk kerbau.'
      },
      {
        question: 'Gas apakah yang dibutuhkan tubuh manusia untuk respirasi sel?',
        options: ['Oksigen', 'Nitrogen', 'Helium', 'Hidrogen'],
        correctAnswer: 0,
        explanation: 'Tubuh menggunakan oksigen dalam proses respirasi sel untuk membantu menghasilkan energi dari zat makanan.'
      },
      {
        question: 'Berapa jumlah sila dalam Pancasila?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 2,
        explanation: 'Pancasila memiliki lima sila yang mencakup nilai ketuhanan, kemanusiaan, persatuan, demokrasi, dan keadilan sosial.'
      }
    ],

    // ===== TINGKAT SEDANG — 20 SOAL =====
    sedang: [
      {
        question: 'Mengapa Indonesia memiliki dua musim utama, yaitu musim hujan dan kemarau?',
        options: [
          'Karena berada di dekat Kutub Utara',
          'Karena beriklim tropis dan dipengaruhi pola angin muson',
          'Karena seluruh wilayahnya berupa pulau kecil',
          'Karena Indonesia tidak memiliki pegunungan'
        ],
        correctAnswer: 1,
        explanation: 'Indonesia berada di wilayah tropis. Pergantian angin muson yang membawa banyak atau sedikit uap air ikut memengaruhi pergantian musim hujan dan kemarau.'
      },
      {
        question: 'Candi Borobudur merupakan peninggalan sejarah yang berkaitan dengan agama apa?',
        options: ['Hindu', 'Buddha', 'Islam', 'Konghucu'],
        correctAnswer: 1,
        explanation: 'Borobudur merupakan monumen Buddha yang dibangun pada masa Dinasti Syailendra di Jawa Tengah.'
      },
      {
        question: 'Apa fungsi utama akar tumbuhan?',
        options: [
          'Menangkap cahaya Matahari',
          'Menghasilkan bunga',
          'Menyerap air dan mineral dari tanah',
          'Menghasilkan biji secara langsung'
        ],
        correctAnswer: 2,
        explanation: 'Akar membantu menambatkan tumbuhan ke tanah serta menyerap air dan mineral yang diperlukan untuk pertumbuhan.'
      },
      {
        question: 'Sebuah peta memiliki skala 1 : 100.000. Jika jarak pada peta 5 cm, berapa jarak sebenarnya?',
        options: ['500 meter', '1 kilometer', '5 kilometer', '50 kilometer'],
        correctAnswer: 2,
        explanation: 'Skala 1 : 100.000 berarti 1 cm pada peta mewakili 100.000 cm di lapangan. Jadi, 5 cm mewakili 500.000 cm atau 5 km.'
      },
      {
        question: 'Apa nama garis khayal yang membagi Bumi menjadi belahan utara dan selatan?',
        options: ['Garis bujur utama', 'Garis khatulistiwa', 'Garis tanggal internasional', 'Garis balik utara'],
        correctAnswer: 1,
        explanation: 'Garis khatulistiwa atau ekuator berada pada lintang 0 derajat dan membagi Bumi menjadi belahan utara serta selatan.'
      },
      {
        question: 'Siapa tokoh yang dikenal sebagai Bapak Pendidikan Nasional Indonesia?',
        options: ['Mohammad Hatta', 'Ki Hajar Dewantara', 'Jenderal Sudirman', 'R.A. Kartini'],
        correctAnswer: 1,
        explanation: 'Ki Hajar Dewantara berperan besar dalam perkembangan pendidikan nasional dan mendirikan Perguruan Taman Siswa pada tahun 1922.'
      },
      {
        question: 'Perubahan wujud dari gas menjadi cair disebut apa?',
        options: ['Menguap', 'Membeku', 'Mengembun', 'Menyublim'],
        correctAnswer: 2,
        explanation: 'Pengembunan terjadi ketika gas kehilangan energi panas dan berubah menjadi cair, seperti uap air yang membentuk titik air pada gelas dingin.'
      },
      {
        question: 'Negara ASEAN manakah yang tidak memiliki wilayah laut?',
        options: ['Thailand', 'Vietnam', 'Laos', 'Filipina'],
        correctAnswer: 2,
        explanation: 'Laos merupakan negara yang terkurung daratan atau landlocked. Negara ini tidak memiliki garis pantai yang berbatasan langsung dengan laut.'
      },
      {
        question: 'Mengapa terjadi siang dan malam di Bumi?',
        options: [
          'Bumi mengelilingi Bulan',
          'Bumi berotasi pada porosnya',
          'Matahari mengelilingi Bumi setiap hari',
          'Bulan menutupi Matahari setiap malam'
        ],
        correctAnswer: 1,
        explanation: 'Bumi berotasi pada porosnya. Bagian yang menghadap Matahari mengalami siang, sedangkan bagian yang membelakanginya mengalami malam.'
      },
      {
        question: 'Alat apakah yang digunakan untuk mengukur suhu?',
        options: ['Barometer', 'Termometer', 'Higrometer', 'Anemometer'],
        correctAnswer: 1,
        explanation: 'Termometer mengukur suhu. Barometer mengukur tekanan udara, higrometer mengukur kelembapan, sedangkan anemometer mengukur kecepatan angin.'
      },
      {
        question: 'Siapakah yang membacakan teks Proklamasi Kemerdekaan Indonesia pada 17 Agustus 1945?',
        options: ['Mohammad Yamin', 'Soekarno', 'Ki Hajar Dewantara', 'Jenderal Sudirman'],
        correctAnswer: 1,
        explanation: 'Soekarno membacakan teks Proklamasi Kemerdekaan Indonesia didampingi Mohammad Hatta di Jakarta pada 17 Agustus 1945.'
      },
      {
        question: 'Apa fungsi utama sel darah merah?',
        options: [
          'Melawan semua bakteri secara langsung',
          'Membawa oksigen ke jaringan tubuh',
          'Menghasilkan hormon pencernaan',
          'Menghancurkan tulang yang rusak'
        ],
        correctAnswer: 1,
        explanation: 'Sel darah merah mengandung hemoglobin yang mengikat oksigen dari paru-paru dan mengantarkannya ke berbagai jaringan tubuh.'
      },
      {
        question: 'Apa nama proses air menguap, membentuk awan, lalu turun kembali sebagai hujan?',
        options: ['Daur batuan', 'Daur karbon', 'Daur air', 'Daur hidup'],
        correctAnswer: 2,
        explanation: 'Daur air melibatkan penguapan, pengembunan, presipitasi seperti hujan, serta aliran dan peresapan air kembali ke lingkungan.'
      },
      {
        question: 'Apa nama tarian tradisional dari Aceh yang terkenal dengan gerakan serempak?',
        options: ['Tari Piring', 'Tari Saman', 'Tari Kecak', 'Tari Jaipong'],
        correctAnswer: 1,
        explanation: 'Tari Saman berasal dari masyarakat Gayo di Aceh dan dikenal melalui gerakan tangan, tubuh, serta tepukan yang terkoordinasi.'
      },
      {
        question: 'Lapisan atmosfer manakah tempat sebagian besar fenomena cuaca berlangsung?',
        options: ['Eksosfer', 'Termosfer', 'Stratosfer', 'Troposfer'],
        correctAnswer: 3,
        explanation: 'Troposfer adalah lapisan atmosfer paling bawah. Sebagian besar awan, hujan, dan perubahan cuaca terjadi di lapisan ini.'
      },
      {
        question: 'Apa nama organisasi regional yang dibentuk oleh negara-negara Asia Tenggara?',
        options: ['NATO', 'ASEAN', 'Uni Eropa', 'OPEC'],
        correctAnswer: 1,
        explanation: 'ASEAN adalah organisasi kerja sama negara-negara Asia Tenggara di bidang ekonomi, sosial, budaya, politik, dan keamanan.'
      },
      {
        question: 'Bahan apakah yang diperlukan dalam pembakaran selain bahan bakar dan panas?',
        options: ['Oksigen', 'Helium', 'Neon', 'Argon'],
        correctAnswer: 0,
        explanation: 'Api membutuhkan bahan bakar, oksigen, dan panas. Ketiganya dikenal sebagai unsur segitiga api.'
      },
      {
        question: 'Apa nama kompleks candi Hindu yang terkenal di Yogyakarta dan Jawa Tengah?',
        options: ['Borobudur', 'Prambanan', 'Muara Takus', 'Bahal'],
        correctAnswer: 1,
        explanation: 'Kompleks Candi Prambanan merupakan kompleks candi Hindu yang terkenal dengan bangunan untuk Trimurti, yaitu Siwa, Wisnu, dan Brahma.'
      },
      {
        question: 'Apa fungsi utama paru-paru manusia?',
        options: [
          'Memompa darah',
          'Menyaring urine',
          'Melakukan pertukaran oksigen dan karbon dioksida',
          'Mencerna protein'
        ],
        correctAnswer: 2,
        explanation: 'Di alveolus paru-paru terjadi pertukaran gas. Oksigen masuk ke darah, sedangkan karbon dioksida dikeluarkan melalui pernapasan.'
      },
      {
        question: 'Mengapa waktu setempat di wilayah timur Greenwich secara umum lebih maju daripada di Greenwich?',
        options: [
          'Karena Bumi berotasi dari timur ke barat',
          'Karena Bumi berotasi dari barat ke timur',
          'Karena Matahari mengelilingi Bumi',
          'Karena Bulan menentukan semua zona waktu'
        ],
        correctAnswer: 1,
        explanation: 'Bumi berotasi dari barat ke timur sehingga Matahari tampak terbit lebih dahulu di wilayah timur. Karena itu, waktu sipil di wilayah timur umumnya lebih maju daripada di Greenwich.'
      }
    ],

    // ===== TINGKAT SANGAT SULIT — 20 SOAL =====
    sangatSulit: [
      {
        question: 'Sebuah peta memiliki skala 1 : 250.000. Jarak dua kota pada peta adalah 8 cm. Berapa jarak sebenarnya?',
        options: ['2 km', '8 km', '20 km', '200 km'],
        correctAnswer: 2,
        explanation: 'Jarak sebenarnya adalah 8 x 250.000 = 2.000.000 cm. Jika dikonversi menjadi kilometer, hasilnya 20 km.'
      },
      {
        question: 'Mengapa astronot di Stasiun Luar Angkasa Internasional tampak melayang?',
        options: [
          'Karena tidak ada gravitasi sama sekali',
          'Karena stasiun dan astronot berada dalam keadaan jatuh bebas mengelilingi Bumi',
          'Karena tubuh astronot tidak memiliki massa',
          'Karena udara di stasiun sangat tebal'
        ],
        correctAnswer: 1,
        explanation: 'Gravitasi Bumi masih bekerja di orbit. Astronot dan stasiun sama-sama terus jatuh bebas mengelilingi Bumi sehingga astronot tampak melayang relatif terhadap stasiun.'
      },
      {
        question: 'Mengapa gerhana Matahari tidak terjadi setiap bulan baru?',
        options: [
          'Bulan tidak memiliki gravitasi',
          'Matahari hanya bersinar pada siang hari',
          'Bidang orbit Bulan miring terhadap bidang orbit Bumi mengelilingi Matahari',
          'Bumi berhenti berotasi saat bulan baru'
        ],
        correctAnswer: 2,
        explanation: 'Orbit Bulan miring sekitar 5 derajat terhadap bidang orbit Bumi. Akibatnya, saat bulan baru, Matahari, Bulan, dan Bumi biasanya tidak segaris sempurna sehingga gerhana tidak selalu terjadi.'
      },
      {
        question: 'Dalam rantai makanan, rumput dimakan belalang, belalang dimakan katak, dan katak dimakan ular. Jika populasi katak menurun drastis, apa yang paling mungkin terjadi dalam jangka pendek?',
        options: [
          'Belalang cenderung meningkat dan ular kehilangan salah satu sumber makanan',
          'Rumput pasti langsung punah',
          'Belalang langsung menghilang',
          'Semua populasi pasti tetap sama'
        ],
        correctAnswer: 0,
        explanation: 'Berkurangnya katak dapat membuat tekanan pemangsaan terhadap belalang menurun. Ular juga dapat kehilangan sebagian sumber makanannya. Dampak nyata bergantung pada kondisi ekosistem.'
      },
      {
        question: 'Jika Bumi tidak memiliki atmosfer, fenomena apa yang kemungkinan besar terjadi?',
        options: [
          'Langit tetap biru seperti sekarang',
          'Suara merambat seperti biasa melalui udara',
          'Langit tampak hitam dan perubahan suhu permukaan menjadi jauh lebih ekstrem',
          'Air laut tidak dapat membeku'
        ],
        correctAnswer: 2,
        explanation: 'Tanpa atmosfer, tidak ada hamburan cahaya Matahari yang membuat langit tampak biru. Atmosfer juga membantu mengatur suhu permukaan dan menjadi medium perambatan suara melalui udara.'
      },
      {
        question: 'Mengapa wilayah sekitar khatulistiwa umumnya menerima energi Matahari lebih besar per satuan luas sepanjang tahun dibandingkan wilayah kutub?',
        options: [
          'Karena Matahari lebih dekat ke khatulistiwa',
          'Karena sinar Matahari datang lebih tegak sehingga energinya terkonsentrasi pada area yang lebih kecil',
          'Karena wilayah khatulistiwa tidak mengalami malam',
          'Karena wilayah kutub tidak menerima cahaya Matahari sepanjang tahun'
        ],
        correctAnswer: 1,
        explanation: 'Sinar yang datang lebih tegak menyebarkan energi pada permukaan yang relatif lebih kecil. Di wilayah kutub, sinar datang lebih miring dan melewati atmosfer dengan lintasan lebih panjang.'
      },
      {
        question: 'Unsur kimia memiliki nomor atom 8. Unsur apakah itu?',
        options: ['Nitrogen', 'Karbon', 'Oksigen', 'Neon'],
        correctAnswer: 2,
        explanation: 'Nomor atom menunjukkan jumlah proton dalam inti atom. Oksigen memiliki 8 proton, karbon 6, nitrogen 7, dan neon 10.'
      },
      {
        question: 'Mengapa pelestarian hutan di daerah hulu sungai dapat membantu mengurangi risiko banjir di daerah hilir?',
        options: [
          'Hutan menghentikan seluruh hujan',
          'Akar dan tanah hutan membantu air meresap serta mengurangi limpasan permukaan',
          'Hutan mengubah air menjadi oksigen',
          'Pohon membuat semua sungai menjadi lebih pendek'
        ],
        correctAnswer: 1,
        explanation: 'Vegetasi dan tanah yang sehat dapat meningkatkan infiltrasi, memperlambat aliran permukaan, dan mengurangi erosi. Namun, hutan tidak menjamin banjir tidak terjadi saat hujan ekstrem.'
      },
      {
        question: 'Perhatikan urutan angka berikut: 2, 6, 12, 20, 30, ... Angka selanjutnya adalah ...',
        options: ['36', '40', '42', '48'],
        correctAnswer: 2,
        explanation: 'Selisih antarang ka berturut-turut adalah 4, 6, 8, dan 10. Selisih berikutnya 12, sehingga 30 + 12 = 42. Polanya juga berupa n x (n + 1).'
      },
      {
        question: 'Mengapa Indonesia rawan mengalami gempa bumi dan aktivitas gunung api?',
        options: [
          'Karena Indonesia terletak di tengah satu lempeng yang stabil',
          'Karena Indonesia berada di pertemuan beberapa lempeng tektonik aktif',
          'Karena Indonesia tidak memiliki laut dalam',
          'Karena angin muson menggerakkan kerak Bumi'
        ],
        correctAnswer: 1,
        explanation: 'Indonesia berada di kawasan pertemuan lempeng Indo-Australia, Eurasia, Pasifik, dan lempeng terkait lainnya. Pergerakan lempeng menyebabkan gempa bumi serta mendukung pembentukan gunung api.'
      },
      {
        question: 'Mengapa permukaan Bulan memiliki banyak kawah yang bertahan sangat lama?',
        options: [
          'Karena Bulan memiliki atmosfer yang sangat tebal',
          'Karena Bulan memiliki hujan lebat setiap hari',
          'Karena Bulan hampir tidak memiliki atmosfer, cuaca, dan erosi seperti di Bumi',
          'Karena permukaan Bulan terbuat dari air'
        ],
        correctAnswer: 2,
        explanation: 'Bulan hampir tidak memiliki atmosfer padat yang dapat menghasilkan cuaca dan erosi seperti di Bumi. Karena itu, banyak kawah akibat tumbukan benda langit bertahan selama waktu yang sangat lama.'
      },
      {
        question: 'Sebuah benda memiliki massa 2 kg. Berapa beratnya di Bumi jika percepatan gravitasi dianggap 10 m/s²?',
        options: ['2 newton', '5 newton', '20 newton', '200 newton'],
        correctAnswer: 2,
        explanation: 'Berat dihitung dengan rumus W = m x g. Jadi, W = 2 x 10 = 20 newton. Massa diukur dalam kilogram, sedangkan berat merupakan gaya yang diukur dalam newton.'
      },
      {
        question: 'Mengapa fosil organisme laut dapat ditemukan di daerah pegunungan?',
        options: [
          'Semua organisme laut dapat terbang ke puncak gunung',
          'Daerah tersebut mungkin dahulu merupakan dasar laut yang kemudian terangkat akibat proses geologi',
          'Fosil terbentuk hanya dari salju',
          'Air laut selalu mengalir menuju puncak gunung'
        ],
        correctAnswer: 1,
        explanation: 'Gerakan lempeng tektonik dapat mengangkat lapisan batuan yang dahulu terbentuk di dasar laut. Setelah jutaan tahun, batuan beserta fosilnya dapat berada di wilayah pegunungan.'
      },
      {
        question: 'Apa yang terjadi pada frekuensi bunyi yang didengar ketika sumber bunyi mendekati pendengar menurut efek Doppler?',
        options: [
          'Frekuensi terdengar lebih tinggi',
          'Frekuensi selalu menjadi nol',
          'Frekuensi terdengar lebih rendah',
          'Bunyi pasti tidak terdengar'
        ],
        correctAnswer: 0,
        explanation: 'Ketika sumber bunyi mendekat, gelombang tiba dengan jarak waktu lebih rapat sehingga frekuensi yang didengar meningkat. Ketika sumber menjauh, frekuensi yang terdengar menurun.'
      },
      {
        question: 'Mengapa planet-planet tetap mengelilingi Matahari?',
        options: [
          'Karena Matahari mendorong semua planet dengan angin',
          'Karena gaya gravitasi Matahari membelokkan gerak planet menjadi orbit',
          'Karena planet tidak memiliki kecepatan',
          'Karena planet menempel pada cahaya Matahari'
        ],
        correctAnswer: 1,
        explanation: 'Gravitasi Matahari menarik planet, sedangkan kecepatan gerak planet membuatnya terus bergerak maju. Gabungan keduanya menghasilkan lintasan orbit.'
      },
      {
        question: 'Mengapa pergerakan lempeng tektonik dapat menyebabkan tsunami?',
        options: [
          'Karena setiap gempa pasti menyebabkan tsunami',
          'Karena gempa bawah laut tertentu dapat menggeser dasar laut secara tiba-tiba dan memindahkan sejumlah besar air',
          'Karena tsunami hanya disebabkan angin kencang',
          'Karena semua gunung api berada di tengah laut'
        ],
        correctAnswer: 1,
        explanation: 'Gempa bawah laut yang mengangkat atau menurunkan dasar laut secara mendadak dapat menghasilkan gelombang tsunami. Tidak semua gempa bawah laut menyebabkan tsunami.'
      },
      {
        question: 'Sebuah wilayah mengalami pertumbuhan penduduk tinggi, tetapi lapangan kerja tidak bertambah. Masalah apa yang paling mungkin muncul?',
        options: [
          'Pengangguran meningkat',
          'Kebutuhan sekolah menghilang',
          'Semua harga pasti turun',
          'Jumlah penduduk langsung menjadi nol'
        ],
        correctAnswer: 0,
        explanation: 'Jika pertambahan penduduk usia kerja tidak diimbangi penciptaan lapangan kerja, persaingan memperoleh pekerjaan dapat meningkat dan pengangguran berpotensi bertambah.'
      },
      {
        question: 'Mengapa kalender Masehi memiliki tahun kabisat?',
        options: [
          'Agar setiap tahun selalu terdiri atas 360 hari',
          'Untuk menyesuaikan kalender dengan lama revolusi Bumi yang sekitar 365,24 hari',
          'Karena Bumi berhenti berputar setiap empat tahun',
          'Agar bulan Februari selalu memiliki 30 hari'
        ],
        correctAnswer: 1,
        explanation: 'Tahun kabisat membantu menyelaraskan kalender dengan tahun tropis. Umumnya tahun yang habis dibagi 4 adalah kabisat, tetapi tahun abad harus habis dibagi 400 agar termasuk tahun kabisat.'
      },
      {
        question: 'Dalam suatu ekosistem, jamur dan bakteri menguraikan daun yang gugur. Apa peran utama organisme tersebut?',
        options: ['Produsen', 'Konsumen puncak', 'Pengurai', 'Predator utama'],
        correctAnswer: 2,
        explanation: 'Pengurai memecah sisa organisme menjadi zat yang lebih sederhana sehingga unsur hara kembali ke lingkungan dan dapat dimanfaatkan tumbuhan.'
      },
      {
        question: 'Mengapa durasi siang dan malam berbeda sepanjang tahun di banyak wilayah Bumi?',
        options: [
          'Karena Matahari berubah ukuran setiap hari',
          'Karena sumbu rotasi Bumi miring terhadap bidang orbitnya dan Bumi mengelilingi Matahari',
          'Karena Bulan menutupi Matahari setiap enam bulan',
          'Karena Bumi berhenti berotasi saat musim dingin'
        ],
        correctAnswer: 1,
        explanation: 'Kemiringan sumbu Bumi sekitar 23,5 derajat menyebabkan setiap belahan Bumi menerima penyinaran berbeda sepanjang tahun. Hal ini membuat durasi siang dan malam berubah menurut musim dan garis lintang.'
      }
    ]
  }
});
