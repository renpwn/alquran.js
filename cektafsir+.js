import { sleep } from '../renpwn/lib/Function.js'
import fs from 'fs/promises'
import * as cheerio from 'cheerio'
import axios from 'axios'

// Import fungsi database
import { openDB } from './db.js'

/* =========================
   DAFTAR SURAT
========================= */
const List = [
  ["Al Fatihah", "(Pembuka)", 7],
  ["Al Baqarah", "(Sapi Betina)", 286],
  ["Ali Imran", "(Keluarga Imran)", 200],
  ["An Nisa", "(Wanita)", 176],
  ["Al Ma'idah", "(Jamuan)", 120],
  ["Al An'am", "(Hewan Ternak)", 165],
  ["Al-A'raf", "(Tempat yang Tertinggi)", 206],
  ["Al-Anfal", "(Harta Rampasan Perang)", 75],
  ["At-Taubah", "(Pengampunan)", 129],
  ["Yunus", "(Nabi Yunus)", 109],
  ["Hud", "(Nabi Hud)", 123],
  ["Yusuf", "(Nabi Yusuf)", 111],
  ["Ar-Ra'd", "(Guruh)", 43],
  ["Ibrahim", "(Nabi Ibrahim)", 52],
  ["Al-Hijr", "(Gunung Al Hijr)", 99],
  ["An-Nahl", "(Lebah)", 128],
  ["Al-Isra'", "(Perjalanan Malam)", 111],
  ["Al-Kahf", "(Penghuni-penghuni Gua)", 110],
  ["Maryam", "(Maryam)", 98],
  ["Ta Ha", "(Ta Ha)", 135],
  ["Al-Anbiya", "(Nabi-nabi)", 112],
  ["Al-Hajj", "(Haji)", 78],
  ["Al-Mu'minun", "(Orang-orang mukmin)", 118],
  ["An-Nur", "(Cahaya)", 64],
  ["Al-Furqan", "(Pembeda)", 77],
  ["Asy-Syu'ara'", "(Penyair)", 227],
  ["An-Naml", "(Semut)", 93],
  ["Al-Qasas", "(Kisah-kisah)", 88],
  ["Al-'Ankabut", "(Laba-laba)", 69],
  ["Ar-Rum", "(Bangsa Romawi)", 60],
  ["Luqman", "(Keluarga Luqman)", 34],
  ["As-Sajdah", "(Sajdah)", 30],
  ["Al-Ahzab", "(Golongan-golongan yang Bersekutu)", 73],
  ["Saba'", "(Kaum Saba')", 54],
  ["Fatir", "(Pencipta)", 45],
  ["Ya Sin", "(Yasin)", 83],
  ["As-Saffat", "(Barisan-barisan)", 182],
  ["Sad", "(Sad)", 88],
  ["Az-Zumar", "(Rombongan)", 75],
  ["Ghafir", "(Yang Mengampuni)", 85],
  ["Fussilat", "(Yang Dijelaskan)", 54],
  ["Asy-Syura", "(Musyawarah)", 53],
  ["Az-Zukhruf", "(Perhiasan)", 89],
  ["Ad-Dukhan", "(Kabut)", 59],
  ["Al-Jasiyah", "(Yang Bertekuk Lutut)", 37],
  ["Al-Ahqaf", "(Bukit-bukit Pasir)", 35],
  ["Muhammad", "(Nabi Muhammad)", 38],
  ["Al-Fath", "(Kemenangan)", 29],
  ["Al-Hujurat", "(Kamar-kamar)", 18],
  ["Qaf", "(Qaf)", 45],
  ["Az-Zariyat", "(Angin yang Menerbangkan)", 60],
  ["At-Tur", "(Bukit)", 49],
  ["An-Najm", "(Bintang)", 62],
  ["Al-Qamar", "(Bulan)", 55],
  ["Ar-Rahman", "(Yang Maha Pemurah)", 78],
  ["Al-Waqi'ah", "(Hari Kiamat)", 96],
  ["Al-Hadid", "(Besi)", 29],
  ["Al-Mujadilah", "(Gugatan)", 22],
  ["Al-Hasyr", "(Pengusiran)", 24],
  ["Al-Mumtahanah", "(Wanita yang Diuji)", 13],
  ["As-Saff", "(Barisan)", 14],
  ["Al-Jumu'ah", "(Hari Jumat)", 11],
  ["Al-Munafiqun", "(Orang-orang yang Munafik)", 11],
  ["At-Tagabun", "(Hari Dinampakkan Kesalahan-kesalahan)", 18],
  ["At-Talaq", "(Talak)", 12],
  ["At Tahrim", "(Pengharaman)", 12],
  ["Al-Mulk", "(Kerajaan)", 30],
  ["Al-Qalam", "(Pena)", 52],
  ["Al-Haqqah", "(Hari Kiamat)", 52],
  ["Al-Ma'arij", "(Tempat Naik)", 44],
  ["Nuh", "(Nabi Nuh)", 28],
  ["Al-Jinn", "(Jin)", 28],
  ["Al-Muzzammil", "(Orang yang Berkelumun)", 20],
  ["Al-Muddassir", "(Orang yang Berselimut)", 56],
  ["Al-Qiyamah", "(Kiamat)", 40],
  ["Al-Insan", "(Manusia)", 31],
  ["Al-Mursalat", "(Malaikat-malaikat yang Diutus)", 50],
  ["An-Naba'", "(Berita Besar)", 40],
  ["An-Nazi'at", "(Yang Mencabut dengan Keras)", 46],
  ["'Abasa", "(Bermuka Masam)", 42],
  ["At-Takwir", "(Menggulung)", 29],
  ["Al-Infitar", "(Terbelah)", 19],
  ["Al-Mutaffifin", "(Orang-orang yang Curang)", 36],
  ["Al-Insyiqaq", "(Terbelah)", 25],
  ["Al-Buruj", "(Gugusan Bintang)", 22],
  ["At-Tariq", "(Yang Datang di Malam Hari)", 17],
  ["Al-A'la", "(Maha Tinggi)", 19],
  ["Al-Gasyiyah", "(Hari Pembalasan)", 26],
  ["Al-Fajr", "(Fajar)", 30],
  ["Al-Balad", "(Negeri)", 20],
  ["Asy-Syams", "(Matahari)", 15],
  ["Al-Lail", "(Malam)", 21],
  ["Ad-Duha", "(Duha)", 11],
  ["Al-Insyirah", "(Melapangkan)", 8],
  ["At-Tin", "(Buah Tin)", 8],
  ["Al-'Alaq", "(Segumpal Darah)", 19],
  ["Al-Qadr", "(Kemuliaan)", 5],
  ["Al-Bayyinah", "(Pembuktian)", 8],
  ["Az-Zalzalah", "(Kegoncangan)", 8],
  ["Al-'Adiyat", "(Kuda Perang yang Berlari Kencang)", 11],
  ["Al-Qari'ah", "(Hari Kiamat yang Menggetarkan)", 11],
  ["At-Takasur", "(Bermegah-megahan)", 8],
  ["Al-'Asr", "(Masa)", 3],
  ["Al-Humazah", "(Pengumpat)", 9],
  ["Al-Fil", "(Gajah)", 5],
  ["Quraisy", "(Suku Quraisy)", 4],
  ["Al-Ma'un", "(Bantuan)", 7],
  ["Al-Kautsar", "(Nikmat yang Berlimpah)", 3],
  ["Al-Kafirun", "(Orang-orang Kafir)", 6],
  ["An-Nasr", "(Pertolongan)", 3],
  ["Al-Lahab", "(Gejolak Api)", 5],
  ["Al-Ikhlas", "(Ikhlas)", 4],
  ["Al-Falaq", "(Waktu Fajar)", 5],
  ["An-Nas", "(Manusia)", 6]
]

/* =========================
   KONFIGURASI DATABASE
========================= */
let db
const DB_PATH = "./quran.db"

// Helper untuk escape string SQL
function esc(s = "") {
  if (!s) return ""
  return s
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .trim()
}

/* =========================
   FUNGSI UTAMA
========================= */

// Fetch URL dengan retry mechanism
async function fetchUrl(url, options = {}, retryCount = 3) {
  for (let i = 0; i < retryCount; i++) {
    try {
      let utf8 = {}
      if (typeof options.utf8 !== "undefined") {
        utf8 = {
          'content-type': 'text/plain',
          'charset': 'utf-8'
        }
      }

      const res = await axios({
        method: options.post ? 'POST' : 'GET',
        url,
        headers: {
          'x-vary': 'User-Agent',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...utf8
        },
        timeout: 10000,
        ...options
      })

      return res.data
    } catch (err) {
      if (i === retryCount - 1) throw err
      await sleep(2000 * (i + 1)) // Exponential backoff
    }
  }
}

// Simpan data surah ke database
async function simpanSurah(key) {
  const val = List[key]
  const surahNo = key + 1
  
  // Query untuk memeriksa apakah surah sudah ada
  const checkQuery = `SELECT COUNT(*) as count FROM surahs WHERE no = ${surahNo}`
  const result = await db.query(checkQuery)
  
  if (result && result[0] && result[0].count === 0) {
    const insertQuery = `
      INSERT INTO surahs (no, name, "id", ayat) 
      VALUES (${surahNo}, '${esc(val[0])}', '${esc(val[1])}', ${val[2]})
    `
    await db.exec(insertQuery)
    console.log(`📝 Surah ${surahNo} ditambahkan ke database`)
  }
  
  return surahNo
}

// Salin data dasar dari file JSON eksternal ke database
async function salin(key) {
  const val = List[key]
  const filename = `../renpwn/database/alquran/Alquran_${key+1}.json`
  const newfilename = `./alquran/Alquran_${key+1}.json`

  try {
    // Baca file asli
    const raw = await fs.readFile(filename, "utf8")
    const res = JSON.parse(raw)

    // Simpan surah ke database
    const surahNo = await simpanSurah(key)
    
    let isibaru = res.data[0]
    delete isibaru.edition

    const queries = []

    // Kumpulkan semua query untuk dieksekusi sekaligus
    for (let keyay = 0; keyay < res.data[0].ayahs.length; keyay++) {
      const ayahNo = keyay + 1
      const ayahData = {
        ind: res.data[0].ayahs[keyay].text,
        arb: res.data[1].ayahs[keyay].text,
        transliterasi: "",
        eng: res.data[2].ayahs[keyay].text
      }

      // Query untuk menyimpan ayat
      queries.push(`
        INSERT OR REPLACE INTO ayahs (surah_id, ayat, text_ar)
        VALUES (${surahNo}, ${ayahNo}, '${esc(ayahData.arb)}')
      `)

      // Simpan ke objek untuk file JSON
      isibaru.ayahs[keyay] = ayahData
    }

    // Eksekusi semua query ayat
    if (queries.length > 0) {
      await db.execMany(queries)
    }

    // Simpan terjemahan setelah semua ayat masuk
    for (let keyay = 0; keyay < res.data[0].ayahs.length; keyay++) {
      const ayahNo = keyay + 1
      const ayahData = isibaru.ayahs[keyay]
      
      // Dapatkan ID ayat
      const ayahResult = await db.query(`
        SELECT id FROM ayahs 
        WHERE surah_id = ${surahNo} AND ayat = ${ayahNo}
      `)
      
      if (ayahResult && ayahResult[0]) {
        const ayahId = ayahResult[0].id
        
        // Hapus terjemahan lama
        await db.exec(`
          DELETE FROM translations 
          WHERE ayah_id = ${ayahId} AND lang = 'id'
        `)
        await db.exec(`
          DELETE FROM translations 
          WHERE ayah_id = ${ayahId} AND lang = 'en'
        `)
        
        // Simpan terjemahan baru
        await db.execMany([
          `INSERT INTO translations (ayah_id, lang, text) VALUES (${ayahId}, 'id', '${esc(ayahData.ind)}')`,
          `INSERT INTO translations (ayah_id, lang, text) VALUES (${ayahId}, 'en', '${esc(ayahData.eng)}')`
        ])
      }
    }

    // Simpan ke file JSON lokal
    await fs.writeFile(newfilename, JSON.stringify(isibaru, null, 4))
    console.log(`✅ salin: ${val[0]} (${res.data[0].ayahs.length} ayat)`)
    
  } catch (error) {
    console.error(`❌ Gagal menyalin surah ${key+1}:`, error.message)
  }
}

// Fungsi untuk mengambil tafsir dengan multi-fetch
async function ambilTafsirBatch(surahNo, startAyat, batchSize = 5) {
  const val = List[surahNo - 1]
  const totalAyat = val[2]
  const endAyat = Math.min(startAyat + batchSize - 1, totalAyat)
  
  console.log(`🔄 Mengambil tafsir surah ${surahNo} ayat ${startAyat}-${endAyat}`)
  
  const promises = []
  
  for (let ayat = startAyat; ayat <= endAyat; ayat++) {
    promises.push(ambilTafsirAyat(surahNo, ayat))
  }
  
  try {
    await Promise.all(promises)
    console.log(`✅ Selesai surah ${surahNo} ayat ${startAyat}-${endAyat}`)
    
    // Lanjut ke batch berikutnya jika masih ada
    if (endAyat < totalAyat) {
      await sleep(1500) // Jeda antar batch
      return ambilTafsirBatch(surahNo, endAyat + 1, batchSize)
    }
  } catch (error) {
    console.error(`❌ Error batch surah ${surahNo}:`, error.message)
    await sleep(3000) // Jeda lebih lama jika error
    return ambilTafsirBatch(surahNo, startAyat, Math.max(1, batchSize - 2)) // Kurangi batch size
  }
}

// Ambil tafsir untuk satu ayat
async function ambilTafsirAyat(surahNo, ayat) {
  const key = surahNo - 1
  const val = List[key]

  let slug =
    (surahNo === 83)  ? "al-tatfif" :
    (surahNo === 40)  ? "al-mu-min" :
    (surahNo === 108) ? "al-kausar" :
    val[0].replace(/[ ']/g, "-").toLowerCase().replace("--","-")

  let surat = `${surahNo}-${slug}`.replace("--","-")
  if (surat.endsWith("-")) surat = surat.slice(0, -1)

  const url = `https://qurano.com/id/${surat}/ayat-${ayat}/`
  
  try {
    const html = await fetchUrl(url)
    const $ = cheerio.load(html)

    // Ambil transliterasi
    const trans = $("div.transliteration").text()
    const transliterasi = trans.split("(")[0].trim()

    // Formatter untuk tafsir
    const formater = (id) => {
      let txt = $(`article#${id}`).find("p").html()
      if (!txt) return ""
      return txt.replace(/<br>/g, "\n").replace(/<em>|<\/em>/g, "_")
    }

    // Kumpulkan data tafsir
    const tafsirData = {
      transliterasi: transliterasi,
      kemenag_ringkas: formater("kemenag_ringkas"),
      kemenag: formater("kemenag"),
      ibnu_katsir: formater("ibnu_katsir"),
      jalalain: formater("jalalain"),
      quraish_shihab: formater("quraish_shihab"),
      saadi: formater("saadi")
    }

    // Dapatkan ID ayat dari database
    const ayahResult = await db.query(`
      SELECT id FROM ayahs 
      WHERE surah_id = ${surahNo} AND ayat = ${ayat}
    `)

    if (ayahResult && ayahResult[0]) {
      const ayahId = ayahResult[0].id
      
      // Update transliterasi
      await db.exec(`
        UPDATE ayahs 
        SET text_latin = '${esc(transliterasi)}'
        WHERE id = ${ayahId}
      `)

      // Simpan tafsir ke database
      const tafsirEntries = [
        ['kemenag', tafsirData.kemenag],
        ['kemenag_ringkas', tafsirData.kemenag_ringkas],
        ['jalalain', tafsirData.jalalain],
        ['ibnu_katsir', tafsirData.ibnu_katsir],
        ['quraish_shihab', tafsirData.quraish_shihab],
        ['saadi', tafsirData.saadi]
      ]

      for (const [kitab, text] of tafsirEntries) {
        if (text && text.trim()) {
          // Hapus tafsir lama
          await db.exec(`
            DELETE FROM tafsirs 
            WHERE ayah_id = ${ayahId} AND kitab = '${kitab}'
          `)
          
          // Simpan tafsir baru
          await db.exec(`
            INSERT INTO tafsirs (ayah_id, kitab, text) 
            VALUES (${ayahId}, '${kitab}', '${esc(text)}')
          `)
        }
      }
    }

    // Update file JSON lokal
    const filename = `./alquran/Alquran_${surahNo}.json`
    try {
      const raw = await fs.readFile(filename, "utf8")
      const res = JSON.parse(raw)
      
      if (res.ayahs && res.ayahs[ayat-1]) {
        res.ayahs[ayat-1] = {
          ...res.ayahs[ayat-1],
          ...tafsirData
        }
        await fs.writeFile(filename, JSON.stringify(res, null, 4))
      }
    } catch (e) {
      // File mungkin belum ada, tidak apa-apa
    }

    console.log(`✔ ${surat} ayat ${ayat}`)
    
  } catch (error) {
    console.error(`❌ Gagal ambil ${surat} ayat ${ayat}:`, error.message)
    throw error
  }
}

// Rebuild FTS tables
async function rebuildFTS() {
  console.log("🔄 Rebuilding FTS tables...")
  try {
    const queries = [
      "INSERT INTO surahs_fts(surahs_fts) VALUES ('rebuild')",
      "INSERT INTO ayahs_fts(ayahs_fts) VALUES ('rebuild')",
      "INSERT INTO translations_fts(translations_fts) VALUES ('rebuild')",
      "INSERT INTO tafsirs_fts(tafsirs_fts) VALUES ('rebuild')"
    ]
    
    await db.execMany(queries)
    console.log("✅ FTS tables rebuilt")
  } catch (error) {
    console.error("❌ Error rebuilding FTS:", error.message)
  }
}

/* =========================
   FUNGSI UTAMA DENGAN KONTROL
========================= */
async function processSurah(startIndex = 0) {
  try {
    // Buka koneksi database
    console.log("🚀 Opening database connection...")
    db = await openDB(DB_PATH)
    
    // Proses setiap surah
    for (let key = startIndex; key < List.length; key++) {
      console.log(`\n📖 ========================================`)
      console.log(`📖 Memulai surah ${key + 1}: ${List[key][0]}`)
      console.log(`📖 ========================================`)
      
      // Salin data dasar
      await salin(key)
      
      // Ambil tafsir dengan multi-fetch
      await ambilTafsirBatch(key + 1, 1, 5) // Batch size 5
      
      // Beri jeda antar surah
      if (key < List.length - 1) {
        console.log(`\n⏳ Menunggu 3 detik sebelum surah berikutnya...`)
        await sleep(3000)
      }
    }
    
    // Rebuild FTS setelah semua selesai
    await rebuildFTS()
    
    // Tutup database
    db.close()
    console.log("\n" + "=".repeat(50))
    console.log("🎉 SEMUA SURAH SELESAI DIPROSES!")
    console.log("=".repeat(50))
    
  } catch (error) {
    console.error("\n❌ Error utama:", error.message)
    if (db) db.close()
    process.exit(1)
  }
}

/* =========================
   FUNGSI UNTUK RESUME (jika terhenti)
========================= */
async function resumeFromSurah(surahNo) {
  const startIndex = surahNo - 1
  console.log(`🔄 Resume dari surah ${surahNo}: ${List[startIndex][0]}`)
  await processSurah(startIndex)
}

/* =========================
   FUNGSI UNTUK PROSES SATU SURAH SAJA
========================= */
async function processSingleSurah(surahNo) {
  const key = surahNo - 1
  if (key < 0 || key >= List.length) {
    console.error(`❌ Surah ${surahNo} tidak valid`)
    return
  }
  
  try {
    console.log("🚀 Opening database connection...")
    db = await openDB(DB_PATH)
    
    console.log(`\n📖 Memproses surah ${surahNo}: ${List[key][0]}`)
    
    // Salin data dasar
    await salin(key)
    
    // Ambil tafsir dengan multi-fetch
    await ambilTafsirBatch(surahNo, 1, 5)
    
    // Tutup database
    db.close()
    console.log(`\n✅ Surah ${surahNo} selesai diproses!`)
    
  } catch (error) {
    console.error(`❌ Error memproses surah ${surahNo}:`, error.message)
    if (db) db.close()
  }
}

/* =========================
   JALANKAN
========================= */
// Pilih mode eksekusi:

// 1. Untuk menjalankan semua surah dari awal
processSurah(0)

// 2. Untuk resume dari surah tertentu (misal: surah 41)
// resumeFromSurah(41)

// 3. Untuk memproses satu surah saja (misal: surah 1)
// processSingleSurah(1)