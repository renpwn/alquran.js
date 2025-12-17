const alquranHandler = require("./index");

(async () => {
  const tests = [
    "",
    "2:255",
    "2 1-10",
    "baqa 1-5",
    "yasin",
    "150 3",
    "al kahfi 10",
    "baqarah 286",
  ];

  for (const t of tests) {
    console.log("\n==============================");
    console.log("INPUT:", JSON.stringify(t));
    try {
      const res = await alquranHandler(t, { tafsir: "kemenag" });
      console.log("SURAH:", res.surahNumber, res.surah);
      console.log("RANGE:", res.range);
      console.log("AYAT:", res.ayahs.map(a => a.ayah));
      console.log("AUDIO:", res.ayahs[0]?.audioUrl);
      if (res.debug) {
        console.log("DEBUG:", res.debug);
      }
    } catch (e) {
      console.error("ERROR:", e.message);
    }
  }
})();
