const fs = require("fs");
const path = require("path");

/* =====================================
   FUZZY CORE (DRY – SINGLE SOURCE)
===================================== */
function compareTwoStrings(first, second) {
  first = first.replace(/\s+/g, '');
  second = second.replace(/\s+/g, '');

  if (first === second) return 1;
  if (first.length < 2 || second.length < 2) return 0;

  let firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.get(bigram) || 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2 * intersectionSize) / (first.length + second.length - 2);
}

/* =====================================
   CORRECT (PAKAI CORE DI ATAS)
===================================== */
function correct(mainString, targetStrings) {
  targetStrings = Array.isArray(targetStrings) ? targetStrings : [];

  const ratings = [];
  let bestMatchIndex = 0;

  for (let i = 0; i < targetStrings.length; i++) {
    const rating = compareTwoStrings(mainString, targetStrings[i]);
    ratings.push({ target: targetStrings[i], rating });
    if (rating > ratings[bestMatchIndex].rating) bestMatchIndex = i;
  }

  const bestMatch = ratings[bestMatchIndex];

  return {
    all: ratings,
    indexAll: bestMatchIndex,
    result: bestMatch.target,
    rating: bestMatch.rating
  };
}

/* =====================================
   PATH & UTIL
===================================== */
const BASE = process.cwd();
const LIST_FILE = path.join(BASE, "ListQuran.json");
const SURAH_DIR = path.join(BASE, "alquran");

const readJSON = f => JSON.parse(fs.readFileSync(f, "utf8"));

const normalizeSurah = s =>
  s.toLowerCase()
    .replace(/^al\s+/i, "")
    .replace(/[^a-z]/g, "");

/* =====================================
   AUDIO INDEX GLOBAL
===================================== */
const getNoAudio = (list, surahNum, ayahNum) =>
  list.slice(0, surahNum - 1).reduce((a, b) => a + b[2], 0) + ayahNum;

/* =====================================
   RANGE AYAT (MAX 5)
===================================== */
const parseAyatRange = (input, maxAyat) => {
  const MAX = 5;

  if (!input) {
    const r = Math.floor(Math.random() * maxAyat) + 1;
    return { start: r, end: r };
  }

  if (input.includes("-")) {
    let [s, e] = input.split("-").map(Number);
    if (s < 1) s = 1;
    if (s > maxAyat) s = maxAyat;
    if (!e || e > maxAyat) e = maxAyat;
    if (e - s + 1 > MAX) e = s + MAX - 1;
    if (e > maxAyat) e = maxAyat;
    return { start: s, end: e };
  }

  let a = Number(input);
  if (a < 1) a = 1;
  if (a > maxAyat) a = maxAyat;

  return { start: a, end: a };
};

/* =====================================
   MAIN HANDLER
===================================== */
async function alquranHandler(input = "", options = {}) {
  const { tafsir = null } = options;

  const list = readJSON(LIST_FILE);
  const surahNames = list.map(x => normalizeSurah(x[0]));

  input = input.trim().replace(":", " ");
  let parts = input.split(/\s+/).filter(Boolean);

  let surahNum;
  let ayatInput;
  let debug = null;

  /* ========= AUTO RANDOM ========= */
  if (!parts.length) {
    surahNum = Math.floor(Math.random() * 114) + 1;
  }

  /* ========= FUZZY SURAH ========= */
  else if (isNaN(parts[0])) {
    const raw = normalizeSurah(parts[0]);
    ayatInput = parts[1];

    const guess = correct(raw, surahNames);

    debug = {
      input: raw,
      bestMatch: guess.result,
      rating: guess.rating,
      top5: guess.all
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(x => ({
          surah: list[surahNames.indexOf(x.target)][0],
          rating: Number(x.rating.toFixed(3))
        }))
    };

    surahNum = guess.rating < 0.25
      ? Math.floor(Math.random() * 114) + 1
      : guess.indexAll + 1;
  }

  /* ========= NUMERIC ========= */
  else {
    surahNum = Number(parts[0]);
    ayatInput = parts[1];
    if (surahNum < 1 || surahNum > 114)
      surahNum = Math.floor(Math.random() * 114) + 1;
  }

  const [surah, arti, maxAyat] = list[surahNum - 1];
  const { start, end } = parseAyatRange(ayatInput, maxAyat);

  const file = path.join(SURAH_DIR, `Alquran_${surahNum}.json`);
  const data = readJSON(file);

  const ayahs = data.ayahs.slice(start - 1, end).map(a => {
    const noAudio = getNoAudio(list, surahNum, a.index);
    return {
      ayah: a.index,
      arab: a.arb,
      transliterasi: a.transliterasi,
      indo: a.ind,
      english: a.eng,
      tafsir: tafsir ? a[tafsir] || null : null,
      noAudio,
      audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${noAudio}.mp3`
    };
  });

  return {
    surahNumber: surahNum,
    surah,
    arti,
    range: start === end ? `${start}` : `${start}-${end}`,
    totalAyat: maxAyat,
    tafsir,
    ayahs,
    debug
  };
}

module.exports = alquranHandler;