import fs from "fs";
import fetch from "node-fetch";

const ICAL_URL = process.env.ICAL_URL;
if (!ICAL_URL) {
  throw new Error("ICAL_URL is not set");
}

// 今日の日付（UTC基準）
const today = new Date()
  .toISOString()
  .slice(0, 10)
  .replace(/-/g, "");

// docs フォルダがなければ作る
if (!fs.existsSync("docs")) {
  fs.mkdirSync("docs");
}

// iCal を取得
const response = await fetch(ICAL_URL);
if (!response.ok) {
  throw new Error("Failed to fetch calendar");
}

const ics = await response.text();
const events = ics.split("BEGIN:VEVENT").slice(1);

const result = [];

for (const e of events) {
  const title = e.match(/SUMMARY:(.+)/)?.[1];
  const dt = e.match(/DTSTART[^:]*:(\d{8}(T\d{6})?)/)?.[1];

  if (!title || !dt) continue;
  if (dt.slice(0, 8) !== today) continue;

  const time =
    dt.length === 8
      ? "終日"
      : dt.slice(9, 11) + ":" + dt.slice(11, 13);

  result.push({ time, title });
}

// 今日の予定がなければデフォルトメッセージ
if (result.length === 0) {
  result.push({ time: "", title: "本日の予定はありません" });
}

// JSON を docs/today.json に書き出し
fs.writeFileSync(
  "docs/today.json",
  JSON.stringify(result, null, 2)
);

console.log("today.json generated successfully");
