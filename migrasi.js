import fs from "fs";
import path from "path";
import { openDB } from "./db.js";

const ALQURAN_DIR = "./alquran";
const LIST_QURAN = "./ListQuran.json";

function esc(s = "") {
  if (!s) return "";
  return s
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .trim();
}

async function importSurahs(db) {
  console.log("📥 Import surahs...");
  const data = JSON.parse(fs.readFileSync(LIST_QURAN, "utf8"));
  
  const values = [];
  for (const s of data.quran) {
    values.push(`(
      ${s.number},
      '${esc(s.name)}',
      '',
      '',
      '${esc(s.translation)}',
      ${s.ayahs},
      '${s.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'}'
    )`);
  }
  
  const sql = `INSERT INTO surahs (no, name, ar, en, "id", ayat, place) VALUES ${values.join(",")};`;
  
  await db.exec(sql);
  console.log(`✅ Imported ${data.quran.length} surahs`);
}

async function importAyahsAndTafsir(db) {
  const files = fs.readdirSync(ALQURAN_DIR)
    .filter(f => f.endsWith(".json"))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });

  console.log(`📥 Processing ${files.length} surah files...`);

  // Hitung total ayat terlebih dahulu untuk progress bar
  let totalAyahs = 0;
  const surahInfo = [];
  
  for (const file of files) {
    try {
      const json = JSON.parse(
        fs.readFileSync(path.join(ALQURAN_DIR, file), "utf8")
      );
      totalAyahs += json.ayahs.length;
      surahInfo.push({
        file,
        number: json.number,
        name: json.englishNameTranslation,
        ayatCount: json.ayahs.length
      });
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
  
  console.log(`📊 Total ayat: ${totalAyahs}`);

  let totalProcessed = 0;
  
  for (const [index, file] of files.entries()) {
    try {
      const json = JSON.parse(
        fs.readFileSync(path.join(ALQURAN_DIR, file), "utf8")
      );

      console.log(`\n📖 Processing Surah ${json.number}: ${json.englishNameTranslation} (${index + 1}/${files.length})`);
      
      // Update surah metadata
      await db.exec(`
        UPDATE surahs SET
          ar = '${esc(json.name)}',
          en = '${esc(json.englishNameTranslation)}',
          place = '${esc(json.revelationType)}'
        WHERE no = ${json.number};
      `);

      // Process each ayah with detailed progress
      for (let i = 0; i < json.ayahs.length; i++) {
        const a = json.ayahs[i];
        const ayatNum = i + 1;
        
        // Show progress: "Processing Surah 2: The Cow (2/114) (24/286)"
        const progressText = `Surah ${json.number}: ${json.englishNameTranslation} (${index + 1}/${files.length}) (${ayatNum}/${json.ayahs.length})`;
        
        // Update progress every ayah or every 10th ayah for long surahs
        if (json.ayahs.length > 50 && ayatNum % 10 === 0) {
          process.stdout.write(`\r📜 ${progressText}`);
        } else if (json.ayahs.length <= 50) {
          process.stdout.write(`\r📜 ${progressText}`);
        }

        // Insert ayah
        await db.exec(`
          INSERT INTO ayahs (surah_id, ayat, text_ar, text_latin)
          VALUES (
            ${json.number},
            ${ayatNum},
            '${esc(a.arb)}',
            '${esc(a.transliterasi)}'
          );
        `);

        // Insert translation
        await db.exec(`
          INSERT INTO translations (ayah_id, lang, text)
          VALUES (
            (SELECT id FROM ayahs WHERE surah_id = ${json.number} AND ayat = ${ayatNum}),
            'id',
            '${esc(a.ind)}'
          );
        `);

        // Insert tafsirs
        const tafsirs = [
          ["kemenag", a.kemenag],
          ["jalalain", a.jalalain],
          ["ibnu_katsir", a.ibnu_katsir],
          ["quraish_shihab", a.quraish_shihab],
        ];

        for (const [kitab, text] of tafsirs) {
          if (text && text.trim()) {
            await db.exec(`
              INSERT INTO tafsirs (ayah_id, kitab, text)
              VALUES (
                (SELECT id FROM ayahs WHERE surah_id = ${json.number} AND ayat = ${ayatNum}),
                '${kitab}',
                '${esc(text)}'
              );
            `);
          }
        }
        
        totalProcessed++;
        
        // Show overall progress every 100 ayat
        if (totalProcessed % 100 === 0) {
          const percent = ((totalProcessed / totalAyahs) * 100).toFixed(1);
          console.log(`\n📊 Overall: ${totalProcessed}/${totalAyahs} ayat (${percent}%)`);
        }
      }
      
      // Clear line and show completion
      process.stdout.write("\r" + " ".repeat(100) + "\r");
      console.log(`✅ Surah ${json.number} selesai (${json.ayahs.length} ayat)`);

      // Small delay every 10 surahs
      if ((index + 1) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`\n❌ Error processing file ${file}:`, error);
      throw error;
    }
  }
  
  console.log(`\n🎯 Selesai! Total: ${totalProcessed} ayat diproses`);
}

async function rebuildFTS(db) {
  console.log("🔄 Rebuild FTS...");
  try {
    console.log("🔄 Rebuilding surahs_fts...");
    await db.exec("INSERT INTO surahs_fts(surahs_fts) VALUES ('rebuild');");
    
    console.log("🔄 Rebuilding ayahs_fts...");
    await db.exec("INSERT INTO ayahs_fts(ayahs_fts) VALUES ('rebuild');");
    
    console.log("🔄 Rebuilding translations_fts...");
    await db.exec("INSERT INTO translations_fts(translations_fts) VALUES ('rebuild');");
    
    console.log("🔄 Rebuilding tafsirs_fts...");
    await db.exec("INSERT INTO tafsirs_fts(tafsirs_fts) VALUES ('rebuild');");
    
    console.log("✅ FTS rebuilt successfully");
  } catch (error) {
    console.error("❌ Error rebuilding FTS:", error);
    throw error;
  }
}

/* ===== MAIN EXECUTION ===== */
async function main() {
  console.time("⏱ Import total");
  
  try {
    // Open database connection
    console.log("🚀 Opening database...");
    const db = openDB("quran.db");
    
    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Execute imports
    await importSurahs(db);
    await importAyahsAndTafsir(db);
    await rebuildFTS(db);
    
    // Close database
    await db.close();
    
    console.timeEnd("⏱ Import total");
    console.log("🎉 IMPORT BERHASIL!");
    
  } catch (error) {
    console.error("❌ IMPORT GAGAL:", error);
    process.exit(1);
  }
}

// Run main function
main();