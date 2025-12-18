import { execFile } from "child_process"
import fs from "fs"
import { promisify } from "util"

const DEFAULT_DB = "quran.db"

export async function openDB(dbPath = DEFAULT_DB) {
  // Hapus database lama
  if (fs.existsSync(dbPath)) {
    console.log("🗑 Menghapus database lama...")
    fs.unlinkSync(dbPath)
  }

  // Create empty database file first
  fs.writeFileSync(dbPath, "")

  // Use sqlite3 command line directly
  const runSQL = async (sql) => {
    return new Promise((resolve, reject) => {
      const tempFile = `temp_${Date.now()}.sql`
      fs.writeFileSync(tempFile, sql)
      
      execFile("sqlite3", [dbPath, `.read ${tempFile}`], (error, stdout, stderr) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile)
        } catch (e) {}
        
        if (error) {
          reject(new Error(`SQLite error: ${stderr || error.message}`))
          return
        }
        
        if (stderr && !stderr.includes("row(s) inserted")) {
          console.warn("SQLite warning:", stderr)
        }
        
        resolve(stdout)
      })
    })
  }

  // Initialize database SYNCHRONOUSLY
  const initSQL = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';

-- Surahs
CREATE TABLE IF NOT EXISTS surahs (
    no INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    ar TEXT,
    en TEXT,
    "id" TEXT,
    ayat INTEGER NOT NULL,
    place TEXT CHECK (place IN ('Meccan','Medinan'))
);

-- Ayahs
CREATE TABLE IF NOT EXISTS ayahs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL REFERENCES surahs(no) ON DELETE CASCADE,
    ayat INTEGER NOT NULL,
    text_ar TEXT NOT NULL,
    text_latin TEXT,
    UNIQUE(surah_id, ayat)
);

-- Translations
CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ayah_id INTEGER NOT NULL REFERENCES ayahs(id) ON DELETE CASCADE,
    lang TEXT NOT NULL,
    text TEXT NOT NULL
);

-- Tafsirs
CREATE TABLE IF NOT EXISTS tafsirs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ayah_id INTEGER NOT NULL REFERENCES ayahs(id) ON DELETE CASCADE,
    kitab TEXT NOT NULL,
    text TEXT NOT NULL
);

-- FTS5
CREATE VIRTUAL TABLE IF NOT EXISTS surahs_fts USING fts5(name, ar, en, "id", content='surahs', content_rowid='no');
CREATE VIRTUAL TABLE IF NOT EXISTS ayahs_fts USING fts5(text_ar, text_latin, content='ayahs', content_rowid='id');
CREATE VIRTUAL TABLE IF NOT EXISTS translations_fts USING fts5(text, content='translations', content_rowid='id');
CREATE VIRTUAL TABLE IF NOT EXISTS tafsirs_fts USING fts5(text, content='tafsirs', content_rowid='id');
`

  try {
    await runSQL(initSQL)
    console.log("✅ Database initialized")
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message)
    throw error
  }

  return {
    async exec(sql) {
      try {
        await runSQL(sql)
        return true
      } catch (error) {
        console.error("SQL Error:", error.message)
        console.error("Problematic SQL:", sql.substring(0, 200) + "...")
        throw error
      }
    },

    async execMany(sqlStatements) {
      const batch = sqlStatements.join(";\n")
      return this.exec(batch)
    },

    async query(sql) {
      return new Promise((resolve, reject) => {
        const tempFile = `temp_query_${Date.now()}.sql`
        fs.writeFileSync(tempFile, sql)
        
        execFile("sqlite3", [dbPath, "-json", `.read ${tempFile}`], (error, stdout, stderr) => {
          try {
            fs.unlinkSync(tempFile)
          } catch (e) {}
          
          if (error) {
            reject(new Error(`Query error: ${stderr || error.message}`))
            return
          }
          
          try {
            if (stdout.trim()) {
              const result = JSON.parse(stdout)
              resolve(Array.isArray(result) ? result : [result])
            } else {
              resolve([])
            }
          } catch (parseError) {
            resolve([]) // Return empty array if no results
          }
        })
      })
    },

    close() {
      console.log("✅ Database connection closed")
    }
  }
}