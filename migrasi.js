import fs from "fs";
import path from "path";
import { openDB } from "./db.js";

const ALQURAN_DIR = "./alquran";
const LIST_QURAN = "./ListQuran.json";

const db = openDB("quran.db");

function esc(s = "") {
  return s.replace(/'/g, "''");
}

function importSurahs() {
  console.log("📥 Import surahs...");
  const data = JSON.parse(fs.readFileSync(LIST_QURAN, "utf8"));

  db.exec("BEGIN;");
  for (const s of data.quran) {
    //console.log(s);
    try{
    db.exec(`
      INSERT OR IGNORE INTO surahs
      (no, name, ar, en, "id", ayat, place)
      VALUES (
        ${s.number},
        '${esc(s.name)}','','',
        '${esc(s.translation)}',
        ${s.ayahs},
        'Meccan'
      );
    `);
    }catch(e){
      console.log(e);
    }
  }
  db.exec("COMMIT;");
}

function importAyahsAndTafsir() {
  const files = fs.readdirSync(ALQURAN_DIR)
    .filter(f => f.endsWith(".json"))
    .sort((a, b) => parseInt(a) - parseInt(b));

  for (const file of files) {
    const json = JSON.parse(
      fs.readFileSync(path.join(ALQURAN_DIR, file), "utf8")
    );

    db.exec("BEGIN;");

    let ayat = 1;

    db.exec(`
      UPDATE surahs SET
        ar = '${esc(json.name)}',
        en = '${esc(json.englishNameTranslation)}',
        place = '${esc(json.revelationType)}'
      WHERE no = ${json.number};
    `);
      
    for (const a of json.ayahs) {
      db.exec(`
        INSERT INTO ayahs (surah_id, ayat, text_ar, text_latin)
        VALUES (
          ${json.number},
          ${ayat},
          '${esc(a.arb)}',
          '${esc(a.transliterasi)}'
        );
      `);

      db.exec(`
        INSERT INTO translations (ayah_id, lang, text)
        VALUES (
          last_insert_rowid(),
          'id',
          '${esc(a.ind)}'
        );
      `);

      const tafsirs = [
        ["kemenag", a.kemenag],
        ["jalalain", a.jalalain],
        ["ibnu_katsir", a.ibnu_katsir],
        ["quraish_shihab", a.quraish_shihab],
      ];

      for (const [kitab, text] of tafsirs) {
        if (text) {
          db.exec(`
            INSERT INTO tafsirs (ayah_id, kitab, text)
            VALUES (
              last_insert_rowid(),
              '${kitab}',
              '${esc(text)}'
            );
          `);
        }
      }

      ayat++;
    }

    db.exec("COMMIT;");
    console.log(`✅ Surah ${json.number} selesai`);
  }
}

function rebuildFTS() {
  console.log("🔄 Rebuild FTS...");
  db.exec(`INSERT INTO ayahs_fts(ayahs_fts) VALUES ('rebuild');`);
  db.exec(`INSERT INTO translations_fts(translations_fts) VALUES ('rebuild');`);
  db.exec(`INSERT INTO tafsirs_fts(tafsirs_fts) VALUES ('rebuild');`);
}

/* ===== RUN ===== */
console.time("⏱ Import total");
importSurahs();
importAyahsAndTafsir();
rebuildFTS();
db.close();
console.timeEnd("⏱ Import total");
console.log("🎉 IMPORT SELESAI (PIPE MODE, SUPER STABIL)");