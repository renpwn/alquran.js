import { openDB } from './setting.db.js'

/* =====================================
   FUZZY CORE (DRY – SINGLE SOURCE)
===================================== */
function compareTwoStrings(first, second) {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (first === second) return 1
  if (first.length < 2 || second.length < 2) return 0

  const map = new Map()
  for (let i = 0; i < first.length - 1; i++) {
    const bg = first.substring(i, i + 2)
    map.set(bg, (map.get(bg) || 0) + 1)
  }

  let intersection = 0
  for (let i = 0; i < second.length - 1; i++) {
    const bg = second.substring(i, i + 2)
    const count = map.get(bg) || 0
    if (count > 0) {
      map.set(bg, count - 1)
      intersection++
    }
  }

  return (2 * intersection) / (first.length + second.length - 2)
}

function correct(main, targets) {
  let bestIndex = 0
  let bestRating = 0

  const ratings = targets.map((t, i) => {
    const rating = compareTwoStrings(main, t)
    if (rating > bestRating) {
      bestRating = rating
      bestIndex = i
    }
    return { target: t, rating }
  })

  return {
    all: ratings,
    indexAll: bestIndex,
    result: ratings[bestIndex]?.target,
    rating: ratings[bestIndex]?.rating || 0
  }
}

/* =====================================
   UTIL
===================================== */
const normalizeSurah = s =>
  s.toLowerCase()
    .replace(/^al\s+/i, '')
    .replace(/[^a-z]/g, '')

const parseAyatRange = (input, maxAyat) => {
  const MAX = 5

  if (!input) {
    const r = Math.floor(Math.random() * maxAyat) + 1
    return { start: r, end: r }
  }

  if (input.includes('-')) {
    let [s, e] = input.split('-').map(Number)
    s = Math.max(1, Math.min(s, maxAyat))
    e = Math.min(maxAyat, e || maxAyat)
    if (e - s + 1 > MAX) e = s + MAX - 1
    return { start: s, end: e }
  }

  const a = Math.max(1, Math.min(Number(input), maxAyat))
  return { start: a, end: a }
}

/* =====================================
   MAIN HANDLER (DB ONLY)
===================================== */
export default async function alquranHandler(input = '', options = {}) {
  const db = await openDB()

  /* ========= TAFSIR ========= */
  const availableTafsirs = [
    'kemenag_ringkas',
    'kemenag',
    'ibnu_katsir',
    'jalalain',
    'quraish_shihab'
  ]
  const tafsir =
    options.tafsir ||
    availableTafsirs[Math.floor(Math.random() * availableTafsirs.length)]

  /* ========= LOAD SURAH LIST ========= */
  const surahs = await db.all(`
    SELECT no, name, id, ayat
    FROM surahs
    ORDER BY no
  `)

  const surahNames = surahs.map(s => normalizeSurah(s.name))

  input = input.trim().replace(':', ' ')
  const parts = input.split(/\s+/).filter(Boolean)

  let surahNum
  let ayatInput
  let debug = null

  /* ========= PARSE INPUT ========= */
  if (!parts.length) {
    surahNum = Math.floor(Math.random() * 114) + 1
  }
  else if (!isNaN(parts[0])) {
    surahNum = Number(parts[0])
    ayatInput = parts[1]
  }
  else {
    const last = parts[parts.length - 1]
    const isAyat = !isNaN(last) || last.includes('-')

    const surahName = isAyat
      ? parts.slice(0, -1).join(' ')
      : parts.join(' ')

    if (isAyat) ayatInput = last

    const raw = normalizeSurah(surahName)
    const guess = correct(raw, surahNames)

    debug = {
      input: raw,
      bestMatch: guess.result,
      rating: Number(guess.rating.toFixed(3)),
      top5: guess.all
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(x => ({
          surah: surahs[surahNames.indexOf(x.target)]?.name,
          rating: Number(x.rating.toFixed(3))
        }))
    }

    surahNum =
      guess.rating < 0.25
        ? Math.floor(Math.random() * 114) + 1
        : guess.indexAll + 1
  }

  if (surahNum < 1 || surahNum > 114) {
    surahNum = Math.floor(Math.random() * 114) + 1
  }

  const surah = surahs[surahNum - 1]
  if (!surah) throw new Error('Surah not found')

  const { start, end } = parseAyatRange(ayatInput, surah.ayat)

  /* ========= AUDIO OFFSET ========= */
  const offsetRow = await db.get(
    `SELECT SUM(ayat) AS total FROM surahs WHERE no < ?`,
    [surahNum]
  )
  const offset = offsetRow?.total || 0

  /* ========= AYAH QUERY ========= */
  const ayahs = await db.all(
    `
    SELECT
      a.id,
      a.ayat,
      a.text_ar,
      a.text_latin,
      t.text AS tafsir
    FROM ayahs a
    LEFT JOIN tafsirs t
      ON t.ayah_id = a.id
     AND t.kitab = ?
    WHERE a.surah_id = ?
      AND a.ayat BETWEEN ? AND ?
    ORDER BY a.ayat
    `,
    [tafsir, surahNum, start, end]
  )

  const resultAyahs = ayahs.map((a, i) => {
    const noAudio = offset + start + i
    return {
      ayah: a.ayat,
      arab: a.text_ar,
      transliterasi: a.text_latin,
      tafsir: a.tafsir || null,
      noAudio,
      audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${noAudio}.mp3`
    }
  })

  return {
    surahNumber: surahNum,
    surah: surah.name,
    arti: surah.id,
    range: start === end ? `${start}` : `${start}-${end}`,
    totalAyat: surah.ayat,
    tafsir,
    ayahs: resultAyahs,
    debug
  }
}