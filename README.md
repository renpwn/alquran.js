# 📖 Al-Qur’an Tafsir JSON Dataset

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Dataset](https://img.shields.io/badge/Dataset-114%20Surah-blue.svg)
![Format](https://img.shields.io/badge/Format-JSON-orange.svg)
![Tafsir](https://img.shields.io/badge/Tafsir-Kemenag%20%7C%20Ibnu%20Katsir%20%7C%20Jalalain%20%7C%20Quraish%20Shihab-purple.svg)
![Language](https://img.shields.io/badge/Language-Arabic%20%7C%20Indonesian%20%7C%20English-lightgrey.svg)

## 🙋‍♂️ Perkenalan

👨‍💻 **Ardy Ren**  
Web Programmer dengan pengalaman lebih dari 5 tahun membangun aplikasi menggunakan **PHP, JavaScript, Node.js, dan Python**.  
Fokus pada **backend development, integrasi API, manajemen server, bot automation**, serta **cross-platform development** dengan Arduino, C++, C#, dan Delphi.  

---

**Deskripsi**  
Repositori ini menyediakan dataset Al-Qur’an dalam format JSON: file ringkasan 114 surah (`📄 ListQuran.json`) dan file detail per-surah (`📂 Alquran_{n}.json`) berisi teks Arab, transliterasi, terjemahan, dan beberapa tafsir.  
Format rapi: *array of objects* untuk kemudahan parsing.

---

## 📂 Struktur folder & isi file

| Path | Tipe | Deskripsi |
|------|------|-----------|
| `README.md` | 📘 file | Dokumentasi (keterangan, cara penggunaan, contoh) |
| `LICENSE` | 📜 file | MIT License |
| `ListQuran.json` | 📄 file | Daftar 114 surah (nomor, nama Latin, arti, jumlah ayat). |
| `alquran/Alquran_{n}.json` | 📂 folder/files | File detail per surah (versi normal, rapi, mudah dibaca). |
| `alquran_min/Alquran_{n}.json` | 📂 folder/files | File detail per surah (versi minify, hemat ukuran ±1.96%). |
| `examples/` | 💻 folder | Contoh penggunaan (Node.js & Python) |

---

## 📑 Contoh `ListQuran.json` (potongan)
```json
{
  "quran": [
    { "number": 1, "name": "Al Fatihah", "translation": "Pembuka", "ayahs": 7 },
    { "number": 2, "name": "Al Baqarah", "translation": "Sapi Betina", "ayahs": 286 }
  ]
}
```

## 📑 Contoh `Alquran_103.json` (potongan)
```json
{
  "number": 103,
  "name": "سُورَةُ العَصۡرِ",
  "englishName": "Al-Asr",
  "englishNameTranslation": "The Declining Day, Epoch",
  "revelationType": "Meccan",
  "numberOfAyahs": 3,
  "ayahs": [
    {
      "index": 1,
      "ind": "Demi masa.",
      "arb": "وَالْعَصْرِ",
      "transliterasi": "Wal-`Asr",
      "eng": "CONSIDER the flight of time!",
      "tafsir": {
        "kemenag_ringkas": "...",
        "kemenag": "...",
        "ibnu_katsir": "...",
        "jalalain": "...",
        "quraish_shihab": "..."
      }
    }
  ]
}
```

---

## 🚀 Cara penggunaan

### ▶️ Node.js (contoh)
```js
const fs = require('fs').promises;
const path = require('path');

async function readJSON(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const base = path.join(__dirname, '..');
  const list = await readJSON(path.join(base, 'ListQuran.json'));
  console.log('Jumlah surah:', list.quran.length);

  const surahMeta = list.quran.find(s => s.number === 103);
  console.log('Surah 103 meta:', surahMeta);

  const surahDetail = await readJSON(path.join(base, 'alquran', 'Alquran_103.json'));
  console.log('Surah detail:', surahDetail.number, surahDetail.englishName);

  const ayat1 = surahDetail.ayahs.find(a => a.index === 1);
  console.log('Ayat 1 arab:', ayat1.arb);
  console.log('Tafsir kemenag ringkas:', ayat1.tafsir?.kemenag_ringkas);
}

main().catch(console.error);
```

### 🐍 Python (contoh)
```py
import json
from pathlib import Path

base = Path(__file__).resolve().parents[1]

def read_json(p): 
    return json.loads(p.read_text(encoding='utf8'))

def main():
    list_q = read_json(base / 'ListQuran.json')
    print('Jumlah surah:', len(list_q['quran']))

    surah_meta = next(s for s in list_q['quran'] if s['number']==103)
    print('Surah 103 meta:', surah_meta)

    surah_detail = read_json(base / 'alquran' / 'Alquran_103.json')
    ayat1 = next((a for a in surah_detail['ayahs'] if a.get('index')==1), surah_detail['ayahs'][0])
    print('Ayat 1 (Arab):', ayat1['arb'])
    print('Tafsir Ibnu Katsir:', ayat1.get('tafsir', {}).get('ibnu_katsir'))

if __name__ == '__main__':
    main()
```

---

## 🔗 Kombinasi data (surah → ayat → tafsir)
1. Baca `ListQuran.json` → metadata.  
2. Baca `alquran/Alquran_{n}.json` sesuai nomor.  
3. Loop `surah.ayahs` → akses Arab, transliterasi, terjemah, tafsir.  
4. Gabungkan sesuai kebutuhan.

---

## 📚 Penjelasan tafsir

- **📘 kemenag_ringkas** → ringkas, cocok untuk awam.  
- **📘 kemenag** → lengkap, bahasa resmi.  
- **📖 ibnu_katsir** → klasik, rujukan hadis, studi mendalam.  
- **📖 jalalain** → ringkas, padat.  
- **📖 quraish_shihab** → modern, mudah dipahami.

**Rekomendasi:**  
- Mobile: gunakan `kemenag_ringkas` + `quraish_shihab`.  
- Kajian: `ibnu_katsir` + `kemenag`.  
- Sediakan pilihan untuk pengguna.

---

## 📎 Sumber data
- 📖 Qur’an & Audio → [Islamic Network](https://islamic.network/)  
- 📚 Tafsir → [Qurano](https://qurano.com/)  
- 📜 Hadis → [Ilmu Islam](https://ilmuislam.id/)  
- 🎧 Murottal Qur’an: [Google Drive](https://drive.google.com/drive/folders/1GWvlW5HGBDkbvSFMb46AsqE7UA5XAT22), [IslamDownload](https://islamdownload.net/124170-murottal-al-quran-dan-terjemahannya-oleh-syaikh-misyari-rasyid.html), [Archive.org](https://archive.org/details/AlQuranTerjemahanBahasaIndonesiaArabic), [Spotify](https://open.spotify.com/show/32VV2OExP3MRGe7mNkP2mh?si=MWNDI0qVS02APQ7TrIOSBg)  

### 👥 Komunitas
- 📸 Instagram → [@langit.quran](https://instagram.com/langit.quran)  
- 💬 WhatsApp Group → [Join Group](https://chat.whatsapp.com/IQFzaK1AIlz3uRALVBKRA8)  
- 📢 WhatsApp Channel → [Join Channel](https://whatsapp.com/channel/0029VaZzOuI3rZZY5YLVQP0W)  
- 📡 Telegram → [Channel](https://t.me/renpwn_quranhadis)  

---

## 📊 Summary Ukuran Dataset

- **Total versi normal**: 42,786,872 bytes (~42.8 MB)  
- **Total versi minify**: 41,949,292 bytes (~41.9 MB)  
- **Penghematan**: 837,580 bytes (~0.84 MB)  
- **Efisiensi**: 🟢 **1.96% lebih kecil**  

> 💡 Gunakan versi **normal** untuk pengembangan & debugging, dan versi **minify** untuk distribusi / aplikasi ringan.

---

## ⚖️ Lisensi
MIT License © 2025

---

## 🌐 Temukan saya di sini

- 🐙 GitHub → [RENPWN](https://github.com/hardknockdays)  
- 📸 Instagram → [renpwn_ren](https://instagram.com/renpwn_ren)  
- ▶️ YouTube → [@RenPwn](https://www.youtube.com/@RenPwn)  
- 🎵 TikTok → [renpwn](https://www.tiktok.com/@renpwn)  
- 🛍️ TikTok Shop → [RenPwn](https://www.tiktok.com/@renpwn/shop)  
- 🏬 Tokopedia → [renpwn](https://tokopedia.com/renpwn)  
- 🛒 Shopee → [renpwn](https://shopee.co.id/renpwn)  
