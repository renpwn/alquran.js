import {
    enableDebug
} from '@renpwn/termux-sqlite3/debug'
import {
    sleep
} from '../renpwn/lib/Function.js'
import fs from 'fs/promises'
import path from 'path'
import {
    fileURLToPath
} from 'url'
import * as cheerio from 'cheerio'
import axios from 'axios'
import {
    JSDOM
} from "jsdom"
import iconv from 'iconv-lite'
import {
    openDB
} from './db.js'

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
   KONFIGURASI
========================= */
let db = null
const DB_PATH = "./quran.db"
const ALQURAN_DIR = "./alquran"
const ALQURAN_DIR_MIN = "./alquran_min"
const SOURCE_DIR = "../renpwn/database/alquran"

// Helper untuk mendapatkan __dirname di ES Module
const __filename = fileURLToPath(
    import.meta.url)
const __dirname = path.dirname(__filename)

// Helper untuk escape string SQL - gunakan yang dari database jika tersedia
function esc(s = "") {
    if (!s) return ""
    // Gunakan escape dari db jika ada, jika tidak gunakan yang default
    if (db && db.escape) {
        return db.escape(s)
    }
    return s
        .replace(/'/g, "''")
        .replace(/\\/g, "\\\\")
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\t/g, " ")
        .trim()
}

// Parse arguments
function parseArgs() {
    const args = process.argv.slice(2)
    const options = {
        mode: 1,
        start: 1,
        surah: null,
        concurrency: 5,
        batch: false,
        resume: false
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]

        if (arg === "--mode" || arg === "-m") {
            options.mode = parseInt(args[++i]) || 1
        } else if (arg === "--start" || arg === "-s") {
            options.start = parseInt(args[++i]) || 1
        } else if (arg === "--surah" || arg === "-S") {
            options.surah = parseInt(args[++i])
            options.batch = false
        } else if (arg === "--concurrency" || arg === "-c") {
            options.concurrency = parseInt(args[++i]) || 5
        } else if (arg === "--batch" || arg === "-b") {
            options.batch = true
        } else if (arg === "--resume" || arg === "-r") {
            options.resume = true
        } else if (arg === "--help" || arg === "-h") {
            showHelp()
            process.exit(0)
        }
    }

    return options
}

function showHelp() {
    console.log(`
📖 Quran Tafsir Scraper - 3 Mode Penggunaan

Mode:
  1: Web → JSON & DB (default)
  2: Web → JSON
  3: JSON → DB

Penggunaan:
  node cektafsir++.js [options]

Options:
  -m, --mode <mode>        Mode pengambilan data (1-3)
  -s, --start <no>         Mulai dari surah ke-n (default: 1)
  -S, --surah <no>         Proses satu surah saja
  -c, --concurrency <n>    Jumlah request paralel (default: 5)
  -b, --batch              Proses semua surah sekaligus
  -r, --resume             Resume proses (cek data yang sudah ada)
  -h, --help               Tampilkan bantuan ini

Contoh:
  node cektafsir++.js                     # Mode 1, surah 1
  node cektafsir++.js -m 1 -s 41 -b       # Mode 1, mulai surah 41, semua
  node cektafsir++.js -m 2 -S 1           # Mode 2, hanya surah 1
  node cektafsir++.js -m 3 -c 3 -b        # Mode 3, 3 paralel, semua surah
  node cektafsir++.js -m 1 -c 7 -b        # Mode 1, 7 paralel, semua surah
  `)
}

/* =========================
   SISTEM QUEUE YANG LEBIH BAIK
========================= */

class DatabaseQueue {
    constructor(db, maxConcurrent = 1) {
        this.db = db
        this.maxConcurrent = maxConcurrent
        this.queue = []
        this.processing = 0
        this.completed = 0
        this.failed = 0
    }

    async add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                task,
                resolve,
                reject
            })
            //console.log("ini...", this.queue.length)
            //console.log(task.toString().split("VALUES (")[0])
            this.process()
        })
    }

    async process() {
        while (this.queue.length > 0 && this.processing < this.maxConcurrent) {
            const {
                task,
                resolve,
                reject
            } = this.queue.shift()
            this.processing++

            task()
                .then(result => {
                    resolve(result)
                    this.completed++
                })
                .catch(error => {
                    reject(error)
                    this.failed++
                    console.error("❌ Database task failed:", error.message)
                })
                .finally(() => {
                    this.processing--
                    this.process()
                })
        }
    }

    async waitUntilEmpty() {
        while (this.queue.length > 0 || this.processing > 0) {
            await sleep(100)
        }
    }
}

class TafsirQueue {
    constructor(concurrency = 5) {
        this.concurrency = concurrency
        this.queue = []
        this.processing = 0
        this.completed = 0
        this.failed = 0
        this.total = 0
        this.results = []
        this.results = []
    }

    add(task) {
        this.queue.push(task)
        this.total++
    }

    async process() {
        const workers = []

        const worker = async () => {
            while (this.queue.length > 0) {
                const task = this.queue.shift()
                if (!task) continue

                this.processing++
                try {
                    const result = await task()
                    this.results.push(result)
                    this.completed++
                } catch (error) {
                    this.failed++
                    console.error("Task error:", error.message)
                } finally {
                    this.processing--
                    this.showProgress()
                }
            }
        }

        for (let i = 0; i < Math.min(this.concurrency, this.total); i++) {
            workers.push(worker())
        }

        await Promise.all(workers)
        return this.results
    }

    showProgress() {
        const processed = this.completed + this.failed
        const progress = Math.round(processed / this.total * 100)
        process.stdout.write(`\r📊 Progress: ${processed}/${this.total} ayat (${progress}%) | Active: ${this.processing} | Failed: ${this.failed}`)
    }
}

/* =========================
   FUNGSI UMUM
========================= */

async function fetchUrl(url, options = {}, retryCount = 3) {
    for (let i = 0; i < retryCount; i++) {
        try {
            const res = await axios({
                method: options.post ? 'POST' : 'GET',
                url,
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ...options.headers
                },
                timeout: 30000,
                ...options
            })
            return res.data
        } catch (err) {
            console.log(`⏳ Retry ${i + 1}/${retryCount} untuk ${url}`)
            if (i === retryCount - 1) throw err
            await sleep(5000 * (i + 1))
        }
    }
}

async function salinDataSurah(key) {
    const val = List[key]
    const surahNo = key + 1

    try {
        const sourceFile = `${SOURCE_DIR}/Alquran_${surahNo}.json`
        const targetFile = `${ALQURAN_DIR}/Alquran_${surahNo}.json`

        // Cek apakah file target sudah ada
        try {
            await fs.access(targetFile)
            console.log(`ℹ️  File ${targetFile} sudah ada, menggunakan data yang ada`)
            return JSON.parse(await fs.readFile(targetFile, "utf8"))
        } catch {
            // File tidak ada, lanjut salin dari source
        }

        // Baca file source
        const raw = await fs.readFile(sourceFile, "utf8")
        const res = JSON.parse(raw)

        // Format data baru
        const isibaru = {
            number: surahNo,
            name: val[0],
            ar: res.data[1].name,
            en: res.data[0].englishName,
            id: val[1].replace(/[()]/g, ''),
            revelationType: res.data[0].revelationType,
            numberOfAyahs: res.data[0].ayahs.length,
            ayahs: []
        }

        // Salin data ayat
        for (let keyay = 0; keyay < res.data[0].ayahs.length; keyay++) {
            isibaru.ayahs[keyay] = {
                ind: res.data[0].ayahs[keyay].text,
                arb: res.data[1].ayahs[keyay].text,
                transliterasi: "",
                eng: res.data[2].ayahs[keyay].text,
                kemenag: "",
                kemenag_ringkas: "",
                ibnu_katsir: "",
                jalalain: "",
                quraish_shihab: "",
                saadi: ""
            }
        }

        // Simpan ke file lokal
        await fs.writeFile(targetFile, JSON.stringify(isibaru, null, 4))
        console.log(`✅ Data dasar surah ${surahNo}: ${val[0]} (${isibaru.numberOfAyahs} ayat)`)

        return isibaru

    } catch (error) {
        console.error(`❌ Gagal menyalin surah ${surahNo}:`, error.message)
        throw error
    }
}

async function ambilTafsirAyat(surahNo, ayat) {
    const key = surahNo - 1
    const val = List[key]

    let slug = val[0].replace(/[ ']/g, "-").toLowerCase().replace("--", "-")

    // Special cases
    if (surahNo === 83) slug = "al-tatfif"
    if (surahNo === 40) slug = "al-mu-min"
    if (surahNo === 108) slug = "al-kausar"

    let surat = `${surahNo}-${slug}`.replace("--", "-")
    if (surat.endsWith("-")) surat = surat.slice(0, -1)

    const url = `https://qurano.com/id/${surat}/ayat-${ayat}/`

    try {
        const html = await fetchUrl(url)
        const $ = cheerio.load(html)

        // Ambil transliterasi
        const trans = $("div.transliteration").text()
        const transliterasi = trans.split("(")[0].trim()

        let title = $("title").text().split(" Ayat")[0].trim()
        title = ({
            "Al-Mujadalah": "Al Mujadilah"
        } [title] || title)

        // Formatter untuk tafsir
        const formater = (id) => {
            const element = $(`article#${id}`)
            if (!element.length) return ""
            let txt = element.find("p").html()
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

        return {
            success: true,
            data: tafsirData,
            title,
            surat,
            ayat
        }

    } catch (error) {
        console.error(`❌ Gagal ambil ${surahNo} ayat ${ayat}:`, error.message)
        return {
            success: false,
            error: error.message,
            surat,
            ayat
        }
    }
}

async function ambilTransliterasiAyat(title) {
    title = ({
        "Az-Zalzalah": "Al Zalzalah",
        "Al-Kahf": "Al Kahfi"
    } [title] || title)
    const url = `https://litequran.net/${title.replace(/[']/g, "").replace(/[ ]/g, "-")}`

    try {
        const html = await fetchUrl(url)
        //console.log("html", iconv.decode(Buffer.from(html), "utf-8"))
        const $ = cheerio.load(html)

        // Ambil transliterasi
        const trans = $("p.translate")
        const transliterasi = trans.map((i, el) => {
            return $(el).text().trim()
        })
        //console.log("trans", transliterasi)

        return {
            success: true,
            transliterasi,
            title
        }

    } catch (error) {
        console.error(`❌ Gagal ambil ${title}`, error.message)
        return {
            success: false,
            error: error.message,
            title,
            ayat
        }
    }
}

function cekAyatBelumLengkap(surahData) {
    const ayatBelumLengkap = []

    for (let i = 0; i < surahData.ayahs.length; i++) {
        const ayah = surahData.ayahs[i]
        if (!ayah.transliterasi || !ayah.kemenag || ayah.kemenag.trim() === "") {
            ayatBelumLengkap.push(i + 1)
        }
    }

    return ayatBelumLengkap
}

/* =========================
   MODE 1: WEB → JSON & DB
========================= */

async function simpanSurahToDB(surahNo, surahData) {
    return dbQueue.add(async () => {
        try {
            const stmt = db.prepare(`
        INSERT OR REPLACE INTO surahs (no, name, ar, en, "id", ayat, place)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)

            await stmt.run(
                surahNo,
                surahData.name,
                surahData.ar,
                surahData.en,
                surahData.id,
                surahData.numberOfAyahs,
                surahData.revelationType
            )

            return true
        } catch (error) {
            console.error(`❌ Gagal menyimpan surah ${surahNo} ke DB:`, error.message)
            throw error
        }
    })
}

async function simpanAyatToDBold(surahNo, ayahNo, ayahData) {
    return dbQueue.add(async () => {
        try {
            // Gunakan transaction untuk operasi terkait
            await db.transaction(async () => {
                // Insert atau replace ayat
                const stmtAyah = db.prepare(`
          INSERT OR REPLACE INTO ayahs (surah_id, ayat, text_ar, text_latin)
          VALUES (?, ?, ?, ?)
        `)

                await stmtAyah.run(
                    surahNo,
                    ayahNo,
                    ayahData.arb,
                    ayahData.transliterasi
                )

                // Dapatkan ID ayat
                const ayahResult = await db.query(`
          SELECT id FROM ayahs 
          WHERE surah_id = ? AND ayat = ?
        `, [surahNo, ayahNo])

                if (ayahResult && ayahResult.length > 0) {
                    const ayahId = ayahResult[0].id

                    // Update terjemahan
                    const delTrans = db.prepare(`
            DELETE FROM translations WHERE ayah_id = ?
          `)
                    await delTrans.run(ayahId)

                    const insTrans = db.prepare(`
            INSERT INTO translations (ayah_id, lang, text) VALUES (?, ?, ?)
          `)

                    await insTrans.run(ayahId, 'id', ayahData.ind || '')
                    await insTrans.run(ayahId, 'en', ayahData.eng || '')

                    // Simpan tafsir
                    const tafsirEntries = [
                        ['kemenag', ayahData.kemenag],
                        ['kemenag_ringkas', ayahData.kemenag_ringkas],
                        ['jalalain', ayahData.jalalain],
                        ['ibnu_katsir', ayahData.ibnu_katsir],
                        ['quraish_shihab', ayahData.quraish_shihab],
                        ['saadi', ayahData.saadi]
                    ]

                    const delTafsir = db.prepare(`
            DELETE FROM tafsirs WHERE ayah_id = ? AND kitab = ?
          `)

                    const insTafsir = db.prepare(`
            INSERT INTO tafsirs (ayah_id, kitab, text) VALUES (?, ?, ?)
          `)

                    for (const [kitab, text] of tafsirEntries) {
                        if (text && text.trim()) {
                            await delTafsir.run(ayahId, kitab)
                            await insTafsir.run(ayahId, kitab, text)
                        }
                    }
                }
            })

            return true
        } catch (error) {
            console.error(`❌ Gagal menyimpan ayat ${surahNo}:${ayahNo} ke DB:`, error.message)
            throw error
        }
    })
}

async function simpanAyatToDB(surahNo, ayahNo, ayahData) {
    return dbQueue.add(async () => {
        try {
            // 🔹 Siapkan statement DI LUAR transaction
            const stmtAyah = db.prepare(`
        INSERT OR REPLACE INTO ayahs (surah_id, ayat, text_ar, text_latin)
        VALUES (?, ?, ?, ?)
      `)

            const stmtGetAyahId = db.prepare(`
        SELECT id FROM ayahs WHERE surah_id = ? AND ayat = ?
      `)

            const delTrans = db.prepare(`
        DELETE FROM translations WHERE ayah_id = ?
      `)

            const insTrans = db.prepare(`
        INSERT INTO translations (ayah_id, lang, text) VALUES (?, ?, ?)
      `)

            const delTafsir = db.prepare(`
        DELETE FROM tafsirs WHERE ayah_id = ? AND kitab = ?
      `)

            const insTafsir = db.prepare(`
        INSERT INTO tafsirs (ayah_id, kitab, text) VALUES (?, ?, ?)
      `)

            // 🔥 TRANSACTION HARUS SYNC
            const trx = db.transaction(() => {
                // 1. Simpan ayat
                stmtAyah.run(
                    surahNo,
                    ayahNo,
                    ayahData.arb || '',
                    ayahData.transliterasi || ''
                )

                // 2. Ambil ayah_id
                const row = stmtGetAyahId.get(surahNo, ayahNo)
                if (!row) return

                const ayahId = row.id

                // 3. Translation
                delTrans.run(ayahId)
                insTrans.run(ayahId, 'id', ayahData.ind || '')
                insTrans.run(ayahId, 'en', ayahData.eng || '')

                // 4. Tafsir
                const tafsirEntries = [
                    ['kemenag', ayahData.kemenag],
                    ['kemenag_ringkas', ayahData.kemenag_ringkas],
                    ['jalalain', ayahData.jalalain],
                    ['ibnu_katsir', ayahData.ibnu_katsir],
                    ['quraish_shihab', ayahData.quraish_shihab],
                    ['saadi', ayahData.saadi]
                ]

                for (const [kitab, text] of tafsirEntries) {
                    if (text && text.trim()) {
                        delTafsir.run(ayahId, kitab)
                        insTafsir.run(ayahId, kitab, text)
                    }
                }
            })

            // 🔥 EKSEKUSI TRANSACTION
            trx()

            return true
        } catch (error) {
            console.error(
                `❌ Gagal menyimpan ayat ${surahNo}:${ayahNo} ke DB:`,
                error.message
            )
            throw error
        }
    })
}

async function processSurahMode1(surahNo, concurrency = 5, resume = false) {
    const key = surahNo - 1
    const val = List[key]

    console.log(`\n📖 Memproses surah ${surahNo}: ${val[0]} (Mode 1: Web → JSON & DB)`)
    console.log(`📊 Total ayat: ${val[2]}, Web concurrency: ${concurrency}, DB concurrency: 1`)

    try {
        // 1. Salin data dasar
        let surahData = await salinDataSurah(key)

        // 2. Simpan surah ke database
        await simpanSurahToDB(surahNo, surahData)

        // 3. Cek ayat yang belum lengkap
        const ayatBelumLengkap = resume ? cekAyatBelumLengkap(surahData) : Array.from({
            length: val[2]
        }, (_, i) => i + 1)

        if (ayatBelumLengkap.length === 0) {
            console.log(`✅ Semua tafsir surah ${surahNo} sudah lengkap`)
            return true
        }

        console.log(`🔄 Mengambil ${ayatBelumLengkap.length} ayat yang belum lengkap...`)

        // 4. Buat queue untuk pengambilan tafsir
        const webQueue = new TafsirQueue(concurrency)

        let transliterasiPromise = null
        let namaSurahUpdated = false
        let transliterasiArray = []

        for (const ayat of ayatBelumLengkap) {
            webQueue.add(async () => {
                const result = await ambilTafsirAyat(surahNo, ayat)

                if (result.success) {
                    // Ambil transliterasi HANYA SEKALI dengan Promise
                    if (!transliterasiPromise) {
                        transliterasiPromise = (async () => {
                            const translitResult = await ambilTransliterasiAyat(result.title)
                            return translitResult.transliterasi || []
                        })()
                    }

                    // Tunggu transliterasi jika belum siap
                    if (transliterasiArray.length === 0) {
                        transliterasiArray = await transliterasiPromise
                    }

                    // Update nama surah jika ada
                    if (result.title && result.title !== surahData.name && !namaSurahUpdated) {
                        surahData.name = result.title
                        namaSurahUpdated = true

                        await dbQueue.add(async () => {
                            try {
                                await db.exec(`
                  UPDATE surahs SET name = '${esc(result.title)}' WHERE no = ${surahNo}
                `)
                            } catch (error) {
                                console.error(`❌ Gagal update nama surah ${surahNo}:`, error.message)
                                throw error
                            }
                        })
                    }

                    // Update data di memory
                    const ayahIndex = ayat - 1
                    surahData.ayahs[ayahIndex] = {
                        ...surahData.ayahs[ayahIndex],
                        ...result.data
                    }

                    surahData.ayahs[ayahIndex].transliterasi = transliterasiArray[ayahIndex]

                    // Simpan ke database via queue
                    await simpanAyatToDB(surahNo, ayat, surahData.ayahs[ayahIndex])
                }

                return result
            })
        }

        // 5. Proses web queue
        await webQueue.process()

        // 6. Tunggu semua operasi database selesai
        console.log(`\n⏳ Menunggu operasi database selesai...`)
        await dbQueue.waitUntilEmpty()

        // 7. Simpan ke file JSON
        const filename = `${ALQURAN_DIR}/Alquran_${surahNo}.json`
        await fs.writeFile(filename, JSON.stringify(surahData, null, 4))

        // 8. Buat versi minified
        try {
            await fs.access(ALQURAN_DIR_MIN)
        } catch {
            await fs.mkdir(ALQURAN_DIR_MIN, {
                recursive: true
            })
        }

        const filenameMin = `${ALQURAN_DIR_MIN}/Alquran_${surahNo}.min.json`
        await fs.writeFile(filenameMin, JSON.stringify(surahData))

        console.log(`\n✅ Surah ${surahNo} selesai diproses`)
        console.log(`📊 Statistik: Web: ${webQueue.completed} berhasil, ${webQueue.failed} gagal`)
        console.log(`📊 Statistik: DB: ${dbQueue.completed} berhasil, ${dbQueue.failed} gagal`)

        return webQueue.failed === 0 && dbQueue.failed === 0

    } catch (error) {
        console.error(`❌ Error memproses surah ${surahNo}:`, error.message)
        return false
    }
}

/* =========================
   MODE 2: WEB → JSON
========================= */

async function processSurahMode2(surahNo, concurrency = 5, resume = false) {
    const key = surahNo - 1
    const val = List[key]

    console.log(`\n📖 Memproses surah ${surahNo}: ${val[0]} (Mode 2: Web → JSON)`)
    console.log(`📊 Total ayat: ${val[2]}, Concurrency: ${concurrency}`)

    try {
        // 1. Salin data dasar
        let surahData = await salinDataSurah(key)

        // 2. Cek ayat yang belum lengkap
        const ayatBelumLengkap = resume ? cekAyatBelumLengkap(surahData) : Array.from({
            length: val[2]
        }, (_, i) => i + 1)

        if (ayatBelumLengkap.length === 0) {
            console.log(`✅ Semua tafsir surah ${surahNo} sudah lengkap`)

            // Buat versi minified
            try {
                await fs.access(ALQURAN_DIR_MIN)
            } catch {
                await fs.mkdir(ALQURAN_DIR_MIN, {
                    recursive: true
                })
            }

            const filenameMin = `${ALQURAN_DIR_MIN}/Alquran_${surahNo}.min.json`
            await fs.writeFile(filenameMin, JSON.stringify(surahData))

            return true
        }

        console.log(`🔄 Mengambil ${ayatBelumLengkap.length} ayat yang belum lengkap...`)

        // 3. Buat queue untuk pengambilan tafsir
        const queue = new TafsirQueue(concurrency)

        for (const ayat of ayatBelumLengkap) {
            queue.add(async () => {
                const result = await ambilTafsirAyat(surahNo, ayat)

                if (result.success) {
                    // Update nama surah jika ada
                    if (result.title && result.title !== surahData.name) {
                        surahData.name = result.title
                    }

                    // Update data di memory
                    const ayahIndex = ayat - 1
                    surahData.ayahs[ayahIndex] = {
                        ...surahData.ayahs[ayahIndex],
                        ...result.data
                    }
                }

                return result
            })
        }

        // 4. Proses queue
        await queue.process()

        // 5. Simpan ke file JSON
        const filename = `${ALQURAN_DIR}/Alquran_${surahNo}.json`
        await fs.writeFile(filename, JSON.stringify(surahData, null, 4))

        // 6. Buat versi minified
        try {
            await fs.access(ALQURAN_DIR_MIN)
        } catch {
            await fs.mkdir(ALQURAN_DIR_MIN, {
                recursive: true
            })
        }

        const filenameMin = `${ALQURAN_DIR_MIN}/Alquran_${surahNo}.min.json`
        await fs.writeFile(filenameMin, JSON.stringify(surahData))

        console.log(`\n✅ Surah ${surahNo} selesai diproses`)
        console.log(`📊 Statistik: ${queue.completed} berhasil, ${queue.failed} gagal`)

        return queue.failed === 0

    } catch (error) {
        console.error(`❌ Error memproses surah ${surahNo}:`, error.message)
        return false
    }
}

/* =========================
   MODE 3: JSON → DB
========================= */

async function migrateJSONtoDB(surahNo) {
    console.log(`\n📁 Migrasi surah ${surahNo}...`)

    const filename = `${ALQURAN_DIR}/Alquran_${surahNo}.json`

    try {
        // Baca file JSON
        const surahData = JSON.parse(await fs.readFile(filename, "utf8"))

        console.log(`📊 Surah: ${surahData.name}, Total ayat: ${surahData.ayahs.length}`)

        // Simpan surah ke database
        await dbQueue.add(async () => {
            await db.exec(`
        INSERT OR REPLACE INTO surahs (no, name, ar, en, "id", ayat, place)
        VALUES (
          ${surahData.number},
          '${esc(surahData.name)}',
          '${esc(surahData.ar)}',
          '${esc(surahData.en)}',
          '${esc(surahData.id)}',
          ${surahData.numberOfAyahs},
          '${esc(surahData.revelationType)}'
        )
      `)
        })

        // Proses setiap ayat
        let successCount = 0
        let failCount = 0

        for (let i = 0; i < surahData.ayahs.length; i++) {
            const ayah = surahData.ayahs[i]
            const ayahNo = i + 1

            try {
                await simpanAyatToDB(surahNo, ayahNo, ayah)
                successCount++

                // Tampilkan progress
                if ((i + 1) % 10 === 0 || i === surahData.ayahs.length - 1) {
                    const progress = Math.round((i + 1) / surahData.ayahs.length * 100)
                    process.stdout.write(`\r📊 Progress: ${i + 1}/${surahData.ayahs.length} ayat (${progress}%)`)
                }

            } catch (error) {
                console.error(`\n❌ Gagal migrasi ayat ${ayahNo}:`, error.message)
                failCount++
            }
        }

        // Tunggu semua operasi database selesai
        await dbQueue.waitUntilEmpty()

        console.log(`\n✅ Migrasi selesai: ${successCount} berhasil, ${failCount} gagal`)
        return failCount === 0

    } catch (error) {
        console.error(`❌ Gagal migrasi surah ${surahNo}:`, error.message)
        return false
    }
}

// Rebuild FTS tables
async function rebuildFTS() {
    console.log("\n🔄 Rebuilding FTS tables...")
    try {
        await dbQueue.add(async () => {
            await db.execMany([
                "INSERT INTO surahs_fts(surahs_fts) VALUES ('rebuild')",
                "INSERT INTO ayahs_fts(ayahs_fts) VALUES ('rebuild')",
                "INSERT INTO translations_fts(translations_fts) VALUES ('rebuild')",
                "INSERT INTO tafsirs_fts(tafsirs_fts) VALUES ('rebuild')"
            ])
        })
        await dbQueue.waitUntilEmpty()
        console.log("✅ FTS tables rebuilt")
    } catch (error) {
        console.error("❌ Error rebuilding FTS:", error.message)
    }
}

/* =========================
   FUNGSI UTAMA
========================= */
let dbQueue = null

async function main() {
    const options = parseArgs()

    // Aktifkan debug jika diperlukan
    if (process.env.DEBUG_SQL) {
        enableDebug(true)
    }

    console.log("=".repeat(60))
    console.log("📖 QURAN TAFSIR SCRAPER - 3 MODES")
    console.log("=".repeat(60))

    const modeNames = {
        1: "Web → JSON & DB",
        2: "Web → JSON",
        3: "JSON → DB"
    }

    console.log(`Mode: ${options.mode} (${modeNames[options.mode]})`)
    console.log(`Start: surah ${options.start}`)
    if (options.surah) console.log(`Single surah: ${options.surah}`)
    console.log(`Concurrency: ${options.concurrency}`)
    console.log(`Batch mode: ${options.batch}`)
    console.log(`Resume mode: ${options.resume}`)
    console.log("=".repeat(60))

    // Buat folder alquran jika belum ada
    try {
        await fs.access(ALQURAN_DIR)
    } catch {
        await fs.mkdir(ALQURAN_DIR, {
            recursive: true
        })
    }

    // Buka koneksi database untuk mode 1 & 3
    if (options.mode === 1 || options.mode === 3) {
        console.log("\n🚀 Opening database connection...")
        db = await openDB(DB_PATH)

        // Inisialisasi database queue (HANYA 1 concurrent untuk database)
        dbQueue = new DatabaseQueue(db, 1)

        await sleep(1000)
    }

    try {
        // Tentukan surah yang akan diproses
        const surahsToProcess = []

        if (options.surah) {
            if (options.surah >= 1 && options.surah <= List.length) {
                surahsToProcess.push(options.surah)
            } else {
                console.error(`❌ Surah ${options.surah} tidak valid`)
                return
            }
        } else if (options.batch) {
            for (let i = options.start; i <= List.length; i++) {
                surahsToProcess.push(i)
            }
        } else {
            surahsToProcess.push(options.start)
        }

        console.log(`📋 Total surah yang akan diproses: ${surahsToProcess.length}`)

        let totalSuccess = 0
        let totalFailed = 0
        let failedName = []

        for (const surahNo of surahsToProcess) {
            const key = surahNo - 1

            console.log(`\n📖 ========================================`)
            console.log(`📖 Proses surah ${surahNo}: ${List[key][0]}`)
            console.log(`📖 ========================================`)

            let success = false

            try {
                switch (options.mode) {
                    case 1:
                        success = await processSurahMode1(surahNo, options.concurrency, options.resume)
                        break

                    case 2:
                        success = await processSurahMode2(surahNo, options.concurrency, options.resume)
                        break

                    case 3:
                        success = await migrateJSONtoDB(surahNo)
                        break

                    default:
                        console.error(`❌ Mode ${options.mode} tidak dikenali`)
                        return
                }

                if (success) {
                    totalSuccess++
                } else {
                    totalFailed++
                }

            } catch (error) {
                console.error(`❌ Error memproses surah ${surahNo}:`, error.message)
                totalFailed++
                failedName.push(List[key][0])
            }

            // Jeda antar surah
            if (surahNo !== surahsToProcess[surahsToProcess.length - 1]) {
                const delay = options.mode === 1 || options.mode === 2 ? 3000 : 1000
                console.log(`\n⏳ Menunggu ${delay/1000} detik sebelum surah berikutnya...`)
                await sleep(delay)
            }
        }

        // Rebuild FTS untuk mode 1 & 3
        if ((options.mode === 1 || options.mode === 3) && db) {
            await rebuildFTS()
        }

        console.log("\n" + "=".repeat(60))
        console.log("🎉 PROSES SELESAI!")
        console.log("=".repeat(60))
        console.log(`📊 Statistik: ${totalSuccess} surah berhasil, ${totalFailed} surah gagal ${failedName.join(", ")}`)
        console.log(`📊 Mode: ${modeNames[options.mode]}`)

        if (options.mode === 1 || options.mode === 3) {
            console.log(`💾 Database: ${DB_PATH}`)
        }

        if (options.mode === 1 || options.mode === 2) {
            console.log(`📁 JSON files: ${ALQURAN_DIR}/`)
            console.log(`📁 Minified JSON: ${ALQURAN_DIR_MIN}/`)
        }

        console.log("=".repeat(60))

    } catch (error) {
        console.error("\n❌ Error utama:", error.message)
        console.error(error.stack)
    } finally {
        // Tutup koneksi database
        if (db) {
            db.close()
        }
    }
}

// Jalankan aplikasi
if (process.argv[1] === fileURLToPath(
        import.meta.url)) {
    main().catch(console.error)
}