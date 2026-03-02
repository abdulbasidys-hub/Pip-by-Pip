import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc
} from 'firebase/firestore';

const FB = {
  apiKey: "AIzaSyB7HUsKHjtv7OCMSajJfAVqGLfoGEHHPtg",
  authDomain: "pip-by-pip-d14d6.firebaseapp.com",
  projectId: "pip-by-pip-d14d6",
  storageBucket: "pip-by-pip-d14d6.firebasestorage.app",
  messagingSenderId: "142876638905",
  appId: "1:142876638905:web:bc883d7846381ed8cb6568"
};
const fbApp = getApps().length ? getApps()[0] : initializeApp(FB);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'pip-by-pip-v5';
const toEmail = u => `${u.toLowerCase().replace(/[^a-z0-9]/g,'_')}@pipbypip.app`;
const tradesCol = () => collection(db,'artifacts',APP_ID,'public','data','trades');
const tradeDoc = id => doc(db,'artifacts',APP_ID,'public','data','trades',id);
const userDoc = uid => doc(db,'artifacts',APP_ID,'public','data','users',uid);
const genId = () => Math.random().toString(36).slice(2,9);

const ASSETS = [
  'EUR/USD','GBP/USD','USD/JPY','GBP/JPY','AUD/USD','USD/CAD',
  'NZD/USD','EUR/JPY','EUR/GBP','USD/CHF',
  'XAU/USD (Gold)','XAG/USD (Silver)','NAS100 (Nasdaq)','SPX500 (S&P 500)'
];

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400;1,600&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:        #07080f;
  --bg1:       #0d0e1a;
  --bg2:       #121420;
  --bg3:       #181a28;
  --bg4:       #1e2030;
  --line:      rgba(255,255,255,0.06);
  --line2:     rgba(255,255,255,0.10);
  --cyan:      #00d4ff;
  --cyan-d:    #00a8cc;
  --cyan-g:    rgba(0,212,255,0.10);
  --cyan-gs:   rgba(0,212,255,0.04);
  --gold:      #f0b429;
  --gold-g:    rgba(240,180,41,0.12);
  --green:     #34d399;
  --green-g:   rgba(52,211,153,0.10);
  --red:       #f87171;
  --red-g:     rgba(248,113,113,0.10);
  --text:      #c8cce8;
  --text2:     #6b7094;
  --text3:     #363952;
  --white:     #eef0ff;
  --bebas:     'Bebas Neue',sans-serif;
  --serif:     'Crimson Pro',serif;
  --mono:      'JetBrains Mono',monospace;
  --r:         8px;
  --r2:        12px;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--mono);overflow-x:hidden}

/* ── Noise texture overlay ── */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
  background-size:200px 200px;
  opacity:0.6;
}

/* ── Ambient glow blobs ── */
.ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.ambient-blob{
  position:absolute;border-radius:50%;filter:blur(120px);
  animation:blobDrift 20s ease-in-out infinite alternate;
}
.blob1{width:600px;height:600px;top:-200px;left:10%;background:rgba(0,212,255,0.03);animation-delay:0s}
.blob2{width:500px;height:500px;bottom:-100px;right:5%;background:rgba(240,180,41,0.025);animation-delay:-7s}
.blob3{width:400px;height:400px;top:40%;left:40%;background:rgba(52,211,153,0.02);animation-delay:-14s}
@keyframes blobDrift{
  0%{transform:translate(0,0) scale(1)}
  33%{transform:translate(40px,-30px) scale(1.05)}
  66%{transform:translate(-20px,50px) scale(0.95)}
  100%{transform:translate(30px,20px) scale(1.02)}
}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px}

/* ── Page transitions ── */
@keyframes pageIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes drawLine{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 8px rgba(0,212,255,0.3)}50%{box-shadow:0 0 20px rgba(0,212,255,0.6)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmerSlide{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes breathe{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.7;transform:scale(1.01)}}

.page-enter{animation:pageIn 0.45s cubic-bezier(0.16,1,0.3,1) both}
.s0{animation-delay:0s}.s1{animation-delay:0.06s}.s2{animation-delay:0.12s}.s3{animation-delay:0.18s}.s4{animation-delay:0.24s}.s5{animation-delay:0.30s}

/* ── AUTH ── */
.auth-shell{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  position:relative;z-index:1;padding:24px;
}
.auth-wrap{width:100%;max-width:420px;position:relative}
.auth-glow{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);
  width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%);
  pointer-events:none;
}
.auth-brand{text-align:center;margin-bottom:48px;animation:pageIn 0.6s cubic-bezier(0.16,1,0.3,1)}
.brand-title{
  font-family:var(--bebas);font-size:72px;letter-spacing:4px;
  background:linear-gradient(135deg,var(--white) 0%,var(--cyan) 50%,var(--white) 100%);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:shimmerSlide 4s linear infinite;
  line-height:1;
}
.brand-sub{
  font-size:9px;letter-spacing:6px;text-transform:uppercase;
  color:var(--text3);margin-top:10px;font-weight:400;
}
.auth-card{
  background:linear-gradient(145deg,var(--bg2),var(--bg1));
  border:1px solid var(--line2);border-radius:16px;
  overflow:hidden;position:relative;
  animation:pageIn 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
  box-shadow:0 24px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.03) inset;
}
.auth-card-shine{
  position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent 0%,rgba(0,212,255,0.4) 50%,transparent 100%);
}
.auth-card-body{padding:36px 40px}
.auth-eyebrow{
  font-size:8px;letter-spacing:4px;text-transform:uppercase;
  color:var(--cyan);margin-bottom:6px;
  display:flex;align-items:center;gap:8px;
}
.auth-eyebrow::before{content:'';width:16px;height:1px;background:var(--cyan);opacity:0.5}
.auth-heading{
  font-family:var(--serif);font-style:italic;font-size:30px;
  color:var(--white);margin-bottom:8px;letter-spacing:-0.3px;font-weight:300;
}
.auth-desc{font-size:11px;color:var(--text2);line-height:1.7;margin-bottom:28px}
.auth-err{
  background:var(--red-g);border:1px solid rgba(248,113,113,0.2);
  border-radius:var(--r);padding:10px 14px;
  font-size:10px;color:var(--red);margin-bottom:16px;letter-spacing:0.3px;
}

/* ── Form fields ── */
.f{margin-bottom:18px;animation:slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both}
.f label{
  display:block;font-size:8px;letter-spacing:3px;text-transform:uppercase;
  color:var(--text2);margin-bottom:8px;font-weight:500;
}
.f input,.f select,.f textarea{
  width:100%;background:var(--bg3);
  border:1px solid var(--line2);border-radius:var(--r);
  padding:12px 14px;font-family:var(--mono);font-size:12px;color:var(--white);
  outline:none;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;
  -webkit-appearance:none;appearance:none;
}
.f input:focus,.f select:focus,.f textarea:focus{
  border-color:var(--cyan);background:var(--bg4);
  box-shadow:0 0 0 3px rgba(0,212,255,0.08);
}
.f input::placeholder{color:var(--text3)}
.f textarea{min-height:90px;resize:vertical;line-height:1.65}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 22px;border-radius:var(--r);
  font-family:var(--mono);font-size:10px;font-weight:600;
  letter-spacing:2px;text-transform:uppercase;cursor:pointer;
  transition:all 0.2s cubic-bezier(0.16,1,0.3,1);border:1px solid transparent;
  position:relative;overflow:hidden;
}
.btn::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 50%);
  opacity:0;transition:opacity 0.2s;
}
.btn:hover::after{opacity:1}
.btn-primary{
  background:linear-gradient(135deg,var(--cyan) 0%,var(--cyan-d) 100%);
  color:#07080f;border-color:var(--cyan);
  box-shadow:0 4px 16px rgba(0,212,255,0.25);
}
.btn-primary:hover{box-shadow:0 6px 24px rgba(0,212,255,0.4);transform:translateY(-1px)}
.btn-primary:active{transform:translateY(0);box-shadow:0 2px 8px rgba(0,212,255,0.2)}
.btn-ghost{
  background:transparent;color:var(--text2);
  border-color:var(--line2);
}
.btn-ghost:hover{border-color:var(--line2);color:var(--text);background:var(--bg3)}
.btn-danger{background:transparent;color:var(--red);border-color:rgba(248,113,113,0.2)}
.btn-danger:hover{background:var(--red-g)}
.btn-full{width:100%}
.btn-sm{padding:7px 14px;font-size:9px}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important}

/* ── App Shell ── */
.shell{display:flex;min-height:100vh;position:relative;z-index:1}

/* ── Sidebar ── */
.sidebar{
  width:210px;flex-shrink:0;
  background:linear-gradient(180deg,var(--bg1) 0%,var(--bg) 100%);
  border-right:1px solid var(--line);
  display:flex;flex-direction:column;position:fixed;height:100vh;
  z-index:100;top:0;left:0;
}
.sb-top{padding:24px 18px 20px;border-bottom:1px solid var(--line)}
.sb-logo{
  font-family:var(--bebas);font-size:26px;letter-spacing:3px;
  color:var(--white);line-height:1;
}
.sb-logo span{color:var(--cyan)}
.sb-sync{
  display:flex;align-items:center;gap:6px;margin-top:8px;
  font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);
}
.sync-dot{
  width:6px;height:6px;border-radius:50%;background:var(--green);
  box-shadow:0 0 8px var(--green);
  animation:breathe 3s ease-in-out infinite;
}
.nav{flex:1;padding:14px 10px;overflow-y:auto}
.nb{
  width:100%;display:flex;align-items:center;gap:10px;
  padding:10px 12px;border-radius:var(--r);
  font-family:var(--mono);font-size:10px;font-weight:500;
  letter-spacing:1.5px;text-transform:uppercase;
  color:var(--text3);background:none;border:none;cursor:pointer;
  transition:all 0.18s cubic-bezier(0.16,1,0.3,1);text-align:left;
  margin-bottom:2px;position:relative;
}
.nb svg{opacity:0.4;transition:opacity 0.18s;flex-shrink:0}
.nb:hover{color:var(--text);background:rgba(255,255,255,0.04)}
.nb:hover svg{opacity:0.7}
.nb.on{color:var(--cyan);background:var(--cyan-gs);border:1px solid rgba(0,212,255,0.12)}
.nb.on svg{opacity:1;color:var(--cyan)}
.nb.on::before{
  content:'';position:absolute;left:0;top:20%;bottom:20%;
  width:2px;border-radius:1px;background:var(--cyan);
  box-shadow:0 0 8px var(--cyan);
}
.sb-user{padding:14px 10px;border-top:1px solid var(--line)}
.user-tile{
  display:flex;align-items:center;gap:10px;padding:10px 12px;
  border-radius:var(--r);background:var(--bg2);
  border:1px solid var(--line);cursor:pointer;
  transition:all 0.18s;margin-bottom:8px;
}
.user-tile:hover{border-color:rgba(0,212,255,0.25);background:var(--bg3)}
.avatar{
  width:30px;height:30px;border-radius:6px;
  background:linear-gradient(135deg,var(--cyan-gs),var(--bg4));
  border:1px solid rgba(0,212,255,0.25);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--bebas);font-size:14px;color:var(--cyan);flex-shrink:0;
  letter-spacing:1px;
}
.u-name{font-size:10px;color:var(--text);font-weight:600;letter-spacing:0.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.u-sub{font-size:8px;color:var(--text3);letter-spacing:1px;margin-top:2px}
.so-btn{
  width:100%;padding:8px;background:none;border:none;
  font-family:var(--mono);font-size:8px;letter-spacing:3px;text-transform:uppercase;
  color:var(--text3);cursor:pointer;transition:color 0.15s;
}
.so-btn:hover{color:var(--red)}

/* ── Main ── */
.main{margin-left:210px;flex:1;min-height:100vh}
.page{padding:44px 52px;max-width:1240px}
.page-enter{animation:pageIn 0.45s cubic-bezier(0.16,1,0.3,1) both}

/* ── Page header ── */
.ph{margin-bottom:44px}
.ph-ey{
  font-size:8px;letter-spacing:5px;text-transform:uppercase;color:var(--cyan);
  margin-bottom:10px;display:flex;align-items:center;gap:10px;
}
.ph-ey::before{content:'';width:24px;height:1px;background:var(--cyan);opacity:0.5}
.ph-title{
  font-family:var(--bebas);font-size:54px;letter-spacing:3px;
  color:var(--white);line-height:0.95;
}
.ph-title em{color:var(--cyan);font-style:normal}
.ph-sub{font-size:11px;color:var(--text2);margin-top:8px;letter-spacing:0.3px;line-height:1.5}

/* ── Stats ── */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.sc{
  background:linear-gradient(145deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r2);
  padding:22px 24px;position:relative;overflow:hidden;
  transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
  cursor:default;
}
.sc::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  opacity:0;transition:opacity 0.25s;
}
.sc:hover{transform:translateY(-3px);border-color:var(--line2);box-shadow:0 16px 40px rgba(0,0,0,0.4)}
.sc:hover::before{opacity:1}
.sc.c-cyan::before{background:linear-gradient(90deg,transparent,var(--cyan),transparent);box-shadow:0 0 12px var(--cyan)}
.sc.c-gold::before{background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.sc.c-green::before{background:linear-gradient(90deg,transparent,var(--green),transparent)}
.sc.c-red::before{background:linear-gradient(90deg,transparent,var(--red),transparent)}
.sc-bg-icon{
  position:absolute;right:-8px;bottom:-12px;
  font-family:var(--bebas);font-size:80px;color:rgba(255,255,255,0.015);
  letter-spacing:2px;pointer-events:none;line-height:1;
}
.sc-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);margin-bottom:10px}
.sc-val{font-family:var(--bebas);font-size:40px;letter-spacing:2px;line-height:1}
.sc-val.pos{color:var(--green)}
.sc-val.neg{color:var(--red)}
.sc-val.cyn{color:var(--cyan)}
.sc-val.gld{color:var(--gold)}
.sc-val.wht{color:var(--white)}
.sc-sub{font-size:9px;color:var(--text3);margin-top:6px;letter-spacing:1px}

/* ── Section labels ── */
.sl{
  font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--text3);
  margin-bottom:14px;display:flex;align-items:center;gap:12px;
}
.sl::after{content:'';flex:1;height:1px;background:var(--line)}

/* ── Equity Curve ── */
.curve-card{
  background:linear-gradient(145deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r2);
  padding:28px 32px;margin-bottom:28px;
  box-shadow:0 8px 32px rgba(0,0,0,0.3);
}
.curve-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.curve-r{font-family:var(--bebas);font-size:44px;letter-spacing:2px;line-height:1}
.curve-meta{font-size:9px;color:var(--text3);letter-spacing:2px;margin-top:4px}

/* ── Asset Bars ── */
.ab-list{display:flex;flex-direction:column;gap:6px;margin-bottom:28px}
.ab-row{
  display:grid;grid-template-columns:140px 1fr 70px 60px;
  align-items:center;gap:16px;
  background:linear-gradient(90deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r);
  padding:12px 18px;transition:all 0.18s;
}
.ab-row:hover{border-color:var(--line2);transform:translateX(3px)}
.ab-name{font-size:10px;color:var(--text);font-weight:500;letter-spacing:0.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ab-track{height:4px;background:var(--bg4);border-radius:2px;overflow:hidden}
.ab-fill{height:100%;border-radius:2px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)}
.ab-r{font-family:var(--mono);font-size:11px;font-weight:600;text-align:right;letter-spacing:0.5px}
.ab-wr{font-size:8px;color:var(--text3);text-align:right;letter-spacing:1px}

/* ── Table ── */
.tbl-card{
  background:linear-gradient(145deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r2);overflow:hidden;
  box-shadow:0 8px 32px rgba(0,0,0,0.2);
}
.tbl-card table{width:100%;border-collapse:collapse}
.tbl-card thead tr{border-bottom:1px solid var(--line);background:var(--bg3)}
.tbl-card th{
  padding:12px 16px;font-size:7px;letter-spacing:3px;text-transform:uppercase;
  color:var(--text3);text-align:left;font-weight:600;white-space:nowrap;
}
.tbl-card tbody tr{border-bottom:1px solid var(--line);transition:all 0.12s}
.tbl-card tbody tr:last-child{border-bottom:none}
.tbl-card tbody tr:hover{background:rgba(0,212,255,0.03)}
.tbl-card td{padding:12px 16px;font-size:11px;white-space:nowrap}
.td-date{color:var(--text2);font-size:10px}
.td-win{color:var(--green);font-weight:600}
.td-loss{color:var(--red);font-weight:600}
.td-be{color:var(--gold);font-weight:600}
.td-note{color:var(--text2);font-style:italic;max-width:200px;overflow:hidden;text-overflow:ellipsis}
.badge{display:inline-block;padding:3px 8px;border-radius:4px;font-size:7px;letter-spacing:2px;text-transform:uppercase;font-weight:700}
.bl{background:var(--green-g);color:var(--green);border:1px solid rgba(52,211,153,0.2)}
.bb{background:rgba(96,165,250,0.08);color:#60a5fa;border:1px solid rgba(96,165,250,0.2)}
.empty-st{padding:64px;text-align:center;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--text3)}

/* ── Win Ring ── */
.ring-wrap{position:relative;flex-shrink:0}
.ring-wrap svg{transform:rotate(-90deg);display:block}
.ring-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column}
.ring-pct{font-family:var(--bebas);font-size:22px;letter-spacing:1px;color:var(--white);line-height:1}
.ring-lbl{font-size:7px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-top:1px}

/* ── Filter Tabs ── */
.ftabs{display:flex;gap:4px;background:var(--bg2);border:1px solid var(--line);border-radius:30px;padding:3px}
.ftab{
  padding:6px 16px;border-radius:24px;font-family:var(--mono);
  font-size:8px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
  cursor:pointer;border:none;background:none;color:var(--text3);
  transition:all 0.18s;
}
.ftab.on{background:var(--bg4);color:var(--cyan);box-shadow:0 2px 8px rgba(0,0,0,0.3)}

/* ── Mode Toggle ── */
.mtoggle{display:flex;gap:6px;margin-bottom:20px}
.mpill{
  padding:8px 22px;border-radius:20px;font-family:var(--mono);
  font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
  cursor:pointer;border:1px solid var(--line2);background:var(--bg2);color:var(--text3);
  transition:all 0.18s;
}
.mpill.ml{background:var(--green-g);border-color:rgba(52,211,153,0.3);color:var(--green);box-shadow:0 0 12px rgba(52,211,153,0.1)}
.mpill.mb{background:rgba(96,165,250,0.08);border-color:rgba(96,165,250,0.25);color:#60a5fa}

/* ── Form Panels ── */
.fp{
  background:linear-gradient(145deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r2);
  padding:28px 32px;margin-bottom:14px;
  box-shadow:0 4px 16px rgba(0,0,0,0.2);
}
.fp-title{
  font-size:8px;letter-spacing:4px;text-transform:uppercase;
  color:var(--text2);margin-bottom:20px;padding-bottom:16px;
  border-bottom:1px solid var(--line);
  display:flex;align-items:center;gap:10px;
}
.fp-title::before{content:'';width:12px;height:1px;background:var(--cyan);opacity:0.6}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}
.commit-btn{
  width:100%;padding:16px;
  background:linear-gradient(135deg,var(--cyan),var(--cyan-d));
  border:none;border-radius:var(--r);
  font-family:var(--mono);font-size:10px;font-weight:700;
  letter-spacing:4px;text-transform:uppercase;color:#07080f;
  cursor:pointer;transition:all 0.2s;
  box-shadow:0 4px 20px rgba(0,212,255,0.25);
  position:relative;overflow:hidden;
}
.commit-btn::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
  transform:translateX(-100%);transition:transform 0.5s;
}
.commit-btn:hover::before{transform:translateX(100%)}
.commit-btn:hover{box-shadow:0 6px 28px rgba(0,212,255,0.4);transform:translateY(-1px)}
.commit-btn:active{transform:translateY(0)}
.commit-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}

/* ── Strategy step in form ── */
.strat-step{
  background:var(--bg3);border:1px solid var(--line);border-radius:var(--r);
  padding:18px 20px;margin-bottom:10px;
  transition:border-color 0.18s,box-shadow 0.18s;
}
.strat-step:focus-within{border-color:rgba(0,212,255,0.3);box-shadow:0 0 0 2px rgba(0,212,255,0.05)}
.step-lbl{
  font-size:8px;letter-spacing:3px;text-transform:uppercase;
  color:var(--text3);margin-bottom:10px;
  display:flex;align-items:center;gap:8px;
}
.step-num{
  width:18px;height:18px;border-radius:4px;
  background:var(--cyan-g);border:1px solid rgba(0,212,255,0.2);
  display:flex;align-items:center;justify-content:center;
  font-size:7px;color:var(--cyan);font-weight:700;
}

/* ── Checkbox field ── */
.ck-field{display:flex;align-items:center;gap:12px;cursor:pointer;padding:4px 0}
.ck-box{
  width:22px;height:22px;border-radius:5px;flex-shrink:0;
  border:1.5px solid var(--line2);background:var(--bg4);
  display:flex;align-items:center;justify-content:center;
  transition:all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.ck-box.on{background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 12px rgba(0,212,255,0.4)}
.ck-lbl{font-size:12px;color:var(--text);transition:color 0.15s}
.ck-field:hover .ck-lbl{color:var(--white)}

/* ── Multi-select chips ── */
.ms-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.ms-chip{
  padding:6px 13px;border-radius:20px;border:1px solid var(--line2);
  background:var(--bg4);color:var(--text3);
  font-family:var(--mono);font-size:9px;font-weight:500;letter-spacing:1.5px;
  cursor:pointer;transition:all 0.18s cubic-bezier(0.16,1,0.3,1);
  user-select:none;
}
.ms-chip:hover{border-color:rgba(0,212,255,0.3);color:var(--text);background:var(--bg3)}
.ms-chip.on{
  background:var(--cyan-g);border-color:rgba(0,212,255,0.35);
  color:var(--cyan);box-shadow:0 0 10px rgba(0,212,255,0.1);
}

/* ── Builder flow ── */
.builder-shell{
  min-height:100vh;display:flex;align-items:flex-start;justify-content:center;
  position:relative;z-index:1;padding:60px 24px 80px;overflow-y:auto;
}
.builder-wrap{width:100%;max-width:660px}
.b-step{
  font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--cyan);
  margin-bottom:10px;display:flex;align-items:center;gap:8px;
}
.b-step::before{content:'';width:20px;height:1px;background:var(--cyan);opacity:0.5}
.b-title{
  font-family:var(--serif);font-style:italic;font-weight:300;font-size:40px;
  color:var(--white);margin-bottom:10px;letter-spacing:-0.5px;line-height:1.1;
}
.b-desc{font-size:12px;color:var(--text2);line-height:1.75;margin-bottom:36px}

.strat-name-area{margin-bottom:32px}
.strat-name-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
.strat-name-input{
  font-family:var(--serif);font-style:italic;font-size:30px;font-weight:300;
  background:transparent;border:none;border-bottom:1px solid var(--line2);
  border-radius:0;padding:6px 0;color:var(--white);width:100%;outline:none;
  transition:border-color 0.2s;letter-spacing:-0.3px;
}
.strat-name-input:focus{border-bottom-color:var(--cyan)}
.strat-name-input::placeholder{color:var(--text3)}

.fl-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.fl-row{
  display:flex;align-items:center;justify-content:space-between;
  background:linear-gradient(90deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r);
  padding:14px 18px;transition:all 0.15s;
}
.fl-row:hover{border-color:var(--line2)}
.fl-left{display:flex;align-items:center;gap:14px}
.fl-num{
  width:24px;height:24px;border-radius:5px;
  background:var(--cyan-g);border:1px solid rgba(0,212,255,0.2);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--bebas);font-size:12px;color:var(--cyan);flex-shrink:0;letter-spacing:1px;
}
.fl-name{font-size:12px;color:var(--text);font-weight:500}
.fl-type{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);margin-top:2px}
.fl-acts{display:flex;gap:4px}
.ib{
  background:none;border:none;cursor:pointer;color:var(--text3);
  padding:5px;display:flex;align-items:center;
  transition:color 0.12s;border-radius:4px;
}
.ib:hover{color:var(--text);background:var(--bg3)}
.ib.del:hover{color:var(--red)}

.add-trig{
  width:100%;padding:18px;border:1px dashed var(--line2);border-radius:var(--r);
  background:none;font-family:var(--mono);font-size:9px;letter-spacing:3px;
  text-transform:uppercase;color:var(--text3);cursor:pointer;
  transition:all 0.18s;margin-bottom:20px;
  display:flex;align-items:center;justify-content:center;gap:8px;
}
.add-trig:hover{border-color:rgba(0,212,255,0.4);color:var(--cyan);background:var(--cyan-gs)}

.add-panel{
  background:var(--bg2);border:1px solid var(--line2);
  border-radius:var(--r2);padding:24px;margin-bottom:16px;
  animation:pageIn 0.25s cubic-bezier(0.16,1,0.3,1);
}
.add-panel-title{font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--text3);margin-bottom:16px}
.type-tabs{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap}
.type-tab{
  padding:7px 16px;border-radius:4px;font-family:var(--mono);
  font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
  cursor:pointer;border:1px solid var(--line2);background:var(--bg3);color:var(--text3);
  transition:all 0.15s;
}
.type-tab.on{border-color:rgba(0,212,255,0.4);color:var(--cyan);background:var(--cyan-gs)}
.opts-row{display:flex;gap:8px;align-items:center;margin-bottom:10px}
.opt-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.ot{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 10px;background:var(--bg3);border:1px solid var(--line2);
  border-radius:4px;font-size:9px;color:var(--text2);
}
.ot button{background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;line-height:1;padding:0;transition:color 0.1s}
.ot button:hover{color:var(--red)}

/* ── Insight boxes ── */
.ins-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
.ins-box{
  background:linear-gradient(145deg,var(--bg2),var(--bg1));
  border:1px solid var(--line);border-radius:var(--r2);padding:22px 26px;
  transition:all 0.2s;
}
.ins-box:hover{border-color:var(--line2);transform:translateY(-2px)}
.ins-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
.ins-val{font-family:var(--bebas);font-size:36px;letter-spacing:2px;line-height:1}
.ins-sub{font-size:9px;color:var(--text3);margin-top:4px;letter-spacing:0.5px}

/* ── Settings field list ── */
.settings-wrap{max-width:660px}
.saved-flash{font-size:9px;color:var(--green);letter-spacing:3px;text-transform:uppercase}

/* ── Loader ── */
.loader-sh{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:var(--bg);position:relative;z-index:1;flex-direction:column;gap:16px;
}
.loader-ring{
  width:36px;height:36px;border:2px solid var(--line2);
  border-top-color:var(--cyan);border-radius:50%;
  animation:spin 0.8s linear infinite;
}
.loader-txt{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--text3)}

/* ── Progress bar ── */
.prog-bar{height:2px;background:var(--line);border-radius:1px;margin-bottom:36px;overflow:hidden}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--cyan-d));border-radius:1px;transition:width 0.4s cubic-bezier(0.16,1,0.3,1)}

/* ── Divider ── */
.div{width:100%;height:1px;background:var(--line);margin:24px 0}

@media(max-width:960px){
  .sidebar{width:58px}
  .sb-logo,.nb span,.u-name,.u-sub,.so-btn,.sb-sync,.sb-user .avatar+div{display:none}
  .user-tile{justify-content:center}
  .nb{justify-content:center}
  .nb.on::before{display:none}
  .main{margin-left:58px}
  .page{padding:24px 20px}
  .stat-grid{grid-template-columns:1fr 1fr}
  .ins-grid{grid-template-columns:1fr}
  .fg3{grid-template-columns:1fr 1fr}
}
`;

// ─── Helpers ────────────────────────────────────────────────────────────────
const rSign = v => { const n=parseFloat(v||0); return `${n>=0?'+':''}${n.toFixed(2)}R` };
const rClass = v => parseFloat(v||0)>0?'td-win':parseFloat(v||0)<0?'td-loss':'td-be';
const fmtD = d => { if(!d) return '—'; try{return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'})}catch{return d} };

// ─── Animated Number ────────────────────────────────────────────────────────
function AnimNum({ val, dec=1, prefix='', suffix='' }) {
  const [disp, setDisp] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = parseFloat(val) || 0;
    let start=null;
    const dur=800;
    const tick = ts => {
      if(!start) start=ts;
      const p = Math.min((ts-start)/dur,1);
      const ease = 1-Math.pow(1-p,4);
      setDisp(target*ease);
      if(p<1) ref.current=requestAnimationFrame(tick);
    };
    ref.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(ref.current);
  },[val]);
  return <>{prefix}{disp.toFixed(dec)}{suffix}</>;
}

// ─── Icons ──────────────────────────────────────────────────────────────────
const I = {
  Grid:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Book:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Plus:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Chart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  Cog:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>,
  Up:    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18,15 12,9 6,15"/></svg>,
  Down:  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>,
  Chk:   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#07080f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
};

// ─── WinRateRing ─────────────────────────────────────────────────────────────
function WinRateRing({ pct, size=90 }) {
  const r=34, circ=2*Math.PI*r, fill=(pct/100)*circ;
  const col = pct>=50?'var(--green)':'var(--red)';
  return (
    <div className="ring-wrap" style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--bg4)" strokeWidth="5"/>
        <circle cx="40" cy="40" r={r} fill="none" stroke={col} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{transition:'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)',filter:`drop-shadow(0 0 4px ${col})`}}
        />
      </svg>
      <div className="ring-center">
        <div className="ring-pct">{pct.toFixed(0)}%</div>
        <div className="ring-lbl">WR</div>
      </div>
    </div>
  );
}

// ─── EquityCurve ─────────────────────────────────────────────────────────────
function EquityCurve({ trades }) {
  const points = useMemo(() => {
    let c=0;
    return [...trades].filter(t=>t.outcome!=='No Trade')
      .sort((a,b)=>new Date(a.date)-new Date(b.date))
      .map(t=>{c+=parseFloat(t.resultR||0);return c});
  },[trades]);
  if(points.length<2) return null;
  const W=1000,H=130,pad=8;
  const min=Math.min(0,...points), max=Math.max(0,...points), range=max-min||1;
  const xs=points.map((_,i)=>(i/(points.length-1))*(W-pad*2)+pad);
  const ys=points.map(v=>H-((v-min)/range)*(H-pad*2)-pad);
  const zeroY=H-((0-min)/range)*(H-pad*2)-pad;
  const path=points.map((_,i)=>`${i===0?'M':'L'}${xs[i]},${ys[i]}`).join(' ');
  const area=`${path} L${xs[xs.length-1]},${zeroY} L${xs[0]},${zeroY} Z`;
  const last=points[points.length-1];
  const col=last>=0?'var(--green)':'var(--red)';
  const pathLen=2000;
  return (
    <div className="curve-card page-enter s1">
      <div className="curve-top">
        <div>
          <div className="sl">R-Equity Curve</div>
          <div className="curve-r" style={{color:last>=0?'var(--green)':'var(--red)'}}>
            <AnimNum val={last} dec={2} prefix={last>=0?'+':''} suffix="R"/>
          </div>
          <div className="curve-meta">{points.length} closed trades</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{height:110,display:'block'}}>
        <defs>
          <linearGradient id="egr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={col} stopOpacity="0"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <line x1={pad} y1={zeroY} x2={W-pad} y2={zeroY} stroke="var(--line2)" strokeWidth="1" strokeDasharray="4,4"/>
        <path d={area} fill="url(#egr)"/>
        <path d={path} fill="none" stroke={col} strokeWidth="1.8" filter="url(#glow)"
          strokeDasharray={pathLen} strokeDashoffset={pathLen}
          style={{animation:'drawLine 1.5s 0.3s cubic-bezier(0.16,1,0.3,1) forwards',['--len']:pathLen}}
        />
        <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={col}
          style={{filter:`drop-shadow(0 0 6px ${col})`}}
        />
      </svg>
    </div>
  );
}

// ─── AssetBars ───────────────────────────────────────────────────────────────
function AssetBars({ trades }) {
  const stats = useMemo(()=>{
    const m={};
    trades.forEach(t=>{
      const a=t.asset; if(!a||t.outcome==='No Trade') return;
      if(!m[a]) m[a]={r:0,w:0,n:0};
      m[a].r+=parseFloat(t.resultR||0); m[a].n++;
      if(t.outcome==='Win') m[a].w++;
    });
    return Object.entries(m).sort((a,b)=>b[1].r-a[1].r);
  },[trades]);
  if(!stats.length) return null;
  const mx=Math.max(...stats.map(([,s])=>Math.abs(s.r)),0.01);
  return (
    <div>
      <div className="sl">Performance by Asset</div>
      <div className="ab-list">
        {stats.map(([asset,s],i)=>(
          <div key={asset} className="ab-row page-enter" style={{animationDelay:`${0.04*i}s`}}>
            <div className="ab-name">{asset}</div>
            <div className="ab-track">
              <div className="ab-fill" style={{
                width:`${(Math.abs(s.r)/mx)*100}%`,
                background:s.r>=0?'var(--green)':'var(--red)',
                boxShadow:s.r>=0?'0 0 6px rgba(52,211,153,0.5)':'none'
              }}/>
            </div>
            <div className={`ab-r ${s.r>=0?'td-win':'td-loss'}`}>{rSign(s.r)}</div>
            <div className="ab-wr">{s.n>0?((s.w/s.n)*100).toFixed(0):0}% WR</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── StrategyFieldInput ───────────────────────────────────────────────────────
function SFI({ field, value, onChange }) {
  if(field.type==='checkbox'){
    const on=value===true||value==='true';
    return (
      <div className="ck-field" onClick={()=>onChange(!on)}>
        <div className={`ck-box ${on?'on':''}`}>{on&&I.Chk}</div>
        <span className="ck-lbl">{field.name}</span>
      </div>
    );
  }
  if(field.type==='multiselect'){
    const selected=Array.isArray(value)?value:(value?[value]:[]);
    const toggle=opt=>{
      const next=selected.includes(opt)?selected.filter(x=>x!==opt):[...selected,opt];
      onChange(next);
    };
    return (
      <div>
        <div className="f" style={{marginBottom:4}}><label>{field.name}</label></div>
        <div className="ms-wrap">
          {(field.options||[]).map(opt=>(
            <button key={opt} type="button"
              className={`ms-chip ${selected.includes(opt)?'on':''}`}
              onClick={()=>toggle(opt)}
            >{opt}</button>
          ))}
        </div>
      </div>
    );
  }
  if(field.type==='dropdown'){
    return (
      <div className="f">
        <label>{field.name}</label>
        <select value={value||''} onChange={e=>onChange(e.target.value)}>
          <option value="">— select —</option>
          {(field.options||[]).map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="f">
      <label>{field.name}</label>
      <input type="text" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Your answer…"/>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser,setAuthUser]=useState(undefined);
  const [profile,setProfile]=useState(null);
  const [trades,setTrades]=useState([]);
  const [view,setView]=useState('dashboard');

  useEffect(()=>{
    let m=true;
    (async()=>{
      try{
        if(typeof __initial_auth_token!=='undefined'&&__initial_auth_token){
          const {signInWithCustomToken:sct}=await import('firebase/auth');
          await sct(auth,__initial_auth_token);
        }
      }catch{}
    })();
    return onAuthStateChanged(auth,u=>{if(m)setAuthUser(u)});
  },[]);

  useEffect(()=>{
    if(!authUser){setProfile(null);return}
    getDoc(userDoc(authUser.uid)).then(s=>{
      setProfile(s.exists()?s.data():null);
    });
  },[authUser]);

  useEffect(()=>{
    if(!authUser||!profile) return;
    return onSnapshot(tradesCol(),snap=>{
      setTrades(snap.docs.map(d=>({id:d.id,...d.data()})).filter(t=>t.userId===authUser.uid));
    });
  },[authUser,profile]);

  const addTrade=async t=>{
    await setDoc(tradeDoc(genId()),{...t,userId:authUser.uid,createdAt:Date.now()});
    setView('journal');
  };
  const delTrade=async id=>deleteDoc(tradeDoc(id));
  const savePro=async p=>{
    await setDoc(userDoc(authUser.uid),p,{merge:true});
    setProfile(p);
  };
  const handleSignOut=async()=>{await signOut(auth);setProfile(null)};

  if(authUser===undefined) return (
    <>
      <style>{S}</style>
      <div className="ambient"><div className="ambient-blob blob1"/><div className="ambient-blob blob2"/><div className="ambient-blob blob3"/></div>
      <div className="loader-sh"><div className="loader-ring"/><div className="loader-txt">Loading</div></div>
    </>
  );

  if(!authUser||!profile) return (
    <>
      <style>{S}</style>
      <div className="ambient"><div className="ambient-blob blob1"/><div className="ambient-blob blob2"/><div className="ambient-blob blob3"/></div>
      <AuthFlow onComplete={p=>{setProfile(p)}}/>
    </>
  );

  const fields=profile.strategy?.fields||[];
  const NAV=[
    {id:'dashboard',label:'Overview',icon:I.Grid},
    {id:'journal',label:'Journal',icon:I.Book},
    {id:'add',label:'Log Trade',icon:I.Plus},
    {id:'insights',label:'Insights',icon:I.Chart},
    {id:'settings',label:'Strategy',icon:I.Cog},
  ];

  return (
    <>
      <style>{S}</style>
      <div className="ambient"><div className="ambient-blob blob1"/><div className="ambient-blob blob2"/><div className="ambient-blob blob3"/></div>
      <div className="shell">
        <nav className="sidebar">
          <div className="sb-top">
            <div className="sb-logo">PIP <span>BY</span> PIP</div>
            <div className="sb-sync"><span className="sync-dot"/>Live Sync</div>
          </div>
          <div className="nav">
            {NAV.map(n=>(
              <button key={n.id} className={`nb ${view===n.id?'on':''}`} onClick={()=>setView(n.id)}>
                {n.icon}<span>{n.label}</span>
              </button>
            ))}
          </div>
          <div className="sb-user">
            <div className="user-tile" onClick={()=>setView('settings')}>
              <div className="avatar">{(profile.username||'?')[0].toUpperCase()}</div>
              <div><div className="u-name">{profile.username}</div><div className="u-sub">{profile.strategy?.name||'—'}</div></div>
            </div>
            <button className="so-btn" onClick={handleSignOut}>Sign out</button>
          </div>
        </nav>
        <main className="main">
          {view==='dashboard'&&<DashboardPage key="dash" trades={trades} profile={profile}/>}
          {view==='journal'  &&<JournalPage   key="jrnl" trades={trades} fields={fields} onDelete={delTrade}/>}
          {view==='add'      &&<AddTradePage  key="add"  profile={profile} onAdd={addTrade}/>}
          {view==='insights' &&<InsightsPage  key="ins"  trades={trades}/>}
          {view==='settings' &&<SettingsPage  key="set"  profile={profile} onSave={savePro}/>}
        </main>
      </div>
    </>
  );
}

// ─── AuthFlow ─────────────────────────────────────────────────────────────────
function AuthFlow({onComplete}) {
  const [step,setStep]=useState('login');
  const [form,setForm]=useState({username:'',password:'',confirm:''});
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const [newUser,setNewUser]=useState(null);
  const [stratName,setStratName]=useState('');
  const [fields,setFields]=useState([]);
  const [adding,setAdding]=useState(false);
  const [nf,setNf]=useState({name:'',type:'dropdown',options:[],optIn:''});

  const doLogin=async e=>{
    e.preventDefault();setErr('');setLoading(true);
    try{
      const c=await signInWithEmailAndPassword(auth,toEmail(form.username),form.password);
      const s=await getDoc(userDoc(c.user.uid));
      if(s.exists()) onComplete(s.data());
      else setErr('Account found but profile is missing.');
    }catch(ex){
      const msg={
        'auth/user-not-found':'No account with that username.',
        'auth/invalid-credential':'Incorrect username or password.',
        'auth/wrong-password':'Incorrect password.',
        'auth/invalid-email':'Invalid username format.'
      }[ex.code]||'Sign-in failed. Check your details.';
      setErr(msg);
    }
    setLoading(false);
  };

  const doRegister=async e=>{
    e.preventDefault();setErr('');
    if(form.password.length<6){setErr('Password must be at least 6 characters.');return}
    if(form.password!==form.confirm){setErr("Passwords don't match.");return}
    setLoading(true);
    try{
      const c=await createUserWithEmailAndPassword(auth,toEmail(form.username),form.password);
      setNewUser(c.user);setStep('build');
    }catch(ex){
      if(ex.code==='auth/email-already-in-use') setErr('Username taken. Try logging in.');
      else setErr('Registration failed: '+ex.message);
    }
    setLoading(false);
  };

  const doFinish=async()=>{
    if(!stratName.trim()){setErr('Name your strategy.');return}
    if(!fields.length){setErr('Add at least one step.');return}
    setLoading(true);
    const p={uid:newUser.uid,username:form.username,strategy:{name:stratName,fields},createdAt:Date.now()};
    await setDoc(userDoc(newUser.uid),p);
    onComplete(p);
    setLoading(false);
  };

  const addField=()=>{
    if(!nf.name.trim()) return;
    if((nf.type==='dropdown'||nf.type==='multiselect')&&!nf.options.length) return;
    setFields([...fields,{id:genId(),name:nf.name,type:nf.type,options:nf.options}]);
    setNf({name:'',type:'dropdown',options:[],optIn:''});
    setAdding(false);
  };
  const rmField=id=>setFields(fields.filter(f=>f.id!==id));
  const mvField=(i,d)=>{const a=[...fields];const t=i+d;if(t<0||t>=a.length)return;[a[i],a[t]]=[a[t],a[i]];setFields(a)};

  const typeLabel={dropdown:'Dropdown',text:'Free Text',checkbox:'Tick (Yes/No)',multiselect:'Multi-Select'};

  if(step!=='build') return (
    <div className="auth-shell">
      <div className="auth-glow"/>
      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="brand-title">PIP BY PIP</div>
          <div className="brand-sub">Trading Journal & Backtester</div>
        </div>
        <div className="auth-card">
          <div className="auth-card-shine"/>
          <div className="auth-card-body">
            <div className="auth-eyebrow">{step==='register'?'Create Account':'Sign In'}</div>
            <div className="auth-heading">{step==='register'?'Start your journal':'Welcome back, trader'}</div>
            <div className="auth-desc">
              {step==='register'
                ?'Pick a username and password. No email needed — your username is your identity.'
                :'Enter your username and password to access your journal.'}
            </div>
            {err&&<div className="auth-err">{err}</div>}
            <form onSubmit={step==='register'?doRegister:doLogin}>
              <div className="f s0"><label>Username</label>
                <input type="text" required value={form.username} autoComplete="username"
                  onChange={e=>setForm({...form,username:e.target.value})}
                  placeholder="e.g. sadik_yakasai"/>
              </div>
              <div className="f s1"><label>Password</label>
                <input type="password" required value={form.password} autoComplete={step==='register'?'new-password':'current-password'}
                  onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/>
              </div>
              {step==='register'&&<div className="f s2"><label>Confirm Password</label>
                <input type="password" required value={form.confirm} autoComplete="new-password"
                  onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="••••••••"/>
              </div>}
              <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{marginTop:8,padding:'14px',fontSize:11}}>
                {loading?'One moment…':step==='register'?'Create Account →':'Enter Journal →'}
              </button>
            </form>
            <div style={{textAlign:'center',marginTop:20}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setStep(step==='register'?'login':'register');setErr('')}}>
                {step==='register'?'Already have an account? Sign in':"New here? Create an account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="builder-shell">
      <div className="builder-wrap">
        <div className="auth-brand" style={{textAlign:'left',marginBottom:32}}>
          <div className="brand-title" style={{fontSize:40}}>PIP BY PIP</div>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width:'66%'}}/></div>
        <div className="b-step">Step 2 of 2 — Your Strategy</div>
        <div className="b-title">Build your<br/>trading checklist</div>
        <div className="b-desc">
          Every trade you log will be guided by these steps — your personal system, your rules. Define each decision point: whether it's a bias, a pattern, a confirmation. Each step becomes a field in your trade log.
        </div>
        {err&&<div className="auth-err">{err}</div>}
        <div className="strat-name-area">
          <div className="strat-name-label">What do you call your strategy?</div>
          <input className="strat-name-input" value={stratName} onChange={e=>setStratName(e.target.value)} placeholder="e.g. Market Structure, ICT, My System…"/>
        </div>
        {!!fields.length&&(
          <div className="fl-list">
            {fields.map((f,i)=>(
              <div key={f.id} className="fl-row page-enter">
                <div className="fl-left">
                  <div className="fl-num">{i+1}</div>
                  <div>
                    <div className="fl-name">{f.name}</div>
                    <div className="fl-type">{typeLabel[f.type]}{(f.type==='dropdown'||f.type==='multiselect')&&f.options.length?` · ${f.options.join(', ')}`:''}</div>
                  </div>
                </div>
                <div className="fl-acts">
                  <button className="ib" onClick={()=>mvField(i,-1)}>{I.Up}</button>
                  <button className="ib" onClick={()=>mvField(i,1)}>{I.Down}</button>
                  <button className="ib del" onClick={()=>rmField(f.id)}>{I.Trash}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {adding?(
          <div className="add-panel">
            <div className="add-panel-title">New Step</div>
            <div className="f"><label>Name / Question</label>
              <input type="text" value={nf.name} autoFocus onChange={e=>setNf({...nf,name:e.target.value})}
                placeholder="e.g. HTF Bias? / Clear BOS? / Which liquidity target?"/>
            </div>
            <div style={{marginBottom:18}}>
              <div className="f" style={{marginBottom:10}}><label>Answer Type</label></div>
              <div className="type-tabs">
                {['dropdown','multiselect','text','checkbox'].map(t=>(
                  <button key={t} className={`type-tab ${nf.type===t?'on':''}`} onClick={()=>setNf({...nf,type:t})}>
                    {typeLabel[t]}
                  </button>
                ))}
              </div>
              <div style={{fontSize:9,color:'var(--text3)',letterSpacing:1,marginTop:6,lineHeight:1.6}}>
                {nf.type==='dropdown'&&'Choose one option from a list you define.'}
                {nf.type==='multiselect'&&'Select multiple options at once — great for POIs, confluences, or anything where more than one answer applies.'}
                {nf.type==='text'&&'Write a free-form answer each time you log a trade.'}
                {nf.type==='checkbox'&&'A single tick — condition met, or it isn\'t. Clean and simple.'}
              </div>
            </div>
            {(nf.type==='dropdown'||nf.type==='multiselect')&&(
              <div className="f">
                <label>Options</label>
                <div className="opts-row">
                  <div className="f" style={{margin:0,flex:1}}>
                    <input type="text" value={nf.optIn} placeholder="Add option…"
                      onChange={e=>setNf({...nf,optIn:e.target.value})}
                      onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(nf.optIn.trim())setNf({...nf,options:[...nf.options,nf.optIn.trim()],optIn:''})}}}
                    />
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{if(nf.optIn.trim())setNf({...nf,options:[...nf.options,nf.optIn.trim()],optIn:''})}}>Add</button>
                </div>
                {!!nf.options.length&&<div className="opt-tags">{nf.options.map((o,i)=>(
                  <span key={i} className="ot">{o}<button onClick={()=>setNf({...nf,options:nf.options.filter((_,j)=>j!==i)})}>×</button></span>
                ))}</div>}
              </div>
            )}
            <div style={{display:'flex',gap:8,marginTop:4}}>
              <button className="btn btn-primary" onClick={addField}>Add Step</button>
              <button className="btn btn-ghost" onClick={()=>{setAdding(false);setNf({name:'',type:'dropdown',options:[],optIn:''})}}>Cancel</button>
            </div>
          </div>
        ):(
          <button className="add-trig" onClick={()=>setAdding(true)}>{I.Plus} Add a strategy step</button>
        )}
        <button className="commit-btn" onClick={doFinish} disabled={loading} style={{borderRadius:8}}>
          {loading?'Saving…':"I'm done — Open my journal"}
        </button>
        <p style={{fontSize:9,color:'var(--text3)',textAlign:'center',marginTop:12,letterSpacing:1}}>
          You can always edit or add steps later in Strategy settings.
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardPage({trades,profile}) {
  const [scope,setScope]=useState('all');
  const filtered=scope==='all'?trades:trades.filter(t=>t.mode===scope);
  const stats=useMemo(()=>{
    const v=filtered.filter(t=>t.outcome!=='No Trade');
    const w=v.filter(t=>t.outcome==='Win');
    const r=filtered.reduce((s,t)=>s+parseFloat(t.resultR||0),0);
    const wr=v.length>0?(w.length/v.length)*100:0;
    const avg=v.length>0?r/v.length:0;
    let streak=0;
    const sorted=[...v].sort((a,b)=>new Date(b.date)-new Date(a.date));
    for(const t of sorted){if(t.outcome==='Win')streak++;else break}
    return {wr,r,total:filtered.length,valid:v.length,wins:w.length,avg,streak};
  },[filtered]);
  const recent=[...trades].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  const fields=profile.strategy?.fields||[];

  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Overview</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div>
            <div className="ph-title">Good session,<br/><em>{profile.username}</em></div>
            <div className="ph-sub">{profile.strategy?.name||'No strategy'} · {stats.total} trades logged</div>
          </div>
          <div className="ftabs">
            {[['all','All'],['Live','Live'],['Backtest','Backtest']].map(([v,l])=>(
              <button key={v} className={`ftab ${scope===v?'on':''}`} onClick={()=>setScope(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:20,alignItems:'flex-start',marginBottom:28}}>
        <div className="page-enter s0"><WinRateRing pct={stats.wr} size={96}/></div>
        <div className="stat-grid" style={{flex:1}}>
          {[
            {label:'Net R',val:<AnimNum val={stats.r} dec={2} prefix={stats.r>=0?'+':''} suffix="R"/>,cls:stats.r>0?'pos':stats.r<0?'neg':'wht',c:'c-gold',bg:'NET R'},
            {label:'Avg R/Trade',val:<AnimNum val={stats.avg} dec={2} prefix={stats.avg>=0?'+':''} suffix="R"/>,cls:stats.avg>0?'pos':stats.avg<0?'neg':'wht',c:'c-green',bg:'AVG'},
            {label:'Trades',val:<AnimNum val={stats.valid} dec={0}/>,cls:'cyn',c:'c-cyan',bg:'TOTAL'},
            {label:'Win Streak',val:<AnimNum val={stats.streak} dec={0}/>,cls:'gld',c:'c-gold',bg:'STREAK'},
          ].map((x,i)=>(
            <div key={i} className={`sc ${x.c} page-enter s${i+1}`}>
              <div className="sc-label">{x.label}</div>
              <div className={`sc-val ${x.cls}`}>{x.val}</div>
              <div className="sc-sub">{i===2?`${stats.total-stats.valid} skipped`:i===3?'Current run':i===0?'Risk-multiple':'Expectancy'}</div>
              <div className="sc-bg-icon">{x.bg}</div>
            </div>
          ))}
        </div>
      </div>
      <EquityCurve trades={filtered}/>
      <AssetBars trades={filtered}/>
      <div className="sl">Recent Entries</div>
      <div className="tbl-card page-enter s3">
        {!recent.length?<div className="empty-st">No trades yet. Start logging.</div>:
          <table>
            <thead><tr>
              <th>Date</th><th>Mode</th><th>Asset</th>
              {fields.slice(0,3).map(f=><th key={f.id}>{f.name}</th>)}
              <th>Outcome</th><th>R</th>
            </tr></thead>
            <tbody>
              {recent.map(t=>(
                <tr key={t.id}>
                  <td className="td-date">{fmtD(t.date)}</td>
                  <td><span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span></td>
                  <td style={{color:'var(--text)'}}>{t.asset||'—'}</td>
                  {fields.slice(0,3).map(f=>{
                    const v=t.strategyData?.[f.id];
                    const d=f.type==='checkbox'?(v?'✓':'—'):Array.isArray(v)?v.join(', '):(v||'—');
                    return <td key={f.id} style={{color:'var(--text2)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis'}}>{d}</td>;
                  })}
                  <td className={t.outcome==='Win'?'td-win':t.outcome==='Loss'?'td-loss':'td-be'}>{t.outcome}</td>
                  <td className={rClass(t.resultR)} style={{fontWeight:600}}>{rSign(t.resultR)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

// ─── Journal ─────────────────────────────────────────────────────────────────
function JournalPage({trades,fields,onDelete}) {
  const [scope,setScope]=useState('all');
  const [conf,setConf]=useState(null);
  const sorted=[...trades].filter(t=>scope==='all'||t.mode===scope).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Journal</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">All Trades</div><div className="ph-sub">{sorted.length} entries</div></div>
          <div className="ftabs">
            {[['all','All'],['Live','Live'],['Backtest','Backtest']].map(([v,l])=>(
              <button key={v} className={`ftab ${scope===v?'on':''}`} onClick={()=>setScope(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="tbl-card">
        {!sorted.length?<div className="empty-st">No trades to show.</div>:
          <table>
            <thead><tr>
              <th>Date</th><th>Mode</th><th>Asset</th>
              {fields.map(f=><th key={f.id}>{f.name}</th>)}
              <th>Outcome</th><th>R</th><th>Notes</th><th></th>
            </tr></thead>
            <tbody>
              {sorted.map(t=>(
                <tr key={t.id}>
                  <td className="td-date">{fmtD(t.date)}</td>
                  <td><span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span></td>
                  <td style={{color:'var(--text)'}}>{t.asset||'—'}</td>
                  {fields.map(f=>{
                    const v=t.strategyData?.[f.id];
                    const d=f.type==='checkbox'?(v?'✓':'✗'):Array.isArray(v)?v.join(', '):(v||'—');
                    return <td key={f.id} style={{color:'var(--text2)',maxWidth:130,overflow:'hidden',textOverflow:'ellipsis'}}>{d}</td>;
                  })}
                  <td className={t.outcome==='Win'?'td-win':t.outcome==='Loss'?'td-loss':'td-be'}>{t.outcome}</td>
                  <td className={rClass(t.resultR)} style={{fontWeight:600}}>{rSign(t.resultR)}</td>
                  <td className="td-note">{t.notes||'—'}</td>
                  <td>
                    {conf===t.id?(
                      <span style={{display:'flex',gap:4}}>
                        <button className="btn btn-danger btn-sm" onClick={()=>{onDelete(t.id);setConf(null)}}>Delete</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setConf(null)}>No</button>
                      </span>
                    ):(
                      <button className="ib del" onClick={()=>setConf(t.id)} style={{padding:6}}>{I.Trash}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

// ─── Add Trade ───────────────────────────────────────────────────────────────
function AddTradePage({profile,onAdd}) {
  const fields=profile.strategy?.fields||[];
  const [mode,setMode]=useState('Live');
  const [base,setBase]=useState({date:new Date().toISOString().split('T')[0],asset:'',resultR:'',outcome:'Win',notes:''});
  const [sdata,setSdata]=useState({});
  const [saving,setSaving]=useState(false);

  const submit=async e=>{
    e.preventDefault();setSaving(true);
    await onAdd({...base,strategyData:sdata,mode,strategyName:profile.strategy?.name});
    setSaving(false);
  };

  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Log Trade</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">New Entry</div><div className="ph-sub">{profile.strategy?.name}</div></div>
          <div className="mtoggle">
            {['Live','Backtest'].map(m=>(
              <button key={m} className={`mpill ${mode===m?(m==='Live'?'ml':'mb'):''}`} onClick={()=>setMode(m)}>{m}</button>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={submit} style={{maxWidth:820}}>
        <div className="fp s0">
          <div className="fp-title">Core Data</div>
          <div className="fg3">
            <div className="f" style={{margin:0}}><label>Date</label><input type="date" value={base.date} onChange={e=>setBase({...base,date:e.target.value})} required/></div>
            <div className="f" style={{margin:0}}><label>Asset</label>
              <select value={base.asset} onChange={e=>setBase({...base,asset:e.target.value})} required>
                <option value="">— select —</option>
                {ASSETS.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="f" style={{margin:0}}><label>Outcome</label>
              <select value={base.outcome} onChange={e=>setBase({...base,outcome:e.target.value})}>
                {['Win','Loss','Breakeven','No Trade'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:18,maxWidth:220}}>
            <div className="f" style={{margin:0}}><label>Result (R)</label>
              <input type="number" step="0.01" value={base.resultR} onChange={e=>setBase({...base,resultR:e.target.value})}
                placeholder="e.g. 2.5 or -1" required/>
            </div>
          </div>
        </div>
        {!!fields.length&&(
          <div className="fp s1">
            <div className="fp-title">Strategy Checklist — {profile.strategy?.name}</div>
            {fields.map((f,i)=>(
              <div key={f.id} className="strat-step">
                <div className="step-lbl"><div className="step-num">{i+1}</div>{f.type!=='checkbox'&&f.name}</div>
                <SFI field={f} value={sdata[f.id]} onChange={v=>setSdata({...sdata,[f.id]:v})}/>
              </div>
            ))}
          </div>
        )}
        <div className="fp s2">
          <div className="fp-title">Post-Trade Notes</div>
          <div className="f" style={{margin:0}}>
            <textarea value={base.notes} onChange={e=>setBase({...base,notes:e.target.value})}
              placeholder="What went well? What would you change? Any market observations…"/>
          </div>
        </div>
        <button type="submit" className="commit-btn" disabled={saving} style={{marginTop:4}}>
          {saving?'Committing…':'Commit to Journal'}
        </button>
      </form>
    </div>
  );
}

// ─── Insights ────────────────────────────────────────────────────────────────
function InsightsPage({trades}) {
  const [scope,setScope]=useState('all');
  const filtered=scope==='all'?trades:trades.filter(t=>t.mode===scope);
  const stats=useMemo(()=>{
    const v=filtered.filter(t=>t.outcome!=='No Trade');
    const w=v.filter(t=>t.outcome==='Win');
    const l=v.filter(t=>t.outcome==='Loss');
    const aw=w.length?w.reduce((s,t)=>s+parseFloat(t.resultR||0),0)/w.length:0;
    const al=l.length?Math.abs(l.reduce((s,t)=>s+parseFloat(t.resultR||0),0)/l.length):0;
    const pf=al>0?(w.length*aw)/(l.length*al):0;
    let peak=0,dd=0,cum=0;
    [...v].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t=>{
      cum+=parseFloat(t.resultR||0);
      if(cum>peak) peak=cum;
      if(peak-cum>dd) dd=peak-cum;
    });
    const days={};
    v.forEach(t=>{
      const d=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(t.date+'T12:00:00').getDay()];
      if(!days[d]) days[d]={r:0,n:0};
      days[d].r+=parseFloat(t.resultR||0); days[d].n++;
    });
    return {aw,al,pf,dd,days};
  },[filtered]);
  const dayMx=Math.max(...Object.values(stats.days).map(d=>Math.abs(d.r)),0.01);
  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Deep Insights</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">Numbers<br/><em style={{color:'var(--cyan)'}}>Don't Lie</em></div></div>
          <div className="ftabs">
            {[['all','All'],['Live','Live'],['Backtest','Backtest']].map(([v,l])=>(
              <button key={v} className={`ftab ${scope===v?'on':''}`} onClick={()=>setScope(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="ins-grid">
        {[
          {label:'Avg Winner',val:<AnimNum val={stats.aw} dec={2} prefix="+R "/>,color:'var(--green)',sub:'Per winning trade'},
          {label:'Avg Loser', val:<AnimNum val={stats.al} dec={2} prefix="-R "/>,color:'var(--red)',sub:'Per losing trade'},
          {label:'Profit Factor',val:<AnimNum val={stats.pf} dec={2}/>,color:stats.pf>=1.5?'var(--green)':stats.pf>=1?'var(--gold)':'var(--red)',sub:'>1.5 is strong'},
          {label:'Max Drawdown',val:<AnimNum val={stats.dd} dec={2} prefix="-R "/>,color:'var(--red)',sub:'Peak to trough'},
        ].map((x,i)=>(
          <div key={i} className="ins-box page-enter" style={{animationDelay:`${i*0.06}s`}}>
            <div className="ins-label">{x.label}</div>
            <div className="ins-val" style={{color:x.color}}>{x.val}</div>
            <div className="ins-sub">{x.sub}</div>
          </div>
        ))}
      </div>
      <EquityCurve trades={filtered}/>
      <AssetBars trades={filtered}/>
      {!!Object.keys(stats.days).length&&(
        <>
          <div className="sl">Performance by Day of Week</div>
          <div className="ab-list">
            {['Mon','Tue','Wed','Thu','Fri'].filter(d=>stats.days[d]).map(d=>{
              const s=stats.days[d];
              return (
                <div key={d} className="ab-row">
                  <div className="ab-name">{d}</div>
                  <div className="ab-track">
                    <div className="ab-fill" style={{width:`${(Math.abs(s.r)/dayMx)*100}%`,background:s.r>=0?'var(--green)':'var(--red)'}}/>
                  </div>
                  <div className={`ab-r ${s.r>=0?'td-win':'td-loss'}`}>{rSign(s.r)}</div>
                  <div className="ab-wr">{s.n} trades</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsPage({profile,onSave}) {
  const [strat,setStrat]=useState(profile.strategy||{name:'',fields:[]});
  const [adding,setAdding]=useState(false);
  const [nf,setNf]=useState({name:'',type:'dropdown',options:[],optIn:''});
  const [saved,setSaved]=useState(false);
  const typeLabel={dropdown:'Dropdown',text:'Free Text',checkbox:'Tick',multiselect:'Multi-Select'};

  const save=async s=>{setStrat(s);await onSave({...profile,strategy:s});setSaved(true);setTimeout(()=>setSaved(false),2000)};
  const addF=()=>{
    if(!nf.name.trim()) return;
    if((nf.type==='dropdown'||nf.type==='multiselect')&&!nf.options.length) return;
    save({...strat,fields:[...strat.fields,{id:genId(),name:nf.name,type:nf.type,options:nf.options}]});
    setNf({name:'',type:'dropdown',options:[],optIn:''});setAdding(false);
  };
  const rmF=id=>save({...strat,fields:strat.fields.filter(f=>f.id!==id)});
  const mvF=(i,d)=>{const a=[...strat.fields];const t=i+d;if(t<0||t>=a.length)return;[a[i],a[t]]=[a[t],a[i]];save({...strat,fields:a})};

  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Strategy Settings</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">Your Checklist</div></div>
          {saved&&<span className="saved-flash">✓ Saved</span>}
        </div>
        <div className="ph-sub">Edit your strategy steps. Changes take effect on the next trade you log.</div>
      </div>
      <div className="settings-wrap">
        <div className="strat-name-area">
          <div className="strat-name-label">Strategy Name</div>
          <input className="strat-name-input" value={strat.name} onChange={e=>setStrat({...strat,name:e.target.value})} onBlur={()=>save(strat)} placeholder="Strategy name…"/>
        </div>
        <div className="fl-list">
          {strat.fields.map((f,i)=>(
            <div key={f.id} className="fl-row page-enter">
              <div className="fl-left">
                <div className="fl-num">{i+1}</div>
                <div>
                  <div className="fl-name">{f.name}</div>
                  <div className="fl-type">{typeLabel[f.type]||f.type}{(f.type==='dropdown'||f.type==='multiselect')&&f.options?.length?` · ${f.options.join(', ')}`:''}</div>
                </div>
              </div>
              <div className="fl-acts">
                <button className="ib" onClick={()=>mvF(i,-1)}>{I.Up}</button>
                <button className="ib" onClick={()=>mvF(i,1)}>{I.Down}</button>
                <button className="ib del" onClick={()=>rmF(f.id)}>{I.Trash}</button>
              </div>
            </div>
          ))}
        </div>
        {adding?(
          <div className="add-panel">
            <div className="add-panel-title">New Step</div>
            <div className="f"><label>Name</label>
              <input type="text" value={nf.name} autoFocus onChange={e=>setNf({...nf,name:e.target.value})} placeholder="e.g. HTF Bias, Liquidity Target…"/>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:8,letterSpacing:3,textTransform:'uppercase',color:'var(--text2)',marginBottom:8}}>Answer Type</div>
              <div className="type-tabs">
                {['dropdown','multiselect','text','checkbox'].map(t=>(
                  <button key={t} className={`type-tab ${nf.type===t?'on':''}`} onClick={()=>setNf({...nf,type:t})}>{typeLabel[t]}</button>
                ))}
              </div>
            </div>
            {(nf.type==='dropdown'||nf.type==='multiselect')&&(
              <div className="f">
                <label>Options</label>
                <div className="opts-row">
                  <div className="f" style={{margin:0,flex:1}}>
                    <input type="text" value={nf.optIn} placeholder="Add option…"
                      onChange={e=>setNf({...nf,optIn:e.target.value})}
                      onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(nf.optIn.trim())setNf({...nf,options:[...nf.options,nf.optIn.trim()],optIn:''})}}}
                    />
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{if(nf.optIn.trim())setNf({...nf,options:[...nf.options,nf.optIn.trim()],optIn:''})}}>Add</button>
                </div>
                {!!nf.options.length&&<div className="opt-tags">{nf.options.map((o,i)=>(
                  <span key={i} className="ot">{o}<button onClick={()=>setNf({...nf,options:nf.options.filter((_,j)=>j!==i)})}>×</button></span>
                ))}</div>}
              </div>
            )}
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={addF}>Save Step</button>
              <button className="btn btn-ghost" onClick={()=>{setAdding(false);setNf({name:'',type:'dropdown',options:[],optIn:''})}}>Cancel</button>
            </div>
          </div>
        ):(
          <button className="add-trig" onClick={()=>setAdding(true)}>{I.Plus} Add a step</button>
        )}
        <div className="div"/>
        <div style={{background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:8,padding:'22px 26px'}}>
          <div style={{fontSize:8,letterSpacing:3,textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Account</div>
          <div style={{fontSize:14,color:'var(--text)',marginBottom:4,fontWeight:500}}>@{profile.username}</div>
          <div style={{fontSize:9,color:'var(--text3)',letterSpacing:1}}>
            Member since {profile.createdAt?new Date(profile.createdAt).toLocaleDateString('en-GB',{month:'long',year:'numeric'}):'—'}
          </div>
        </div>
      </div>
    </div>
  );
}
