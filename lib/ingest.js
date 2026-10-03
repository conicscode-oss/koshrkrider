import { getState, save, distM, push } from './store';

// d: { lat, lng, speed(m/s), acc, battery, charging, motion }
export function ingest(d) {
  const s = getState(), now = Date.now();
  const kmh = Math.max(0, (d.speed || 0) * 3.6);
  const hasPos = d.lat != null && !isNaN(d.lat);

  if (hasPos) {
    const p = { lat: d.lat, lng: d.lng };
    if (s.last?.lat != null) {
      const m = distM(s.last, p);
      if (m > 15 && m < 2000 && (d.acc || 0) < 50) s.km += m / 1000; // GPS jitter filter
    }
    if (kmh < 200 && kmh > s.maxSpeed) s.maxSpeed = kmh;
    const tl = s.trail[s.trail.length - 1];
    if (!tl || distM(tl, p) > 20) { s.trail.push(p); if (s.trail.length > 500) s.trail.shift(); }
    s.last = { ...p, acc: d.acc, speed: kmh, battery: d.battery ?? s.last?.battery, charging: d.charging, ts: now };
  } else if (s.last) {
    s.last = { ...s.last, battery: d.battery ?? s.last.battery, charging: d.charging, ts: now };
  }

  if (s.armed && !s.alarm && now - s.armedAt > 5000) {
    const accOk = (d.acc || 0) <= 40;
    if (d.motion) { s.alarm = true; s.reason = 'Bike hili / shake hui'; }
    else if (hasPos && accOk && s.armPos && distM(s.armPos, { lat: d.lat, lng: d.lng }) > s.radius) { s.alarm = true; s.reason = `Bike parking se ${s.radius}m se zyada hili`; }
    else if (hasPos && accOk && kmh > 6) { s.alarm = true; s.reason = 'Bike chalna shuru ho gayi'; }
    if (s.alarm) s.lastPush = 0;
  }
  if (s.alarm && now - s.lastPush > 60000) { s.lastPush = now; push(s.reason + '. Dashboard kholo.'); }
  save();
  return { ok: true, armed: s.armed, alarm: s.alarm, sens: s.sens };
}
