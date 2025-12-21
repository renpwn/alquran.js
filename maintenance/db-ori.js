import Database from '@renpwn/termux-sqlite3'
import fs from 'fs'
import path from 'path'

const DEFAULT_DB = 'quran.db'

export async function openDB(dbFile = DEFAULT_DB) {
  // ===============================
  // 1️⃣ PATH ABSOLUTE (WAJIB)
  // ===============================
  const dbPath = path.resolve(process.cwd(), dbFile)

  // ===============================
  // 2️⃣ HAPUS DB LAMA (OPSIONAL)
  // ===============================
  if (fs.existsSync(dbPath)) {
    console.log('🗑 Removing old database...')
    fs.unlinkSync(dbPath)
  }

  console.log('🚀 Opening database:', dbPath)

  // ===============================
  // 3️⃣ OPEN DATABASE
  // ===============================
  const db = new Database(dbPath, {
    timeout: 30000,
    maxRetries: 3,
    poolSize: 2
  })

  // ===============================
  // 4️⃣ TEST KONEKSI (SYNC POINT)
  // ===============================
  try {
    await db.exec('SELECT 1')
    console.log('✅ Database connection OK')
  } catch (e) {
    throw new Error('Database open failed: ' + e.message)
  }

  // ===============================
  // 5️⃣ INIT SCHEMA (ASYNC — AWAIT!)
  // ===============================
  console.log('📊 Initializing schema...')

  const schemaSQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS surahs (
    no INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    ar TEXT,
    en TEXT,
    "id" TEXT,
    ayat INTEGER NOT NULL,
    place TEXT CHECK (place IN ('Meccan','Medinan'))
  );

  CREATE TABLE IF NOT EXISTS ayahs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id INTEGER NOT NULL,
    ayat INTEGER NOT NULL,
    text_ar TEXT NOT NULL,
    text_latin TEXT,
    FOREIGN KEY (surah_id) REFERENCES surahs(no) ON DELETE CASCADE,
    UNIQUE(surah_id, ayat)
  );

  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ayah_id INTEGER NOT NULL,
    lang TEXT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (ayah_id) REFERENCES ayahs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tafsirs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ayah_id INTEGER NOT NULL,
    kitab TEXT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (ayah_id) REFERENCES ayahs(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_ayahs_surah_ayat
    ON ayahs(surah_id, ayat);

  CREATE INDEX IF NOT EXISTS idx_translations_ayah_id
    ON translations(ayah_id);

  CREATE INDEX IF NOT EXISTS idx_tafsirs_ayah_id
    ON tafsirs(ayah_id);
  `
  
  const ftsSQL = `
  -- FTS5 TABLES
  CREATE VIRTUAL TABLE IF NOT EXISTS surahs_fts USING fts5(
    name, ar, en, "id",
    content='surahs',
    content_rowid='no'
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS ayahs_fts USING fts5(
    text_ar, text_latin,
    content='ayahs',
    content_rowid='id'
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS translations_fts USING fts5(
    text,
    content='translations',
    content_rowid='id'
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS tafsirs_fts USING fts5(
    text,
    content='tafsirs',
    content_rowid='id'
  );
  `

  try {
    await db.exec(schemaSQL)
    console.log('✅ Schema created')
    await db.exec(ftsSQL)
    console.log('✅ FTS5 created')
  } catch (e) {
    console.error('❌ Schema FAILED:', e)
    throw e
  }

  // ===============================
  // 6️⃣ VERIFIKASI TABEL (DEBUG REAL)
  // ===============================
  const tables = await db.all(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `)

  if (!tables.length) {
    throw new Error('Schema verification failed: no tables created')
  }

  console.log(
    '📋 Tables:',
    tables.map(t => t.name).join(', ')
  )

  // ===============================
  // 7️⃣ RETURN DB (NO AUTO CLOSE!)
  // ===============================
  return {
    exec: (sql) => db.exec(sql),
    run: (sql, params) => db.run(sql, params),
    get: (sql, params) => db.get(sql, params),
    all: (sql, params) => db.all(sql, params),
    prepare: (sql) => db.prepare(sql),
  
    // ✅ TRANSACTION DIPASS-THROUGH
    transaction(fn, options) {
      return db.transaction(fn, options)
    },
  
    async close() {
      try {
        await db.exec('PRAGMA wal_checkpoint(FULL)')
      } catch {}
      await db.close()
      console.log('✅ Database closed')
    },
  
    _db: db
  }
}