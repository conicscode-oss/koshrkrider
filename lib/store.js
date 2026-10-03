import fs from 'fs';
const FILE = '/tmp/koshrk-state.json';
const g = globalThis;

export const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); // IST

const fresh = () => ({ last: null, day: '', km: 0, maxSpeed: 0, trail: [], armed: false, alarm: false, reason: '', armPos: null, radius: 20, lastPush: 0, sens: 0.4, armedAt: 0 });

export const deviceKey = () => process.env.DEVICE_KEY || 'koshrk123';

// Har 15s: armed ho aur tracker 3 min se chup ho -> alarm; alarm me har 1 min push
function watchdog() {
  const s = g.__kr; if (!s) return;
  const now = Date.now();
  if (s.armed && !s.alarm && s.last && now - s.last.ts > 180000) {
    s.alarm = true; s.reason = 'Bike ka tracker offline ho gaya (phone band ya data kata)'; s.lastPush = 0; save();
  }
  if (s.alarm && now - s.lastPush > 60000) { s.lastPush = now; push(s.reason + '. Dashboard kholo.'); save(); }
}

export function getState() {
  if (!g.__krTimer) { g.__krTimer = setInterval(watchdog, 15000); g.__krTimer.unref?.(); }
  if (!g.__kr) { try { g.__kr = { ...fresh(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }; } catch { g.__kr = fresh(); } }
  const s = g.__kr;
  if (s.day !== today()) { s.day = today(); s.km = 0; s.maxSpeed = 0; s.trail = []; }
  return s;
}
export function save() { try { fs.writeFileSync(FILE, JSON.stringify(g.__kr)); } catch {} }

export function distM(a, b) {
  const R = 6371000, r = (x) => (x * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Free push (ntfy.sh) - optional
export async function push(text) {
  const t = process.env.NTFY_TOPIC;
  if (!t) return;
  try { await fetch(`https://ntfy.sh/${t}`, { method: 'POST', headers: { Title: 'KOSHRK RIDER ALARM', Priority: '5', Tags: 'rotating_light' }, body: text }); } catch {}
}
