'use client';
import { useRef, useState } from 'react';

export default function Tracker() {
  const [on, setOn] = useState(false);
  const [v, setV] = useState({});
  const [log, setLog] = useState('');
  const st = useRef({ lat: null, lng: null, speed: 0, acc: 0, battery: null, charging: false, motion: false });

  const send = async () => {
    const body = { ...st.current }; st.current.motion = false;
    try {
      const r = await fetch('/api/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = '/login'; return; }
      const j = await r.json(); setLog(`${new Date().toLocaleTimeString()} bheja · theft mode: ${j.armed ? 'ON' : 'OFF'}${j.alarm ? ' · ALARM' : ''}`);
    } catch { setLog('Internet nahi hai, dobara koshish kar raha hai…'); }
    setV({ ...st.current });
  };

  const start = async () => {
    setOn(true);
    const lock = async () => { try { await navigator.wakeLock?.request('screen'); } catch {} };
    lock(); document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && lock());
    navigator.geolocation.watchPosition((p) => Object.assign(st.current, { lat: p.coords.latitude, lng: p.coords.longitude, speed: p.coords.speed || 0, acc: p.coords.accuracy }),
      (e) => setLog('GPS error: ' + e.message), { enableHighAccuracy: true, maximumAge: 0 });
    try {
      const b = await navigator.getBattery();
      const up = () => Object.assign(st.current, { battery: b.level * 100, charging: b.charging });
      up(); b.addEventListener('levelchange', up); b.addEventListener('chargingchange', up);
    } catch {}
    let prev = null, last = 0;
    window.addEventListener('devicemotion', (e) => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      if (prev && Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z) > 2.5) {
        st.current.motion = true;
        if (Date.now() - last > 2000) { last = Date.now(); send(); }
      }
      prev = { x: a.x, y: a.y, z: a.z };
    });
    send(); setInterval(send, 4000);
  };

  return (
    <div className="center"><div className="card" style={{ textAlign: 'center' }}>
      <div className="brand">KOSHRK <i>RIDER</i></div>
      <div className="status">Ye page bike wale mobile me kholo</div>
      {!on ? <button className="btn" onClick={start}>Tracking shuru karo</button> : <>
        <div className="grid">
          <div className="cell"><small>Speed</small><b className="num">{Math.round((v.speed || 0) * 3.6)}</b></div>
          <div className="cell"><small>Battery</small><b className="num">{v.battery != null ? Math.round(v.battery) : '--'}%</b></div>
          <div className="cell"><small>GPS ±</small><b className="num">{v.acc ? Math.round(v.acc) : '--'}m</b></div>
        </div>
        <div className="status">Screen on rehne do. Charger lagao.</div></>}
      <div className="status">{log}</div>
      <a href="/" style={{ color: 'var(--amber)' }}>Dashboard</a>
    </div></div>
  );
}
