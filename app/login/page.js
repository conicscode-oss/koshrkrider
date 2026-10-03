'use client';
import { useState } from 'react';
export default function Login() {
  const [user, setUser] = useState(''); const [pass, setPass] = useState(''); const [err, setErr] = useState('');
  const go = async () => {
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, pass }) });
    if (r.ok) location.href = '/'; else setErr('Username ya password galat hai');
  };
  return (
    <div className="center"><div className="card">
      <div className="brand">KOSHRK <i>RIDER</i></div>
      <input placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} autoCapitalize="none" />
      <input placeholder="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
      {err && <div className="err">{err}</div>}
      <button className="btn" onClick={go}>Login</button>
    </div></div>
  );
}
