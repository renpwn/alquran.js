const { sleep } = require('./lib/Function')
const fs = require("fs").promises
const cheerio = require("cheerio")
const axios = require("axios")

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
   FUNGSI AMBIL TAFSIR
========================= */

fetchUrl = async (url, options = {}) => {
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
        'user-agent': 'Solaretour/1.0.0',
        ...utf8
      },
      ...options
    })

    return res.data   // ✅ STRING / HTML
  } catch (err) {
    throw err         // ✅ JANGAN return error
  }
}

async function salin(key) {
  const val = List[key]
  const filename = `../renpwn/database/alquran/Alquran_${key+1}.json`
  const newfilename = `./alquran/Alquran_${key+1}.json`

  const raw = await fs.readFile(filename, "utf8")
  const res = JSON.parse(raw)

  let isibaru = res.data[0]
  delete isibaru.edition

  res.data[0].ayahs.forEach((ay, keyay) => {
    isibaru.ayahs[keyay] = {
      ind: res.data[0].ayahs[keyay].text,
      arb: res.data[1].ayahs[keyay].text,
      transliterasi: "",
      eng: res.data[2].ayahs[keyay].text
    }
  })

  await fs.writeFile(newfilename, JSON.stringify(isibaru, null, 4))
  console.log("✔ salin:", val[0], res)
}

async function ambilweb(key, ayat = 1) {
  const val = List[key]

  let slug =
    (key+1 === 83)  ? "al-tatfif" :
    (key+1 === 40)  ? "al-mu-min" :
    (key+1 === 108) ? "al-kausar" :
    val[0].replace(/[ ']/g, "-").toLowerCase().replace("--","-")

  let surat = `${key+1}-${slug}`.replace("--","-")
  if (surat.endsWith("-")) surat = surat.slice(0, -1)

  const url = `https://qurano.com/id/${surat}/ayat-${ayat}/`
  const html = await fetchUrl(url)

  const filename = `./alquran/Alquran_${key+1}.json`
  const raw = await fs.readFile(filename, "utf8")
  const res = JSON.parse(raw)

  const $ = cheerio.load(html)

  const trans = $("div.transliteration").text()
  console.log("cek trans", trans)
  res.ayahs[ayat-1].transliterasi = trans.split("(")[0].trim()

  const formater = (id) => {
    let txt = $(`article#${id}`).find("p").html()
    if (!txt) return ""
    return txt.replace(/<br>/g, "\n").replace(/<em>|<\/em>/g, "_")
  }

  res.ayahs[ayat-1] = {
    ...res.ayahs[ayat-1],
    kemenag_ringkas: formater("kemenag_ringkas"),
    kemenag: formater("kemenag"),
    ibnu_katsir: formater("ibnu_katsir"),
    jalalain: formater("jalalain"),
    quraish_shihab: formater("quraish_shihab"),
    saadi: formater("saadi")
  }

  await fs.writeFile(filename, JSON.stringify(res, null, 4))
  console.log(`✔ ${surat} ayat ${ayat}`)

  if (ayat < val[2]) {
    await sleep(1000)
    return ambilweb(key, ayat + 1)
  }else if(key < 114){
    key++
    await salin(key)
    await ambilweb(key, 1)
  }
}

/* =========================
   JALANKAN
========================= */
(async () => {
  const key = 0
  await salin(key)
  await ambilweb(key, 1)
})()