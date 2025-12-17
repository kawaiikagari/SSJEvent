// fetch_calendar.js
import fs from "fs";
import fetch from "node-fetch";

const ICAL_URL = process.env.ICAL_URL;
if (!ICAL_URL) throw new Error("ICAL_URL is not set");

// 今日（UTC基準）
const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

const res = await fetch(ICAL_URL);
if (!res.ok) throw new Error("Failed to fetch calendar");

const ics = await res.text();
const events = ics.split("BEGIN:VEVENT").slice(1);

const result = [];

for (const e of events) {
  const title = e.match(/SUMMARY:(.+)/)?.[1];
  const dt = e.match(/DTSTART[^:]*:(\d{8}(T\d{6})?)/)?.[1];
  if (!title || !dt) continue;
  if (dt.slice(0, 8) !== today) continue;

  const time = dt.length === 8 ? "終日" : dt.slice(9, 11) + ":" + dt.slice(11, 13);
  result.push({ time, title });
}

if (result.length === 0) {
  result.push({ time: "", title: "本日の予定はありません" });
}

fs.writeFileSync("docs/today.json", JSON.stringify(result, null, 2));
