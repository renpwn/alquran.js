import { spawn } from "child_process";

export function openDB(dbPath = "quran.db") {
  const p = spawn("sqlite3", [dbPath], {
    stdio: ["pipe", "pipe", "pipe"]
  });

  let stderrData = "";

  // Tangkap error dari proses sqlite3
  p.stderr.on("data", (chunk) => {
    stderrData += chunk.toString();
  });

  return {
    exec(sql) {
      return new Promise((resolve, reject) => {
        stderrData = ""; // reset sebelum eksekusi
        p.stdin.write(sql + "\n", (err) => {
          if (err) return reject(err);

          // kasih delay kecil agar proses selesai menulis ke stderr
          setTimeout(() => {
            if (stderrData) {
              return reject(new Error(stderrData.trim()));
            }
            resolve(true);
          }, 50);
        });
      });
    },

    close() {
      p.stdin.end();
    }
  };
}