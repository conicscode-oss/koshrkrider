'use client';
import { useEffect, useRef, useState } from 'react';

export default function Tracker() {
  const [on, setOn] = useState(false);
  const [v, setV] = useState({});
  const [log, setLog] = useState('');
  const [setup, setSetup] = useState(null);
  useEffect(() => { fetch('/api/setup').then((r) => r.json()).then(setSetup).catch(() => {}); }, []);
  const sens = useRef(0.4);
  const started = useRef(false);
  useEffect(() => { if (localStorage.getItem('kr_tracking') === '1') start(); }, []); // eslint-disable-line

  const st = useRef({ lat: null, lng: null, speed: 0, acc: 0, battery: null, charging: false, motion: false });

  const send = async () => {
    const body = { ...st.current }; st.current.motion = false;
    try {
      const r = await fetch('/api/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.status === 401) { location.href = '/login'; return; }
      const j = await r.json(); if (j.sens) sens.current = j.sens; setLog(`${new Date().toLocaleTimeString()} bheja · theft mode: ${j.armed ? 'ON' : 'OFF'}${j.alarm ? ' · ALARM' : ''}`);
    } catch { setLog('Internet nahi hai, dobara koshish kar raha hai…'); }
    setV({ ...st.current });
  };

  const start = async () => {
    if (started.current) return;
    started.current = true;
    localStorage.setItem('kr_tracking', '1');
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
    let base = null, last = 0;
    window.addEventListener('devicemotion', (e) => {
      const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
      const cur = [a.x, a.y, a.z];
      if (!base) { base = cur; return; }
      const dev = Math.abs(cur[0] - base[0]) + Math.abs(cur[1] - base[1]) + Math.abs(cur[2] - base[2]);
      base = base.map((b, i) => b * 0.97 + cur[i] * 0.03); // slow baseline: dheere hilna bhi pakadta hai
      if (dev > sens.current) {
        st.current.motion = true;
        if (Date.now() - last > 1500) { last = Date.now(); send(); }
      }
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
        <div className="status">Screen on rehne do. Charger lagao. Refresh karne par ye apne aap chalu ho jayega.</div>
        <button className="btn ghost" onClick={() => { localStorage.removeItem('kr_tracking'); location.reload(); }}>Tracking band karo</button></>}
      <div className="status">{log}</div>
      {setup && <div className="guard" style={{ textAlign: 'left' }}>
        <b>Screen band hone par bhi chalane ke liye</b>
        <div className="status">Bike wale mobile me <b>Traccar Client</b> app (Play Store, free) install karo aur ye daalo:</div>
        <div className="status">Device identifier:<br /><b style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{setup.id}</b></div>
        <div className="status">Server URL:<br /><b style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{setup.url}</b></div>
        <div className="status">Frequency: 10 · Distance: 0 · Angle: 0 · Accuracy: Highest · Wakelock: ON. Phir Service status ON karo.</div>
      </div>}
      <a href="/" style={{ color: 'var(--amber)' }}>Dashboard</a>
    </div></div>
  );
}
