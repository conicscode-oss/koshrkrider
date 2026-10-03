'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [s, setS] = useState(null);
  const [sound, setSound] = useState(false);
  const [focus, setFocus] = useState(0);
  const [radius, setRadius] = useState(20);
  const [level, setLevel] = useState(4); // 1 kam .. 5 bahut zyada
  const LV = { 1: 2, 2: 1, 3: 0.6, 4: 0.4, 5: 0.25 };
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/status', { cache: 'no-store' });
        if (r.status === 401) { location.href = '/login'; return; }
        setS(await r.json());
      } catch {}
    };
    load(); const t = setInterval(load, 3000); return () => clearInterval(t);
  }, []);

  // Siren + vibration + notification jab alarm ho
  useEffect(() => {
    if (!s?.alarm) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification('🚨 Koshrk Rider alarm', { body: s.reason });
    if (!sound) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.type = 'square'; o.connect(ctx.destination); o.start();
    let f = false;
    const t = setInterval(() => { o.frequency.value = f ? 900 : 600; f = !f; navigator.vibrate?.(300); }, 400);
    return () => { clearInterval(t); o.stop(); ctx.close(); };
  }, [s?.alarm, sound]); // eslint-disable-line

  const arm = async (on) => {
    const r = await fetch('/api/arm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ armed: on, radius, sens: LV[level] }) });
    const j = await r.json();
    if (!j.ok) setMsg(j.error); else { setMsg(''); setS(j.state); }
  };
  const enableAlerts = () => { setSound(true); try { Notification.requestPermission(); } catch {} };
  const logout = async () => { await fetch('/api/logout', { method: 'POST' }); location.href = '/login'; };

  if (!s) return <div className="center">Loading…</div>;
  const l = s.last;
  const ago = l ? Math.round((Date.now() - l.ts) / 1000) : null;
  const online = ago !== null && ago < 45;

  return (
    <div className="app">
      <div className="top">
        <div className="brand">KOSHRK <i>RIDER</i></div>
        <div><a href="/tracker">Tracker</a><button onClick={logout}>Logout</button></div>
      </div>
      <div className="mapbox">
        {l?.lat != null
          ? <><Map pos={[l.lat, l.lng]} trail={s.trail} park={s.armed ? s.armPos : null} radius={s.radius} focus={focus} />
              <button className="fab" onClick={() => setFocus(focus + 1)}>Bike pe jao</button></>
          : <div className="center" style={{ textAlign: 'center' }}>Bike ka mobile abhi online nahi hai.<br />Usme Koshrk Rider kholke Tracker chalao.</div>}
      </div>
      <div className="sheet">
        {s.alarm && <div className="alarm">🚨 ALARM: {s.reason}</div>}
        <div className="hero">
          <div><span className="num km">{s.km.toFixed(1)}</span><span className="unit">km aaj</span></div>
        </div>
        <div className="grid">
          <div className="cell"><small>Top speed aaj</small><b className="num">{Math.round(s.maxSpeed)}</b> <span className="unit">km/h</span></div>
          <div className="cell"><small>Abhi speed</small><b className="num">{l ? Math.round(l.speed) : 0}</b> <span className="unit">km/h</span></div>
          <div className="cell"><small>Mobile battery</small><b className="num">{l?.battery != null ? Math.round(l.battery) + '%' : '--'}</b>{l?.charging ? ' ⚡' : ''}
            <div className="bar"><span style={{ width: (l?.battery || 0) + '%', background: (l?.battery || 0) < 20 ? 'var(--red)' : 'var(--ok)' }} /></div></div>
        </div>
        <div className="status"><span className="dot" style={{ background: online ? 'var(--ok)' : 'var(--red)' }} />{online ? 'Bike online hai' : 'Bike offline hai'}{ago !== null && ` · ${ago}s pehle update`}</div>

        <div className={'guard' + (s.armed ? ' on' : '')}>
          <b>Chori se bachao (Theft mode)</b>
          {!s.armed && <div className="row"><span>Hilne par alarm</span><input type="range" min="1" max="5" value={level} onChange={(e) => setLevel(+e.target.value)} /><b className="num">{['', 'Kam', 'Medium', 'Zyada', 'Bahut zyada', 'Sabse zyada'][level]}</b></div>}
          {!s.armed && <div className="row"><span>Parking se</span><input type="range" min="5" max="100" value={radius} onChange={(e) => setRadius(+e.target.value)} /><b className="num">{radius} m</b></div>}
          {s.armed && <div className="status">Bike lock hai. Thoda bhi hili ya {s.radius}m door gayi to alarm bajega.</div>}
          {msg && <div className="err">{msg}</div>}
          <button className={'btn' + (s.armed ? ' off' : '')} onClick={() => arm(!s.armed)}>{s.armed ? (s.alarm ? 'Alarm band karo' : 'Theft mode band karo') : 'Yahin bike lock karo'}</button>
          <button className="btn ghost" onClick={enableAlerts}>{sound ? '🔊 Siren chalu hai' : '🔇 Siren aur notification chalu karo'}</button>
        </div>
      </div>
    </div>
  );
}
