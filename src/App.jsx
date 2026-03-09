import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc, getDocs
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
const usersCol = () => collection(db,'artifacts',APP_ID,'public','data','users');
const genId = () => Math.random().toString(36).slice(2,9);

const ASSETS = [
  'EUR/USD','GBP/USD','USD/JPY','GBP/JPY','AUD/USD','USD/CAD',
  'NZD/USD','EUR/JPY','EUR/GBP','USD/CHF',
  'XAU/USD (Gold)','XAG/USD (Silver)','NAS100 (Nasdaq)','SPX500 (S&P 500)'
];

const SESSIONS = ['No Session','London','New York','Asia','Overlap'];

// ─────────────────────────────────────────────────────────────
//  THEME STYLES
// ─────────────────────────────────────────────────────────────
const DARK_THEME = `
  --bg:        #0c0d12;
  --bg1:       #11131a;
  --bg2:       #161820;
  --bg3:       #1c1e28;
  --bg4:       #232633;
  --line:      rgba(255,255,255,0.07);
  --line2:     rgba(255,255,255,0.13);
  --accent:    #e8a045;
  --accent-d:  #c4832a;
  --accent-g:  rgba(232,160,69,0.10);
  --accent-gs: rgba(232,160,69,0.05);
  --green:     #4ade9a;
  --green-g:   rgba(74,222,154,0.10);
  --red:       #f06b6b;
  --red-g:     rgba(240,107,107,0.10);
  --blue:      #6db8ff;
  --text:      #d4d7e8;
  --text2:     #8b8fa8;
  --text3:     #484c64;
  --white:     #f0f2ff;
`;

const LIGHT_THEME = `
  --bg:        #f6f5f1;
  --bg1:       #edecea;
  --bg2:       #e7e6e2;
  --bg3:       #dddbd8;
  --bg4:       #d0ceca;
  --line:      rgba(0,0,0,0.08);
  --line2:     rgba(0,0,0,0.15);
  --accent:    #b86a12;
  --accent-d:  #9a5510;
  --accent-g:  rgba(184,106,18,0.10);
  --accent-gs: rgba(184,106,18,0.06);
  --green:     #16874e;
  --green-g:   rgba(22,135,78,0.10);
  --red:       #c43535;
  --red-g:     rgba(196,53,53,0.10);
  --blue:      #1f5fab;
  --text:      #1e1d1a;
  --text2:     #605e58;
  --text3:     #9e9b94;
  --white:     #0f0e0b;
`;

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{${DARK_THEME}
  --display:   'DM Serif Display', serif;
  --sans:      'Plus Jakarta Sans',sans-serif;
  --mono:      'JetBrains Mono',monospace;
  --r:         10px;
  --r2:        14px;
  --sidebar-w: 230px;
}
[data-theme="light"]{${LIGHT_THEME}}

html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--sans);overflow-x:hidden;transition:background 0.3s,color 0.3s;font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px}

@keyframes pageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes drawLine{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes expandIn{from{opacity:0;transform:scaleY(0.95);transform-origin:top}to{opacity:1;transform:scaleY(1)}}

.page-enter{animation:pageIn 0.4s cubic-bezier(0.16,1,0.3,1) both}
.s0{animation-delay:0ms}.s1{animation-delay:60ms}.s2{animation-delay:120ms}.s3{animation-delay:180ms}.s4{animation-delay:240ms}.s5{animation-delay:300ms}

/* ── Auth ── */
.auth-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;padding:24px;background:var(--bg)}
.auth-bg{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 20% 40%,rgba(232,160,69,0.06) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 70%,rgba(74,222,154,0.04) 0%,transparent 70%)}
[data-theme="light"] .auth-bg{background:radial-gradient(ellipse 80% 60% at 20% 40%,rgba(196,118,26,0.08) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 70%,rgba(26,158,96,0.05) 0%,transparent 70%)}
.auth-wrap{width:100%;max-width:420px;position:relative;z-index:1}
.auth-brand{text-align:center;margin-bottom:44px}
.brand-title{font-family:var(--sans);font-size:13px;letter-spacing:6px;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:10px}
.brand-mark{font-family:var(--display);font-size:58px;color:var(--white);line-height:1.05;font-style:italic;font-weight:600;letter-spacing:-0.5px}
.brand-sub{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--text2);margin-top:14px;font-family:var(--mono)}
.auth-card{background:var(--bg2);border:1px solid var(--line2);border-radius:18px;overflow:hidden;position:relative;box-shadow:0 24px 80px rgba(0,0,0,0.25)}
.auth-card-body{padding:38px 42px}
.auth-eyebrow{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:8px;font-family:var(--mono);font-weight:500}
.auth-heading{font-family:var(--display);font-style:italic;font-size:30px;color:var(--white);margin-bottom:10px;font-weight:600;line-height:1.2}
.auth-desc{font-size:13px;color:var(--text2);line-height:1.75;margin-bottom:28px;font-family:var(--sans);font-weight:400}
.auth-err{background:var(--red-g);border:1px solid rgba(240,107,107,0.2);border-radius:var(--r);padding:11px 15px;font-size:12px;color:var(--red);margin-bottom:16px;font-family:var(--sans);font-weight:500}

/* ── Form fields ── */
.f{margin-bottom:20px}
.f label{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);margin-bottom:8px;font-weight:700;font-family:var(--sans)}
.f input,.f select,.f textarea{width:100%;background:var(--bg3);border:1px solid var(--line2);border-radius:var(--r);padding:13px 15px;font-family:var(--sans);font-size:14px;color:var(--white);outline:none;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;-webkit-appearance:none;appearance:none;line-height:1.5;font-weight:500}
.f input:focus,.f select:focus,.f textarea:focus{border-color:var(--accent);background:var(--bg4);box-shadow:0 0 0 3px var(--accent-g)}
.f input::placeholder,.f textarea::placeholder{color:var(--text3);font-weight:400}
.f textarea{min-height:100px;resize:vertical;line-height:1.7}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:var(--r);font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);border:1px solid transparent}
.btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.btn-primary:hover{background:var(--accent-d);box-shadow:0 6px 24px rgba(0,0,0,0.2);transform:translateY(-1px)}
.btn-primary:active{transform:translateY(0)}
.btn-ghost{background:transparent;color:var(--text2);border-color:var(--line2)}
.btn-ghost:hover{border-color:var(--line2);color:var(--text);background:var(--bg3)}
.btn-danger{background:transparent;color:var(--red);border-color:rgba(240,107,107,0.2)}
.btn-danger:hover{background:var(--red-g)}
.btn-full{width:100%}
.btn-sm{padding:8px 16px;font-size:11px}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important}

/* ── App Shell ── */
.shell{display:flex;min-height:100vh;position:relative}

/* ── Sidebar ── */
.sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--bg1);border-right:1px solid var(--line);display:flex;flex-direction:column;position:fixed;height:100vh;z-index:100;top:0;left:0;transition:transform 0.3s cubic-bezier(0.16,1,0.3,1)}
.sb-top{padding:24px 20px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
.sb-brand{display:flex;flex-direction:column;gap:3px}
.sb-logo{font-family:var(--display);font-style:italic;font-size:24px;color:var(--white);line-height:1.1;font-weight:600}
.sb-logo span{color:var(--accent)}
.sb-ver{font-size:10px;letter-spacing:1.5px;color:var(--text3);font-family:var(--mono);text-transform:uppercase}
.sb-sync{display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);font-family:var(--mono)}
.sync-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:pulse 2.5s ease-in-out infinite}
.nav{flex:1;padding:14px 10px;overflow-y:auto}
.nb{width:100%;display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:var(--r);font-family:var(--sans);font-size:13px;font-weight:600;letter-spacing:0.2px;color:var(--text2);background:none;border:none;cursor:pointer;transition:all 0.18s;text-align:left;margin-bottom:3px;position:relative}
.nb svg{opacity:0.5;transition:opacity 0.18s;flex-shrink:0}
.nb:hover{color:var(--text);background:var(--bg2)}
.nb:hover svg{opacity:0.8}
.nb.on{color:var(--accent);background:var(--accent-gs);border:1px solid rgba(232,160,69,0.15)}
.nb.on svg{opacity:1;color:var(--accent)}
.nb.on::before{content:'';position:absolute;left:0;top:25%;bottom:25%;width:2px;border-radius:1px;background:var(--accent)}
.sb-bottom{padding:12px 10px;border-top:1px solid var(--line)}
.user-tile{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:var(--r);background:var(--bg2);border:1px solid var(--line);cursor:pointer;transition:all 0.18s;margin-bottom:10px}
.user-tile:hover{border-color:rgba(232,160,69,0.25);background:var(--bg3)}
.avatar{width:32px;height:32px;border-radius:8px;background:var(--accent-g);border:1px solid rgba(232,160,69,0.3);display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-size:14px;color:var(--accent);flex-shrink:0;font-weight:800}
.u-name{font-size:13px;color:var(--text);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.u-sub{font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono)}
.sb-actions{display:flex;gap:4px;align-items:center;justify-content:space-between;padding:0 4px}
.so-btn{padding:7px 10px;background:none;border:none;font-family:var(--sans);font-size:11px;font-weight:600;color:var(--text3);cursor:pointer;transition:color 0.15s;border-radius:6px}
.so-btn:hover{color:var(--red);background:var(--red-g)}
.theme-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;background:var(--bg2);border:1px solid var(--line2);border-radius:8px;font-family:var(--sans);font-size:11px;font-weight:600;color:var(--text2);cursor:pointer;transition:all 0.18s}
.theme-btn:hover{color:var(--accent);border-color:rgba(232,160,69,0.3)}

/* ── Mobile nav ── */
.mobile-topbar{display:none;position:fixed;top:0;left:0;right:0;background:var(--bg1);border-bottom:1px solid var(--line);padding:13px 18px;z-index:200;align-items:center;justify-content:space-between}
.mobile-logo{font-family:var(--display);font-style:italic;font-size:22px;color:var(--white);font-weight:600}
.mobile-logo span{color:var(--accent)}
.mobile-menu-btn{background:none;border:1px solid var(--line2);border-radius:8px;padding:8px 12px;cursor:pointer;color:var(--text);display:flex;align-items:center;gap:6px;font-size:12px;font-family:var(--sans);font-weight:700}
.mobile-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:98}
.mobile-nav-bottom{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg1);border-top:1px solid var(--line);padding:6px 0 calc(6px + env(safe-area-inset-bottom));z-index:200;align-items:center;justify-content:space-around}
.mnb{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 12px;border:none;background:none;cursor:pointer;color:var(--text3);font-family:var(--sans);font-size:10px;font-weight:600;border-radius:8px;transition:all 0.15s;min-width:56px}
.mnb svg{opacity:0.5}
.mnb.on{color:var(--accent)}
.mnb.on svg{opacity:1;color:var(--accent)}

/* ── Main ── */
.main{margin-left:var(--sidebar-w);flex:1;min-height:100vh}
.page{padding:48px 52px;max-width:1200px}

/* ── Page header ── */
.ph{margin-bottom:44px}
.ph-ey{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:12px;display:flex;align-items:center;gap:10px;font-family:var(--mono);font-weight:500}
.ph-ey::before{content:'';width:20px;height:1px;background:var(--accent);opacity:0.5}
.ph-title{font-family:var(--display);font-size:50px;font-style:italic;color:var(--white);line-height:1.05;font-weight:600}
.ph-title em{color:var(--accent);font-style:italic}
.ph-sub{font-size:14px;color:var(--text2);margin-top:10px;line-height:1.6;font-family:var(--sans);font-weight:400}

/* ── Stats Grid ── */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.sc{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:22px 24px;position:relative;overflow:hidden;transition:all 0.25s;cursor:default}
.sc:hover{border-color:var(--line2);box-shadow:0 12px 32px rgba(0,0,0,0.15)}
.sc-label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text2);margin-bottom:10px;font-family:var(--sans);font-weight:700}
.sc-val{font-family:var(--display);font-size:36px;line-height:1.05;font-style:italic;font-weight:600}
.sc-val.pos{color:var(--green)}.sc-val.neg{color:var(--red)}
.sc-val.acc{color:var(--accent)}.sc-val.wht{color:var(--white)}
.sc-val.blu{color:var(--blue)}
.sc-sub{font-size:11px;color:var(--text3);margin-top:7px;font-family:var(--sans);font-weight:500}
.sc-stripe{position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent);opacity:0}
.sc:hover .sc-stripe{opacity:1;transition:opacity 0.25s}
.sc-stripe.green{background:var(--green)}
.sc-stripe.red{background:var(--red)}
.sc-stripe.blue{background:var(--blue)}

/* ── Section labels ── */
.sl{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text2);margin-bottom:16px;display:flex;align-items:center;gap:12px;font-family:var(--sans);font-weight:700}
.sl::after{content:'';flex:1;height:1px;background:var(--line)}

/* ── Equity Curve ── */
.curve-card{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:26px 30px;margin-bottom:24px}
.curve-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.curve-r{font-family:var(--display);font-size:40px;line-height:1.1;font-style:italic;font-weight:600}
.curve-meta{font-size:12px;color:var(--text3);margin-top:5px;font-family:var(--sans);font-weight:500}

/* ── Asset Bars ── */
.ab-list{display:flex;flex-direction:column;gap:6px;margin-bottom:24px}
.ab-row{display:grid;grid-template-columns:140px 1fr 72px 64px;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);padding:13px 18px;transition:all 0.15s}
.ab-row:hover{border-color:var(--line2);background:var(--bg3)}
.ab-name{font-size:13px;color:var(--text);font-weight:600;font-family:var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ab-track{height:4px;background:var(--bg4);border-radius:2px;overflow:hidden}
.ab-fill{height:100%;border-radius:2px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1)}
.ab-r{font-family:var(--mono);font-size:13px;font-weight:600;text-align:right}
.ab-wr{font-size:11px;color:var(--text3);text-align:right;font-family:var(--mono)}

/* ── Table ── */
.tbl-wrap{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);overflow:hidden}
/* FIX: horizontal scroll for wide tables */
.tbl-scroll{overflow-x:auto;width:100%}
.tbl-wrap table{width:100%;border-collapse:collapse;min-width:700px}
.tbl-wrap thead tr{border-bottom:1px solid var(--line);background:var(--bg3)}
.tbl-wrap th{padding:13px 15px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text2);text-align:left;font-weight:700;font-family:var(--sans);white-space:nowrap}
.tbl-wrap tbody tr{border-bottom:1px solid var(--line);transition:all 0.15s;cursor:pointer}
.tbl-wrap tbody tr:last-child{border-bottom:none}
.tbl-wrap tbody tr:hover{filter:brightness(1.1)}
.tbl-wrap td{padding:12px 15px;font-size:13px;white-space:nowrap;font-family:var(--sans)}
.td-date{color:var(--text2);font-size:12px;font-family:var(--mono)}
.td-win{color:var(--green);font-weight:700}
.td-loss{color:var(--red);font-weight:700}
.td-be{color:var(--accent);font-weight:700}
.td-note{color:var(--text2);font-style:italic;max-width:180px;overflow:hidden;text-overflow:ellipsis}
.badge{display:inline-block;padding:4px 9px;border-radius:5px;font-size:10px;letter-spacing:0.5px;font-weight:700;font-family:var(--sans)}
.bl{background:var(--green-g);color:var(--green)}
.bb{background:rgba(109,184,255,0.1);color:var(--blue)}
.sess-badge{display:inline-block;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;font-family:var(--sans);background:var(--accent-g);color:var(--accent)}
.empty-st{padding:64px;text-align:center;font-size:13px;letter-spacing:2px;color:var(--text3);font-family:var(--sans);font-weight:500}

/* ── Row tinting for win/loss ── */
.row-win{background:rgba(74,222,154,0.05)!important}
.row-loss{background:rgba(240,107,107,0.05)!important}
.row-win:hover{background:rgba(74,222,154,0.10)!important}
.row-loss:hover{background:rgba(240,107,107,0.10)!important}

/* ── Trade detail expand ── */
.trade-detail-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;animation:pageIn 0.2s ease both}
.trade-detail-modal{background:var(--bg2);border:1px solid var(--line2);border-radius:18px;width:100%;max-width:620px;max-height:85vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,0.4)}
.tdm-header{padding:24px 28px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:flex-start;position:sticky;top:0;background:var(--bg2);z-index:2}
.tdm-title{font-family:var(--display);font-size:26px;font-style:italic;color:var(--white);font-weight:600}
.tdm-sub{font-size:12px;color:var(--text3);margin-top:4px;font-family:var(--mono)}
.tdm-body{padding:24px 28px}
.tdm-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.tdm-field{background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.tdm-field-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:6px;font-family:var(--sans);font-weight:700}
.tdm-field-val{font-size:14px;color:var(--text);font-weight:600;font-family:var(--sans)}
.tdm-notes{background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-top:8px}
.tdm-notes-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:8px;font-family:var(--sans);font-weight:700}
.tdm-notes-val{font-size:13px;color:var(--text2);line-height:1.7;font-family:var(--sans)}
.tdm-footer{padding:16px 28px 24px;display:flex;gap:10px;border-top:1px solid var(--line);margin-top:8px}

/* ── Mobile table cards ── */
.trade-cards{display:none;flex-direction:column;gap:10px}
.trade-card{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:16px 18px;cursor:pointer;transition:all 0.15s}
.trade-card:hover{border-color:var(--line2);transform:translateY(-1px)}
.trade-card.win-card{border-left:2px solid var(--green);background:rgba(74,222,154,0.04)}
.trade-card.loss-card{border-left:2px solid var(--red);background:rgba(240,107,107,0.04)}
.tc-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.tc-main{display:flex;align-items:baseline;gap:10px}
.tc-asset{font-size:15px;font-weight:700;color:var(--white);font-family:var(--sans)}
.tc-date{font-size:11px;color:var(--text3);font-family:var(--mono)}
.tc-r{font-size:20px;font-family:var(--display);font-style:italic;font-weight:600}
.tc-meta{display:flex;gap:7px;flex-wrap:wrap}
.tc-note{font-size:13px;color:var(--text2);margin-top:8px;line-height:1.5;font-family:var(--sans)}
.tc-expand-hint{font-size:10px;color:var(--text3);margin-top:6px;font-family:var(--mono);letter-spacing:1px}

/* ── Win Ring ── */
.ring-wrap{position:relative;flex-shrink:0}
.ring-wrap svg{transform:rotate(-90deg);display:block}
.ring-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column}
.ring-pct{font-family:var(--display);font-size:22px;font-style:italic;color:var(--white);line-height:1;font-weight:600}
.ring-lbl{font-size:10px;color:var(--text3);margin-top:3px;font-family:var(--sans);font-weight:600}

/* ── Filter Tabs ── */
.ftabs{display:flex;gap:4px;background:var(--bg2);border:1px solid var(--line);border-radius:30px;padding:4px}
.ftab{padding:7px 16px;border-radius:24px;font-family:var(--sans);font-size:12px;font-weight:700;cursor:pointer;border:none;background:none;color:var(--text3);transition:all 0.18s}
.ftab.on{background:var(--bg4);color:var(--accent)}

/* ── Sort Controls ── */
.sort-row{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.sort-label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text3);font-family:var(--sans);font-weight:700}
.sort-btn{padding:6px 14px;border-radius:20px;font-family:var(--sans);font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--line2);background:var(--bg2);color:var(--text3);transition:all 0.15s;display:flex;align-items:center;gap:5px}
.sort-btn.on{border-color:rgba(232,160,69,0.4);color:var(--accent);background:var(--accent-gs)}
.sort-dir{font-size:10px;opacity:0.7}

/* ── Mode Toggle ── */
.mtoggle{display:flex;gap:6px;margin-bottom:20px}
.mpill{padding:9px 22px;border-radius:20px;font-family:var(--sans);font-size:13px;font-weight:700;cursor:pointer;border:1px solid var(--line2);background:var(--bg2);color:var(--text3);transition:all 0.18s}
.mpill.ml{background:var(--green-g);border-color:rgba(74,222,154,0.3);color:var(--green)}
.mpill.mb{background:rgba(109,184,255,0.08);border-color:rgba(109,184,255,0.25);color:var(--blue)}

/* ── Form Panels ── */
.fp{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:26px 30px;margin-bottom:12px}
.fp-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text2);margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px;font-family:var(--sans)}
.fp-title::before{content:'';width:12px;height:2px;background:var(--accent);opacity:0.8;border-radius:1px}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.fg4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px}

.commit-btn{width:100%;padding:16px;background:var(--accent);border:none;border-radius:var(--r);font-family:var(--sans);font-size:14px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#fff;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.commit-btn:hover{background:var(--accent-d);transform:translateY(-1px);box-shadow:0 6px 28px rgba(0,0,0,0.2)}
.commit-btn:active{transform:translateY(0)}
.commit-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}

/* ── Strategy steps ── */
.strat-step{background:var(--bg3);border:1px solid var(--line);border-radius:var(--r);padding:16px 18px;margin-bottom:8px;transition:border-color 0.18s,box-shadow 0.18s}
.strat-step:focus-within{border-color:rgba(232,160,69,0.3);box-shadow:0 0 0 2px var(--accent-g)}
.step-lbl{font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:8px;font-family:var(--sans)}
.step-num{width:18px;height:18px;border-radius:4px;background:var(--accent-g);border:1px solid rgba(232,160,69,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--accent);font-weight:800;font-family:var(--mono)}

/* ── Checkbox ── */
.ck-field{display:flex;align-items:center;gap:12px;cursor:pointer;padding:4px 0}
.ck-box{width:22px;height:22px;border-radius:6px;flex-shrink:0;border:1.5px solid var(--line2);background:var(--bg4);display:flex;align-items:center;justify-content:center;transition:all 0.18s}
.ck-box.on{background:var(--accent);border-color:var(--accent)}
.ck-lbl{font-size:14px;color:var(--text);transition:color 0.15s;font-family:var(--sans);font-weight:500}
.ck-field:hover .ck-lbl{color:var(--white)}

/* ── Multi-select chips ── */
.ms-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.ms-chip{padding:6px 12px;border-radius:20px;border:1px solid var(--line2);background:var(--bg3);color:var(--text3);font-family:var(--sans);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;user-select:none}
.ms-chip:hover{border-color:rgba(232,160,69,0.3);color:var(--text)}
.ms-chip.on{background:var(--accent-g);border-color:rgba(232,160,69,0.4);color:var(--accent)}

/* ── Builder ── */
.builder-shell{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;position:relative;z-index:1;padding:60px 24px 80px;overflow-y:auto;background:var(--bg)}
.builder-wrap{width:100%;max-width:660px}
.b-step{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:12px;display:flex;align-items:center;gap:8px;font-family:var(--mono);font-weight:500}
.b-step::before{content:'';width:20px;height:1px;background:var(--accent);opacity:0.5}
.b-title{font-family:var(--display);font-style:italic;font-weight:600;font-size:40px;color:var(--white);margin-bottom:14px;line-height:1.1}
.b-desc{font-size:14px;color:var(--text2);line-height:1.8;margin-bottom:34px;font-family:var(--sans)}
.strat-name-area{margin-bottom:28px}
.strat-name-label{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);margin-bottom:10px;font-family:var(--sans);font-weight:700}
.strat-name-input{font-family:var(--display);font-style:italic;font-size:30px;font-weight:600;background:transparent;border:none;border-bottom:1px solid var(--line2);border-radius:0;padding:6px 0;color:var(--white);width:100%;outline:none;transition:border-color 0.2s}
.strat-name-input:focus{border-bottom-color:var(--accent)}
.strat-name-input::placeholder{color:var(--text3)}

.fl-list{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.fl-row{display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);padding:12px 16px;transition:all 0.15s}
.fl-row:hover{border-color:var(--line2)}
.fl-left{display:flex;align-items:center;gap:12px}
.fl-num{width:24px;height:24px;border-radius:6px;background:var(--accent-g);border:1px solid rgba(232,160,69,0.2);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;color:var(--accent);flex-shrink:0;font-weight:700}
.fl-name{font-size:14px;color:var(--text);font-weight:600;font-family:var(--sans)}
.fl-type{font-size:11px;color:var(--text3);margin-top:3px;font-family:var(--sans);font-weight:500}
.fl-acts{display:flex;gap:4px}
.ib{background:none;border:none;cursor:pointer;color:var(--text3);padding:5px;display:flex;align-items:center;transition:color 0.12s;border-radius:4px}
.ib:hover{color:var(--text);background:var(--bg3)}
.ib.del:hover{color:var(--red)}
.ib.edit-btn:hover{color:var(--accent)}

.add-trig{width:100%;padding:16px;border:1.5px dashed var(--line2);border-radius:var(--r);background:none;font-family:var(--sans);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);cursor:pointer;font-weight:700;transition:all 0.18s;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px}
.add-trig:hover{border-color:rgba(232,160,69,0.4);color:var(--accent);background:var(--accent-gs)}

.add-panel{background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r2);padding:22px;margin-bottom:14px;animation:pageIn 0.25s cubic-bezier(0.16,1,0.3,1)}
.add-panel-title{font-size:12px;font-weight:700;color:var(--text2);margin-bottom:16px;font-family:var(--sans);text-transform:uppercase;letter-spacing:1px}
.type-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
.type-tab{padding:7px 14px;border-radius:6px;font-family:var(--sans);font-size:12px;font-weight:700;cursor:pointer;border:1px solid var(--line2);background:var(--bg3);color:var(--text3);transition:all 0.15s}
.type-tab.on{border-color:rgba(232,160,69,0.4);color:var(--accent);background:var(--accent-gs)}
.opts-row{display:flex;gap:8px;align-items:center;margin-bottom:10px}
.opt-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.ot{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:var(--bg3);border:1px solid var(--line2);border-radius:5px;font-size:12px;color:var(--text2);font-family:var(--sans);font-weight:500}
.ot button{background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;line-height:1;padding:0;transition:color 0.1s}
.ot button:hover{color:var(--red)}

/* ── Insights boxes ── */
.ins-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
.ins-box{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:20px 24px;transition:all 0.2s}
.ins-box:hover{border-color:var(--line2)}
.ins-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text2);margin-bottom:10px;font-family:var(--sans)}
.ins-val{font-family:var(--display);font-size:34px;line-height:1.1;font-style:italic;font-weight:600}
.ins-sub{font-size:12px;color:var(--text3);margin-top:5px;font-family:var(--sans);font-weight:500}

/* ── Smart AI panel ── */
.ai-panel{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:24px 28px;margin-bottom:24px;position:relative;overflow:hidden}
.ai-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--green),var(--accent));background-size:200% 100%;animation:shimmer 3s linear infinite}
.ai-header{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.ai-icon{width:32px;height:32px;border-radius:8px;background:var(--accent-g);border:1px solid rgba(232,160,69,0.3);display:flex;align-items:center;justify-content:center;font-size:16px}
.ai-title{font-size:14px;font-weight:800;color:var(--white);font-family:var(--sans)}
.ai-sub{font-size:12px;color:var(--text3);font-family:var(--sans);font-weight:500}
.ai-insights{display:flex;flex-direction:column;gap:10px}
.ai-item{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r)}
.ai-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px}
.ai-item-title{font-size:13px;font-weight:700;color:var(--white);font-family:var(--sans);margin-bottom:5px}
.ai-item-body{font-size:13px;color:var(--text2);line-height:1.6;font-family:var(--sans)}

/* ── Filter Panel ── */
.filter-bar{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2);padding:20px 24px;margin-bottom:24px}
.filter-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text2);margin-bottom:16px;font-family:var(--sans);display:flex;align-items:center;gap:8px}
.filter-title::before{content:'';width:12px;height:1px;background:var(--accent);opacity:0.6}
.filter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.flt-group label{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text2);margin-bottom:7px;font-family:var(--sans);font-weight:700}
.flt-group select,.flt-group input{width:100%;background:var(--bg3);border:1px solid var(--line2);border-radius:8px;padding:10px 13px;font-family:var(--sans);font-size:13px;color:var(--text);font-weight:500;outline:none;-webkit-appearance:none;appearance:none;transition:border-color 0.2s}
.flt-group select:focus,.flt-group input:focus{border-color:var(--accent)}
.filter-actions{display:flex;gap:8px;margin-top:12px;align-items:center}
.flt-count{font-size:12px;color:var(--text3);font-family:var(--sans);font-weight:500}

/* ── Export button ── */
.export-area{display:flex;gap:8px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
.export-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid var(--line2);background:var(--bg2);color:var(--text2);font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:0.5px;cursor:pointer;transition:all 0.18s}
.export-btn:hover{border-color:rgba(232,160,69,0.4);color:var(--accent);background:var(--accent-gs)}

/* ── Settings ── */
.settings-wrap{max-width:660px}
.saved-flash{font-size:12px;color:var(--green);letter-spacing:2px;text-transform:uppercase;font-family:var(--sans);font-weight:700}
.div{width:100%;height:1px;background:var(--line);margin:24px 0}


/* ── Loader ── */
.loader-sh{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;z-index:1;flex-direction:column;gap:16px}
.loader-ring{width:36px;height:36px;border:2px solid var(--line2);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite}
.loader-txt{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);font-family:var(--sans);font-weight:600}

/* ── Progress bar ── */
.prog-bar{height:2px;background:var(--line);border-radius:1px;margin-bottom:32px;overflow:hidden}
.prog-fill{height:100%;background:var(--accent);border-radius:1px;transition:width 0.4s cubic-bezier(0.16,1,0.3,1)}

/* ── Responsive ── */
@media(max-width:768px){
  .sidebar{transform:translateX(-100%)}
  .sidebar.open{transform:translateX(0)}
  .mobile-topbar{display:flex}
  .mobile-overlay.open{display:block}
  .mobile-nav-bottom{display:flex}
  .main{margin-left:0;padding-top:60px;padding-bottom:70px}
  .page{padding:22px 18px 32px}
  .ph{margin-bottom:26px}
  .ph-title{font-size:40px}
  .stat-grid{grid-template-columns:1fr 1fr;gap:8px}
  .sc{padding:16px 18px}
  .sc-val{font-size:28px}
  .sc-label{font-size:10px}
  .sc-sub{font-size:10px}
  .ins-grid{grid-template-columns:1fr}
  .fg2,.fg3,.fg4{grid-template-columns:1fr 1fr}
  .tbl-wrap table{display:none}
  .trade-cards{display:flex}
  .ab-row{grid-template-columns:100px 1fr 60px 50px;padding:10px 12px;gap:8px}
  .curve-card{padding:18px 20px}
  .auth-card-body{padding:28px 24px}
  .brand-mark{font-size:52px}
  .filter-grid{grid-template-columns:1fr 1fr}
  .export-area{gap:6px}
  .ai-panel{padding:18px 20px}
  .tdm-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .fg2,.fg3,.fg4{grid-template-columns:1fr}
  .filter-grid{grid-template-columns:1fr}
  .stat-grid{grid-template-columns:1fr 1fr}
  .ftabs{display:none}
}
`;

// ─── Helpers ────────────────────────────────────────────────────────────────
const rSign = v => { const n=parseFloat(v||0); return `${n>=0?'+':''}${n.toFixed(2)}R` };
const rClass = v => parseFloat(v||0)>0?'td-win':parseFloat(v||0)<0?'td-loss':'td-be';
const fmtD = d => { if(!d) return '—'; try{return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'})}catch{return d} };
const rowClass = t => t.outcome==='Win'?'row-win':t.outcome==='Loss'?'row-loss':'';
const cardClass = t => t.outcome==='Win'?'win-card':t.outcome==='Loss'?'loss-card':'';

// ─── Animated Number ────────────────────────────────────────────────────────
function AnimNum({ val, dec=1, prefix='', suffix='' }) {
  const [disp, setDisp] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = parseFloat(val) || 0;
    let start=null; const dur=800;
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
  Grid:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Book:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Plus:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Chart:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  Brain:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Cog:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Globe:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Trash:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>,
  Edit:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Up:      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18,15 12,9 6,15"/></svg>,
  Down:    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>,
  Chk:     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  Sun:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Download:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Filter:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>,
  Menu:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
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
          style={{transition:'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)'}}
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
        </defs>
        <line x1={pad} y1={zeroY} x2={W-pad} y2={zeroY} stroke="var(--line2)" strokeWidth="1" strokeDasharray="4,4"/>
        <path d={area} fill="url(#egr)"/>
        <path d={path} fill="none" stroke={col} strokeWidth="2"
          strokeDasharray={pathLen} strokeDashoffset={pathLen}
          style={{animation:'drawLine 1.5s 0.3s cubic-bezier(0.16,1,0.3,1) forwards',['--len']:pathLen}}
        />
        <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={col}/>
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
              <div className="ab-fill" style={{width:`${(Math.abs(s.r)/mx)*100}%`,background:s.r>=0?'var(--green)':'var(--red)'}}/>
            </div>
            <div className={`ab-r ${s.r>=0?'td-win':'td-loss'}`}>{rSign(s.r)}</div>
            <div className="ab-wr">{s.n>0?((s.w/s.n)*100).toFixed(0):0}% WR</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Strategy Field Input ─────────────────────────────────────────────────────
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
            <button key={opt} type="button" className={`ms-chip ${selected.includes(opt)?'on':''}`} onClick={()=>toggle(opt)}>{opt}</button>
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

// ─── Export to CSV ────────────────────────────────────────────────────────────
function exportCSV(trades, mode='all', fields=[]) {
  const rows = trades.filter(t=>mode==='all'||t.mode===mode);
  const stratHeaders = fields.map(f=>f.name);
  const headers = ['Date','Mode','Asset','Session','Outcome','Result (R)','Notes',...stratHeaders];
  const lines = [headers.join(',')];
  rows.forEach(t=>{
    const stratVals = fields.map(f=>{
      const v=t.strategyData?.[f.id];
      if(f.type==='checkbox') return v?'Yes':'No';
      if(Array.isArray(v)) return `"${v.join(', ')}"`;
      return `"${(v||'').toString().replace(/"/g,'""')}"`;
    });
    const row = [
      t.date||'',t.mode||'',
      `"${(t.asset||'').replace(/"/g,'""')}"`,
      t.session||'No Session',t.outcome||'',t.resultR||0,
      `"${(t.notes||'').replace(/"/g,'""')}"`,
      ...stratVals
    ];
    lines.push(row.join(','));
  });
  const blob = new Blob([lines.join('\n')],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=`pip-by-pip-${mode}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Smart Insights Engine ────────────────────────────────────────────────────
function buildSmartInsights(trades) {
  const closed = trades.filter(t=>t.outcome!=='No Trade');
  if(closed.length<3) return [{type:'info',title:'Keep logging trades',body:'Log at least 3 trades to unlock your personal smart summary.'}];
  const insights = [];
  const wins = closed.filter(t=>t.outcome==='Win');
  const losses = closed.filter(t=>t.outcome==='Loss');
  const wr = wins.length/closed.length;
  const netR = closed.reduce((s,t)=>s+parseFloat(t.resultR||0),0);
  if(wr>=0.6) insights.push({type:'strength',title:`Strong win rate at ${(wr*100).toFixed(0)}%`,body:'You are winning more than 6 out of 10 trades — that is consistency. Keep executing your rules.'});
  else if(wr<=0.4) insights.push({type:'weakness',title:`Win rate is ${(wr*100).toFixed(0)}% — focus on quality`,body:'Fewer than 4 in 10 trades close as wins. Consider waiting for higher-conviction setups only.'});
  else insights.push({type:'neutral',title:`Win rate at ${(wr*100).toFixed(0)}%`,body:'Solid middle-ground. Track whether you are holding winners long enough — average R matters more than win rate alone.'});
  const assetMap={};
  closed.forEach(t=>{
    if(!t.asset) return;
    if(!assetMap[t.asset]) assetMap[t.asset]={r:0,n:0,w:0};
    assetMap[t.asset].r+=parseFloat(t.resultR||0);
    assetMap[t.asset].n++;
    if(t.outcome==='Win') assetMap[t.asset].w++;
  });
  const byR=Object.entries(assetMap).sort((a,b)=>b[1].r-a[1].r);
  if(byR.length>0){
    const [bestAsset,best]=byR[0];
    const [worstAsset,worst]=byR[byR.length-1];
    insights.push({type:'strength',title:`${bestAsset} is your strongest pair`,body:`Net ${rSign(best.r)} across ${best.n} trades — ${best.n?((best.w/best.n)*100).toFixed(0):0}% WR. This is where your edge lives.`});
    if(byR.length>1&&worst.r<0) insights.push({type:'weakness',title:`${worstAsset} is costing you pips`,body:`Net ${rSign(worst.r)} on this pair. Consider limiting or pausing it until you understand the pattern.`});
  }
  const sessMap={};
  closed.forEach(t=>{
    const s=t.session||'No Session';
    if(!sessMap[s]) sessMap[s]={r:0,n:0,w:0};
    sessMap[s].r+=parseFloat(t.resultR||0);sessMap[s].n++;
    if(t.outcome==='Win') sessMap[s].w++;
  });
  const hasSessions=Object.keys(sessMap).some(k=>k!=='No Session'&&sessMap[k].n>0);
  if(hasSessions){
    const bySession=Object.entries(sessMap).filter(([k])=>k!=='No Session').sort((a,b)=>b[1].r-a[1].r);
    if(bySession.length>0){
      const [bestSess,bS]=bySession[0];
      insights.push({type:'strength',title:`${bestSess} session is your sweet spot`,body:`Your best results come from the ${bestSess} session with net ${rSign(bS.r)} across ${bS.n} trades. Prioritise this window.`});
      if(bySession.length>1){
        const [worstSess,wS]=bySession[bySession.length-1];
        if(wS.r<0) insights.push({type:'weakness',title:`${worstSess} session is draining your account`,body:`Net ${rSign(wS.r)} during this window. You may be overtrading or not respecting session-specific conditions.`});
      }
    }
  }
  const dayMap={};
  closed.forEach(t=>{
    if(!t.date) return;
    const d=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(t.date+'T12:00:00').getDay()];
    if(!dayMap[d]) dayMap[d]={r:0,n:0};
    dayMap[d].r+=parseFloat(t.resultR||0); dayMap[d].n++;
  });
  const weekdays=['Mon','Tue','Wed','Thu','Fri'].filter(d=>dayMap[d]);
  if(weekdays.length>2){
    const sorted=weekdays.sort((a,b)=>dayMap[b].r-dayMap[a].r);
    const best=sorted[0],worst=sorted[sorted.length-1];
    if(dayMap[worst].r<0&&worst!==best) insights.push({type:'neutral',title:`Worst day: ${worst}`,body:`You have lost ${rSign(dayMap[worst].r)} net on ${worst}s. Consider taking it off or being more selective that day.`});
  }
  if(netR>0) insights.push({type:'strength',title:'You are net profitable — keep the discipline',body:`Total net R is ${rSign(netR)} across ${closed.length} trades. Protect your capital and let the edge compound.`});
  else insights.push({type:'weakness',title:'Still in the red — stay patient',body:`Net R is ${rSign(netR)}. Focus on risk management first: make sure every loss is exactly 1R, never more.`});
  return insights;
}

// ─── Trade Detail Modal ──────────────────────────────────────────────────────
function TradeDetailModal({ trade, fields, onClose, onEdit, onDelete }) {
  if(!trade) return null;
  const rVal = parseFloat(trade.resultR||0);
  const outcomeColor = trade.outcome==='Win'?'var(--green)':trade.outcome==='Loss'?'var(--red)':'var(--accent)';

  return (
    <div className="trade-detail-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="trade-detail-modal">
        <div className="tdm-header">
          <div>
            <div className="tdm-title">{trade.asset||'Unknown Asset'}</div>
            <div className="tdm-sub">{fmtD(trade.date)} · {trade.mode} · {trade.session!=='No Session'?trade.session:'No session'}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{fontFamily:'var(--display)',fontSize:28,fontStyle:'italic',fontWeight:600,color:rVal>=0?'var(--green)':'var(--red)'}}>{rSign(trade.resultR)}</div>
            <button className="ib" onClick={onClose} style={{padding:8}}>{I.X}</button>
          </div>
        </div>
        <div className="tdm-body">
          {/* Core fields */}
          <div className="tdm-grid">
            {[
              {label:'Outcome',val:<span style={{color:outcomeColor,fontWeight:700}}>{trade.outcome}</span>},
              {label:'Result',val:<span style={{color:rVal>=0?'var(--green)':'var(--red)',fontWeight:700,fontFamily:'var(--mono)'}}>{rSign(trade.resultR)}</span>},
              {label:'Date',val:fmtD(trade.date)},
              {label:'Mode',val:<span className={`badge ${trade.mode==='Live'?'bl':'bb'}`}>{trade.mode}</span>},
              {label:'Asset',val:trade.asset||'—'},
              {label:'Session',val:trade.session&&trade.session!=='No Session'?<span className="sess-badge">{trade.session}</span>:'—'},
            ].map((f,i)=>(
              <div key={i} className="tdm-field">
                <div className="tdm-field-label">{f.label}</div>
                <div className="tdm-field-val">{f.val}</div>
              </div>
            ))}
          </div>

          {/* Strategy data */}
          {fields.length>0&&(
            <>
              <div className="sl" style={{marginBottom:12}}>Strategy Checklist</div>
              <div className="tdm-grid">
                {fields.map(f=>{
                  const v=trade.strategyData?.[f.id];
                  let display='—';
                  if(f.type==='checkbox') display=v?'✓ Yes':'✗ No';
                  else if(Array.isArray(v)) display=v.join(', ')||'—';
                  else display=v||'—';
                  return (
                    <div key={f.id} className="tdm-field">
                      <div className="tdm-field-label">{f.name}</div>
                      <div className="tdm-field-val" style={{color:f.type==='checkbox'?(v?'var(--green)':'var(--red)'):undefined}}>{display}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Notes */}
          {trade.notes&&(
            <div className="tdm-notes">
              <div className="tdm-notes-label">Post-Trade Notes</div>
              <div className="tdm-notes-val">{trade.notes}</div>
            </div>
          )}
        </div>
        <div className="tdm-footer">
          <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(trade)} style={{display:'flex',alignItems:'center',gap:6}}>
            {I.Edit} Edit Trade
          </button>
          <button className="btn btn-danger btn-sm" onClick={()=>onDelete(trade.id)} style={{display:'flex',alignItems:'center',gap:6}}>
            {I.Trash} Delete
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{marginLeft:'auto'}}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────
export default function App() {
  const [authUser,setAuthUser]=useState(undefined);
  const [profile,setProfile]=useState(null);
  const [trades,setTrades]=useState([]);
  const [view,setView]=useState('dashboard');
  const [theme,setTheme]=useState(()=>localStorage.getItem('pbp-theme')||'dark');
  const [menuOpen,setMenuOpen]=useState(false);
  const [editingTrade,setEditingTrade]=useState(null);

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme);
    localStorage.setItem('pbp-theme',theme);
  },[theme]);

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
    getDoc(userDoc(authUser.uid)).then(s=>{setProfile(s.exists()?s.data():null)});
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

  // FIX: edit trade support
  const updateTrade=async(id,t)=>{
    await setDoc(tradeDoc(id),{...t,userId:authUser.uid},{ merge:true });
    setEditingTrade(null);
    setView('journal');
  };

  const delTrade=async id=>deleteDoc(tradeDoc(id));
  const savePro=async p=>{await setDoc(userDoc(authUser.uid),p,{merge:true});setProfile(p)};
  const handleSignOut=async()=>{await signOut(auth);setProfile(null)};
  const navigate=(v)=>{setView(v);setMenuOpen(false)};

  if(authUser===undefined) return (
    <><style>{S}</style><div className="loader-sh"><div className="loader-ring"/><div className="loader-txt">Loading</div></div></>
  );
  if(!authUser||!profile) return (
    <><style>{S}</style><AuthFlow onComplete={p=>setProfile(p)}/></>
  );

  // If editing a trade, show edit page
  if(editingTrade) return (
    <>
      <style>{S}</style>
      <div className="shell">
        <nav className="sidebar">
          <div className="sb-top">
            <div className="sb-brand"><div className="sb-logo">Pip <span>by</span> Pip</div><div className="sb-ver">Trade Journal</div></div>
          </div>
        </nav>
        <main className="main">
          <EditTradePage
            profile={profile}
            trade={editingTrade}
            onSave={(id,t)=>updateTrade(id,t)}
            onCancel={()=>setEditingTrade(null)}
          />
        </main>
      </div>
    </>
  );

  const fields=profile.strategy?.fields||[];
  const NAV=[
    {id:'dashboard',label:'Overview',icon:I.Grid},
    {id:'journal',label:'Journal',icon:I.Book},
    {id:'add',label:'Log Trade',icon:I.Plus},
    {id:'insights',label:'Insights',icon:I.Brain},
    {id:'settings',label:'Strategy',icon:I.Cog},
  ];

  return (
    <>
      <style>{S}</style>
      <div className="mobile-topbar">
        <div className="mobile-logo">Pip <span>by</span> Pip</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="theme-btn" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} style={{padding:'6px 10px',border:'1px solid var(--line2)',borderRadius:8,background:'var(--bg2)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,color:'var(--text2)',fontSize:10,fontFamily:'var(--mono)',letterSpacing:1,textTransform:'uppercase'}}>
            {theme==='dark'?I.Sun:I.Moon}
          </button>
          <button className="mobile-menu-btn" onClick={()=>setMenuOpen(o=>!o)}>
            {menuOpen?I.X:I.Menu}
          </button>
        </div>
      </div>
      <div className={`mobile-overlay ${menuOpen?'open':''}`} onClick={()=>setMenuOpen(false)}/>
      <div className="shell">
        <nav className={`sidebar ${menuOpen?'open':''}`}>
          <div className="sb-top">
            <div className="sb-brand">
              <div className="sb-logo">Pip <span>by</span> Pip</div>
              <div className="sb-ver">Trade Journal</div>
            </div>
            <div className="sb-sync"><span className="sync-dot"/>Live</div>
          </div>
          <div className="nav">
            {NAV.map(n=>(
              <button key={n.id} className={`nb ${view===n.id?'on':''}`} onClick={()=>navigate(n.id)}>
                {n.icon}<span>{n.label}</span>
              </button>
            ))}
          </div>
          <div className="sb-bottom">
            <div className="user-tile" onClick={()=>navigate('settings')}>
              <div className="avatar">{(profile.username||'?')[0].toUpperCase()}</div>
              <div><div className="u-name">{profile.username}</div><div className="u-sub">{profile.strategy?.name||'No strategy'}</div></div>
            </div>
            <div className="sb-actions">
              <button className="theme-btn" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>
                {theme==='dark'?<>{I.Sun} Light</>:<>{I.Moon} Dark</>}
              </button>
              <button className="so-btn" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        </nav>
        <main className="main">
          {view==='dashboard' &&<DashboardPage  key="dash" trades={trades} profile={profile}/>}
          {view==='journal'   &&<JournalPage    key="jrnl" trades={trades} fields={fields} onDelete={delTrade} onEdit={t=>{setEditingTrade(t);}}/>}
          {view==='add'       &&<AddTradePage   key="add"  profile={profile} onAdd={addTrade}/>}
          {view==='insights'  &&<InsightsPage   key="ins"  trades={trades} fields={fields}/>}
          {view==='settings'  &&<SettingsPage   key="set"  profile={profile} onSave={savePro}/>}
        </main>
      </div>
      <div className="mobile-nav-bottom">
        {NAV.map(n=>(
          <button key={n.id} className={`mnb ${view===n.id?'on':''}`} onClick={()=>navigate(n.id)}>
            {n.icon}<span>{n.label}</span>
          </button>
        ))}
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
  const typeLabel={dropdown:'Dropdown',text:'Free Text',checkbox:'Tick',multiselect:'Multi-Select'};

  const doLogin=async e=>{
    e.preventDefault();setErr('');setLoading(true);
    try{
      const u=await signInWithEmailAndPassword(auth,toEmail(form.username),form.password);
      const snap=await getDoc(userDoc(u.user.uid));
      if(snap.exists()) onComplete(snap.data());
      else setErr('Account not found.');
    }catch(e){setErr('Invalid username or password.')} finally{setLoading(false)};
  };
  const doRegister=async e=>{
    e.preventDefault();setErr('');
    if(form.password!==form.confirm){setErr('Passwords do not match.');return}
    if(form.password.length<6){setErr('Password must be at least 6 characters.');return}
    setLoading(true);
    try{
      const u=await createUserWithEmailAndPassword(auth,toEmail(form.username),form.password);
      setNewUser(u.user);setStep('build');
    }catch(e){
      if(e.code==='auth/email-already-in-use') setErr('Username taken. Try another.');
      else setErr('Could not create account. Try again.');
    } finally{setLoading(false)};
  };
  const addField=()=>{
    if(!nf.name.trim()) return;
    if((nf.type==='dropdown'||nf.type==='multiselect')&&!nf.options.length) return;
    setFields(f=>[...f,{id:genId(),name:nf.name,type:nf.type,options:nf.options}]);
    setNf({name:'',type:'dropdown',options:[],optIn:''});setAdding(false);
  };
  const rmField=id=>setFields(f=>f.filter(x=>x.id!==id));
  const mvField=(i,d)=>setFields(f=>{const a=[...f];const t=i+d;if(t<0||t>=a.length)return a;[a[i],a[t]]=[a[t],a[i]];return a});
  const doFinish=async()=>{
    setLoading(true);
    const p={username:form.username,strategy:{name:stratName,fields},createdAt:Date.now()};
    await setDoc(userDoc(newUser.uid),p);
    onComplete(p);setLoading(false);
  };

  if(step!=='build') return (
    <div className="auth-shell">
      <div className="auth-bg"/>
      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="brand-title">Your Trading Journal</div>
          <div className="brand-mark">Pip by Pip</div>
          <div className="brand-sub">Data-driven trading growth</div>
        </div>
        <div className="auth-card">
          <div className="auth-card-body">
            <div className="auth-eyebrow">{step==='register'?'Create Account':'Sign In'}</div>
            <div className="auth-heading">{step==='register'?'Start your journal':'Welcome back, trader'}</div>
            <div className="auth-desc">
              {step==='register'?'Pick a username and password. No email needed — your username is your identity.':'Enter your username and password to access your journal.'}
            </div>
            {err&&<div className="auth-err">{err}</div>}
            <form onSubmit={step==='register'?doRegister:doLogin}>
              <div className="f"><label>Username</label>
                <input type="text" required value={form.username} autoComplete="username" onChange={e=>setForm({...form,username:e.target.value})} placeholder="e.g. sadik_trader"/>
              </div>
              <div className="f"><label>Password</label>
                <input type="password" required value={form.password} autoComplete={step==='register'?'new-password':'current-password'} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/>
              </div>
              {step==='register'&&<div className="f"><label>Confirm Password</label>
                <input type="password" required value={form.confirm} autoComplete="new-password" onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="••••••••"/>
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
        <div style={{marginBottom:32}}><div className="brand-mark" style={{fontSize:32}}>Pip by Pip</div></div>
        <div className="prog-bar"><div className="prog-fill" style={{width:'66%'}}/></div>
        <div className="b-step">Step 2 of 2 — Your Strategy</div>
        <div className="b-title">Build your<br/>trading checklist</div>
        <div className="b-desc">Define each step in your trading process. These become the fields you fill in every time you log a trade.</div>
        {err&&<div className="auth-err">{err}</div>}
        <div className="strat-name-area">
          <div className="strat-name-label">What do you call your strategy?</div>
          <input className="strat-name-input" value={stratName} onChange={e=>setStratName(e.target.value)} placeholder="e.g. Market Structure, ICT, My System…"/>
        </div>
        {!!fields.length&&(
          <div className="fl-list">
            {fields.map((f,i)=>(
              <div key={f.id} className="fl-row">
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
            <div className="add-panel-title">New Strategy Step</div>
            <div className="f"><label>Name / Question</label>
              <input type="text" value={nf.name} autoFocus onChange={e=>setNf({...nf,name:e.target.value})} placeholder="e.g. HTF Bias? / Clear BOS? / Liquidity Target…"/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:8,letterSpacing:3,textTransform:'uppercase',color:'var(--text2)',marginBottom:8,fontFamily:'var(--mono)',fontWeight:600}}>Answer Type</div>
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
                    <input type="text" value={nf.optIn} placeholder="Add option…" onChange={e=>setNf({...nf,optIn:e.target.value})}
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
              <button className="btn btn-primary" onClick={addField}>Save Step</button>
              <button className="btn btn-ghost" onClick={()=>{setAdding(false);setNf({name:'',type:'dropdown',options:[],optIn:''})}}>Cancel</button>
            </div>
          </div>
        ):(
          <button className="add-trig" onClick={()=>setAdding(true)}>{I.Plus} Add a strategy step</button>
        )}
        <button className="commit-btn" onClick={doFinish} disabled={loading}>
          {loading?'Saving…':"I'm done — Open my journal →"}
        </button>
        <p style={{fontSize:9,color:'var(--text3)',textAlign:'center',marginTop:12,letterSpacing:1,fontFamily:'var(--mono)'}}>You can always edit steps later in Strategy settings.</p>
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
            <div className="ph-sub">{profile.strategy?.name||'No strategy set'} · {stats.total} trades logged</div>
          </div>
          <div className="ftabs">
            {[['all','All'],['Live','Live'],['Backtest','Backtest']].map(([v,l])=>(
              <button key={v} className={`ftab ${scope===v?'on':''}`} onClick={()=>setScope(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:24,flexWrap:'wrap'}}>
        <div className="page-enter s0"><WinRateRing pct={stats.wr} size={90}/></div>
        <div className="stat-grid" style={{flex:1,minWidth:0}}>
          {[
            {label:'Net R',val:<AnimNum val={stats.r} dec={2} prefix={stats.r>=0?'+':''} suffix="R"/>,cls:stats.r>0?'pos':stats.r<0?'neg':'wht',stripe:'',sub:'Risk-multiple'},
            {label:'Avg R/Trade',val:<AnimNum val={stats.avg} dec={2} prefix={stats.avg>=0?'+':''} suffix="R"/>,cls:stats.avg>0?'pos':stats.avg<0?'neg':'wht',stripe:'green',sub:'Expectancy'},
            {label:'Total Trades',val:<AnimNum val={stats.valid} dec={0}/>,cls:'acc',stripe:'',sub:`${stats.total-stats.valid} skipped`},
            {label:'Win Streak',val:<AnimNum val={stats.streak} dec={0}/>,cls:'blu',stripe:'blue',sub:'Current run'},
          ].map((x,i)=>(
            <div key={i} className={`sc page-enter s${i+1}`}>
              <div className={`sc-stripe ${x.stripe}`}/>
              <div className="sc-label">{x.label}</div>
              <div className={`sc-val ${x.cls}`}>{x.val}</div>
              <div className="sc-sub">{x.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <EquityCurve trades={filtered}/>
      <AssetBars trades={filtered}/>
      <div className="sl">Recent Entries</div>
      <div className="tbl-wrap page-enter s3">
        {!recent.length?<div className="empty-st">No trades yet. Start logging.</div>:(
          <>
            <div className="tbl-scroll">
              <table>
                <thead><tr>
                  <th>Date</th><th>Mode</th><th>Asset</th><th>Session</th>
                  {fields.slice(0,2).map(f=><th key={f.id}>{f.name}</th>)}
                  <th>Outcome</th><th>R</th>
                </tr></thead>
                <tbody>
                  {recent.map(t=>(
                    <tr key={t.id} className={rowClass(t)}>
                      <td className="td-date">{fmtD(t.date)}</td>
                      <td><span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span></td>
                      <td style={{color:'var(--text)',fontWeight:600}}>{t.asset||'—'}</td>
                      <td>{t.session&&t.session!=='No Session'?<span className="sess-badge">{t.session}</span>:<span style={{color:'var(--text3)',fontSize:10}}>—</span>}</td>
                      {fields.slice(0,2).map(f=>{
                        const v=t.strategyData?.[f.id];
                        const d=f.type==='checkbox'?(v?'✓':'—'):Array.isArray(v)?v.join(', '):(v||'—');
                        return <td key={f.id} style={{color:'var(--text2)',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis'}}>{d}</td>;
                      })}
                      <td className={t.outcome==='Win'?'td-win':t.outcome==='Loss'?'td-loss':'td-be'}>{t.outcome}</td>
                      <td className={rClass(t.resultR)} style={{fontFamily:'var(--mono)',fontWeight:600}}>{rSign(t.resultR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="trade-cards" style={{padding:'12px'}}>
              {recent.map(t=>(
                <div className={`trade-card ${cardClass(t)}`} key={t.id}>
                  <div className="tc-row">
                    <div className="tc-main">
                      <div className="tc-asset">{t.asset||'—'}</div>
                      <div className="tc-date">{fmtD(t.date)}</div>
                    </div>
                    <div className={`tc-r ${rClass(t.resultR)}`}>{rSign(t.resultR)}</div>
                  </div>
                  <div className="tc-meta">
                    <span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span>
                    {t.session&&t.session!=='No Session'&&<span className="sess-badge">{t.session}</span>}
                    <span className={`badge ${t.outcome==='Win'?'bl':t.outcome==='Loss'?'':'bb'}`} style={t.outcome==='Loss'?{background:'var(--red-g)',color:'var(--red)'}:{}}>{t.outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Journal ─────────────────────────────────────────────────────────────────
function JournalPage({trades,fields,onDelete,onEdit}) {
  const [scope,setScope]=useState('all');
  const [sortBy,setSortBy]=useState('date');
  const [sortDir,setSortDir]=useState('desc');
  const [selectedTrade,setSelectedTrade]=useState(null);
  const [conf,setConf]=useState(null);

  const sorted=useMemo(()=>{
    let arr=trades.filter(t=>scope==='all'||t.mode===scope);
    arr=[...arr].sort((a,b)=>{
      let va,vb;
      if(sortBy==='date'){va=new Date(a.date||0);vb=new Date(b.date||0)}
      else if(sortBy==='r'){va=parseFloat(a.resultR||0);vb=parseFloat(b.resultR||0)}
      else if(sortBy==='asset'){va=a.asset||'';vb=b.asset||''}
      else if(sortBy==='outcome'){va=a.outcome||'';vb=b.outcome||''}
      if(va<vb) return sortDir==='asc'?-1:1;
      if(va>vb) return sortDir==='asc'?1:-1;
      return 0;
    });
    return arr;
  },[trades,scope,sortBy,sortDir]);

  const toggleSort=col=>{
    if(sortBy===col) setSortDir(d=>d==='asc'?'desc':'asc');
    else{setSortBy(col);setSortDir('desc');}
  };
  const sortArrow=col=>sortBy===col?(sortDir==='asc'?'↑':'↓'):'';

  const handleDelete=async id=>{
    await onDelete(id);
    setSelectedTrade(null);
    setConf(null);
  };

  return (
    <div className="page page-enter">
      {selectedTrade&&(
        <TradeDetailModal
          trade={selectedTrade}
          fields={fields}
          onClose={()=>setSelectedTrade(null)}
          onEdit={t=>{onEdit(t);setSelectedTrade(null)}}
          onDelete={handleDelete}
        />
      )}
      <div className="ph">
        <div className="ph-ey">Journal</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">All Trades</div><div className="ph-sub">{sorted.length} entries</div></div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <div className="ftabs">
              {[['all','All'],['Live','Live'],['Backtest','Backtest']].map(([v,l])=>(
                <button key={v} className={`ftab ${scope===v?'on':''}`} onClick={()=>setScope(v)}>{l}</button>
              ))}
            </div>
            <button className="export-btn" onClick={()=>exportCSV(sorted,'all',fields)}>
              {I.Download} Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="sort-row">
        <span className="sort-label">Sort:</span>
        {[['date','Date'],['r','R Result'],['asset','Asset'],['outcome','Outcome']].map(([col,lbl])=>(
          <button key={col} className={`sort-btn ${sortBy===col?'on':''}`} onClick={()=>toggleSort(col)}>
            {lbl}<span className="sort-dir">{sortArrow(col)}</span>
          </button>
        ))}
      </div>

      <div className="tbl-wrap">
        {!sorted.length?<div className="empty-st">No trades to show.</div>:(
          <>
            {/* Desktop table */}
            <div className="tbl-scroll">
              <table>
                <thead><tr>
                  <th style={{width:44,textAlign:'center'}}>#</th>
                  <th>Date</th><th>Mode</th><th>Asset</th><th>Session</th>
                  <th>Outcome</th><th>R</th><th>Notes</th><th></th>
                </tr></thead>
                <tbody>
                  {sorted.map((t,idx)=>(
                    <tr key={t.id} className={rowClass(t)} onClick={()=>setSelectedTrade(t)} style={{cursor:'pointer'}}>
                      <td style={{textAlign:'center',fontFamily:'var(--mono)',fontSize:11,color:'var(--text3)',fontWeight:600}}>{idx+1}</td>
                      <td className="td-date">{fmtD(t.date)}</td>
                      <td><span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span></td>
                      <td style={{color:'var(--text)',fontWeight:600}}>{t.asset||'—'}</td>
                      <td>{t.session&&t.session!=='No Session'?<span className="sess-badge">{t.session}</span>:<span style={{color:'var(--text3)',fontSize:10}}>—</span>}</td>
                      <td className={t.outcome==='Win'?'td-win':t.outcome==='Loss'?'td-loss':'td-be'}>{t.outcome}</td>
                      <td className={rClass(t.resultR)} style={{fontFamily:'var(--mono)',fontWeight:600}}>{rSign(t.resultR)}</td>
                      <td className="td-note">{t.notes||'—'}</td>
                      <td onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          <button className="ib edit-btn" title="Edit" onClick={e=>{e.stopPropagation();onEdit(t)}} style={{padding:6}}>{I.Edit}</button>
                          {conf===t.id?(
                            <span style={{display:'flex',gap:4}}>
                              <button className="btn btn-danger btn-sm" onClick={e=>{e.stopPropagation();handleDelete(t.id)}}>Delete</button>
                              <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setConf(null)}}>No</button>
                            </span>
                          ):(
                            <button className="ib del" onClick={e=>{e.stopPropagation();setConf(t.id)}} style={{padding:6}}>{I.Trash}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — clickable, expand to detail */}
            <div className="trade-cards" style={{padding:'12px'}}>
              {sorted.map((t,idx)=>(
                <div className={`trade-card ${cardClass(t)}`} key={t.id} onClick={()=>setSelectedTrade(t)}>
                  <div className="tc-row">
                    <div className="tc-main">
                      <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--text3)',fontWeight:700,marginRight:4}}>#{idx+1}</span>
                      <div className="tc-asset">{t.asset||'—'}</div>
                      <div className="tc-date">{fmtD(t.date)}</div>
                    </div>
                    <div className={`tc-r ${rClass(t.resultR)}`}>{rSign(t.resultR)}</div>
                  </div>
                  <div className="tc-meta">
                    <span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span>
                    {t.session&&t.session!=='No Session'&&<span className="sess-badge">{t.session}</span>}
                    <span className={`badge ${t.outcome==='Win'?'bl':t.outcome==='Loss'?'':'bb'}`} style={t.outcome==='Loss'?{background:'var(--red-g)',color:'var(--red)'}:{}}>{t.outcome}</span>
                  </div>
                  {t.notes&&<div className="tc-note">{t.notes}</div>}
                  <div className="tc-expand-hint">Tap to view full details →</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Edit Trade Page ─────────────────────────────────────────────────────────
function EditTradePage({profile, trade, onSave, onCancel}) {
  const fields=profile.strategy?.fields||[];
  const [mode,setMode]=useState(trade.mode||'Live');
  const [session,setSession]=useState(trade.session||'No Session');
  const [base,setBase]=useState({
    date:trade.date||new Date().toISOString().split('T')[0],
    asset:trade.asset||'',
    resultR:Math.abs(parseFloat(trade.resultR||0)).toString(),
    outcome:trade.outcome||'Win',
    notes:trade.notes||''
  });
  const [sdata,setSdata]=useState(trade.strategyData||{});
  const [saving,setSaving]=useState(false);

  const submit=async e=>{
    e.preventDefault();setSaving(true);
    // Auto-negate R for losses
    let resultR = parseFloat(base.resultR||0);
    if(base.outcome==='Loss') resultR = -Math.abs(resultR);
    else if(base.outcome==='Win') resultR = Math.abs(resultR);
    await onSave(trade.id,{...trade,...base,resultR,strategyData:sdata,mode,session,strategyName:profile.strategy?.name});
    setSaving(false);
  };

  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Edit Trade</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">Editing Entry</div><div className="ph-sub">{trade.asset} · {fmtD(trade.date)}</div></div>
          <div className="mtoggle">
            {['Live','Backtest'].map(m=>(
              <button key={m} className={`mpill ${mode===m?(m==='Live'?'ml':'mb'):''}`} onClick={()=>setMode(m)}>{m}</button>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={submit} style={{maxWidth:820}}>
        <div className="fp page-enter s0">
          <div className="fp-title">Core Data</div>
          <div className="fg4">
            <div className="f" style={{margin:0}}><label>Date</label><input type="date" value={base.date} onChange={e=>setBase({...base,date:e.target.value})} required/></div>
            <div className="f" style={{margin:0}}><label>Asset</label>
              <select value={base.asset} onChange={e=>setBase({...base,asset:e.target.value})} required>
                <option value="">— select —</option>
                {ASSETS.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="f" style={{margin:0}}><label>Session</label>
              <select value={session} onChange={e=>setSession(e.target.value)}>
                {SESSIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="f" style={{margin:0}}><label>Outcome</label>
              <select value={base.outcome} onChange={e=>setBase({...base,outcome:e.target.value})}>
                {['Win','Loss','Breakeven','No Trade'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:16,maxWidth:200}}>
            <div className="f" style={{margin:0}}>
              <label>Result (R) — enter positive value</label>
              <input type="number" step="0.01" min="0" value={base.resultR} onChange={e=>setBase({...base,resultR:e.target.value})} placeholder="e.g. 1 or 2.5" required/>
            </div>
          </div>
          <div style={{marginTop:8,fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>
            Loss values are automatically stored as negative.
          </div>
        </div>
        {!!fields.length&&(
          <div className="fp page-enter s1">
            <div className="fp-title">Strategy Checklist — {profile.strategy?.name}</div>
            {fields.map((f,i)=>(
              <div key={f.id} className="strat-step">
                <div className="step-lbl"><div className="step-num">{i+1}</div>{f.type!=='checkbox'&&f.name}</div>
                <SFI field={f} value={sdata[f.id]} onChange={v=>setSdata({...sdata,[f.id]:v})}/>
              </div>
            ))}
          </div>
        )}
        <div className="fp page-enter s2">
          <div className="fp-title">Post-Trade Notes</div>
          <div className="f" style={{margin:0}}>
            <textarea value={base.notes} onChange={e=>setBase({...base,notes:e.target.value})} placeholder="What went well? What would you change?"/>
          </div>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button type="submit" className="commit-btn" disabled={saving} style={{flex:1}}>
            {saving?'Saving…':'Save Changes →'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel} style={{padding:'16px 24px',fontSize:13}}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Add Trade ───────────────────────────────────────────────────────────────
function AddTradePage({profile,onAdd}) {
  const fields=profile.strategy?.fields||[];
  const [mode,setMode]=useState('Live');
  const [session,setSession]=useState('No Session');
  const [base,setBase]=useState({date:new Date().toISOString().split('T')[0],asset:'',resultR:'',outcome:'Win',notes:''});
  const [sdata,setSdata]=useState({});
  const [saving,setSaving]=useState(false);

  const submit=async e=>{
    e.preventDefault();setSaving(true);
    // FIX: auto-negate R for losses, positive for wins
    let resultR = parseFloat(base.resultR||0);
    if(base.outcome==='Loss') resultR = -Math.abs(resultR);
    else if(base.outcome==='Win') resultR = Math.abs(resultR);
    await onAdd({...base,resultR,strategyData:sdata,mode,session,strategyName:profile.strategy?.name});
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
        <div className="fp page-enter s0">
          <div className="fp-title">Core Data</div>
          <div className="fg4">
            <div className="f" style={{margin:0}}><label>Date</label><input type="date" value={base.date} onChange={e=>setBase({...base,date:e.target.value})} required/></div>
            <div className="f" style={{margin:0}}><label>Asset</label>
              <select value={base.asset} onChange={e=>setBase({...base,asset:e.target.value})} required>
                <option value="">— select —</option>
                {ASSETS.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="f" style={{margin:0}}><label>Session</label>
              <select value={session} onChange={e=>setSession(e.target.value)}>
                {SESSIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="f" style={{margin:0}}><label>Outcome</label>
              <select value={base.outcome} onChange={e=>setBase({...base,outcome:e.target.value})}>
                {['Win','Loss','Breakeven','No Trade'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:16,maxWidth:200}}>
            <div className="f" style={{margin:0}}>
              <label>Result (R) — enter positive value</label>
              <input type="number" step="0.01" min="0" value={base.resultR} onChange={e=>setBase({...base,resultR:e.target.value})} placeholder="e.g. 1 or 2.5" required/>
            </div>
          </div>
          <div style={{marginTop:8,fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>
            Loss values are automatically stored as negative.
          </div>
        </div>
        {!!fields.length&&(
          <div className="fp page-enter s1">
            <div className="fp-title">Strategy Checklist — {profile.strategy?.name}</div>
            {fields.map((f,i)=>(
              <div key={f.id} className="strat-step">
                <div className="step-lbl"><div className="step-num">{i+1}</div>{f.type!=='checkbox'&&f.name}</div>
                <SFI field={f} value={sdata[f.id]} onChange={v=>setSdata({...sdata,[f.id]:v})}/>
              </div>
            ))}
          </div>
        )}
        <div className="fp page-enter s2">
          <div className="fp-title">Post-Trade Notes</div>
          <div className="f" style={{margin:0}}>
            <textarea value={base.notes} onChange={e=>setBase({...base,notes:e.target.value})} placeholder="What went well? What would you change? Any market observations…"/>
          </div>
        </div>
        <button type="submit" className="commit-btn" disabled={saving}>
          {saving?'Committing…':'Commit to Journal →'}
        </button>
      </form>
    </div>
  );
}

// ─── Insights ────────────────────────────────────────────────────────────────
function InsightsPage({trades, fields}) {
  const [scope,setScope]=useState('all');
  const [filters,setFilters]=useState({asset:'',session:'',outcome:'',dateFrom:'',dateTo:''});
  const [showFilters,setShowFilters]=useState(false);

  const scoped = scope==='all'?trades:trades.filter(t=>t.mode===scope);
  const filtered = useMemo(()=>{
    let r=scoped;
    if(filters.asset) r=r.filter(t=>t.asset===filters.asset);
    if(filters.session) r=r.filter(t=>(t.session||'No Session')===filters.session);
    if(filters.outcome) r=r.filter(t=>t.outcome===filters.outcome);
    if(filters.dateFrom) r=r.filter(t=>t.date>=filters.dateFrom);
    if(filters.dateTo) r=r.filter(t=>t.date<=filters.dateTo);
    return r;
  },[scoped,filters]);

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
    const sessions={};
    v.forEach(t=>{
      const s=t.session||'No Session';
      if(!sessions[s]) sessions[s]={r:0,n:0,w:0};
      sessions[s].r+=parseFloat(t.resultR||0); sessions[s].n++;
      if(t.outcome==='Win') sessions[s].w++;
    });
    return {aw,al,pf,dd,days,sessions};
  },[filtered]);

  const smartInsights=useMemo(()=>buildSmartInsights(filtered),[filtered]);
  const dayMx=Math.max(...Object.values(stats.days).map(d=>Math.abs(d.r)),0.01);
  const allAssets=[...new Set(trades.map(t=>t.asset).filter(Boolean))];
  const hasActiveFilter=Object.values(filters).some(v=>v);
  const iconColor = {strength:'var(--green)',weakness:'var(--red)',neutral:'var(--accent)',info:'var(--blue)'};

  return (
    <div className="page page-enter">
      <div className="ph">
        <div className="ph-ey">Deep Insights</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div><div className="ph-title">Numbers<br/><em>Don't Lie</em></div></div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            <div className="ftabs">
              {[['all','All'],['Live','Live'],['Backtest','Backtest']].map(([v,l])=>(
                <button key={v} className={`ftab ${scope===v?'on':''}`} onClick={()=>setScope(v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="export-area">
        <button className="export-btn" onClick={()=>exportCSV(trades,'all',fields)}>{I.Download} All Trades</button>
        <button className="export-btn" onClick={()=>exportCSV(trades,'Live',fields)}>{I.Download} Live Only</button>
        <button className="export-btn" onClick={()=>exportCSV(trades,'Backtest',fields)}>{I.Download} Backtest Only</button>
        <button className="export-btn" onClick={()=>setShowFilters(f=>!f)} style={hasActiveFilter?{borderColor:'rgba(232,160,69,0.5)',color:'var(--accent)'}:{}}>{I.Filter} {showFilters?'Hide Filters':'Filter & Analyse'}{hasActiveFilter&&' •'}</button>
      </div>
      {showFilters&&(
        <div className="filter-bar page-enter">
          <div className="filter-title">Filter Trades</div>
          <div className="filter-grid">
            <div className="flt-group"><label>Asset / Pair</label>
              <select value={filters.asset} onChange={e=>setFilters({...filters,asset:e.target.value})}>
                <option value="">All pairs</option>
                {allAssets.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flt-group"><label>Session</label>
              <select value={filters.session} onChange={e=>setFilters({...filters,session:e.target.value})}>
                <option value="">All sessions</option>
                {SESSIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flt-group"><label>Outcome</label>
              <select value={filters.outcome} onChange={e=>setFilters({...filters,outcome:e.target.value})}>
                <option value="">All outcomes</option>
                {['Win','Loss','Breakeven','No Trade'].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flt-group"><label>Date From</label>
              <input type="date" value={filters.dateFrom} onChange={e=>setFilters({...filters,dateFrom:e.target.value})}/>
            </div>
            <div className="flt-group"><label>Date To</label>
              <input type="date" value={filters.dateTo} onChange={e=>setFilters({...filters,dateTo:e.target.value})}/>
            </div>
          </div>
          <div className="filter-actions">
            <span className="flt-count">{filtered.length} trade{filtered.length!==1?'s':''} match</span>
            {hasActiveFilter&&<button className="btn btn-ghost btn-sm" onClick={()=>setFilters({asset:'',session:'',outcome:'',dateFrom:'',dateTo:''})}>Clear filters</button>}
          </div>
        </div>
      )}
      <div className="ins-grid">
        {[
          {label:'Avg Winner',val:<AnimNum val={stats.aw} dec={2} prefix="+R "/>,color:'var(--green)',sub:'Per winning trade'},
          {label:'Avg Loser', val:<AnimNum val={stats.al} dec={2} prefix="-R "/>,color:'var(--red)',sub:'Per losing trade'},
          {label:'Profit Factor',val:<AnimNum val={stats.pf} dec={2}/>,color:stats.pf>=1.5?'var(--green)':stats.pf>=1?'var(--accent)':'var(--red)',sub:'>1.5 is strong'},
          {label:'Max Drawdown',val:<AnimNum val={stats.dd} dec={2} prefix="-R "/>,color:'var(--red)',sub:'Peak to trough'},
        ].map((x,i)=>(
          <div key={i} className="ins-box page-enter" style={{animationDelay:`${i*0.06}s`}}>
            <div className="ins-label">{x.label}</div>
            <div className="ins-val" style={{color:x.color}}>{x.val}</div>
            <div className="ins-sub">{x.sub}</div>
          </div>
        ))}
      </div>
      <div className="ai-panel page-enter s1">
        <div className="ai-header">
          <div className="ai-icon">🧠</div>
          <div>
            <div className="ai-title">Your Smart Performance Summary</div>
            <div className="ai-sub">Powered by your own trade data · {filtered.filter(t=>t.outcome!=='No Trade').length} trades analysed</div>
          </div>
        </div>
        <div className="ai-insights">
          {smartInsights.map((item,i)=>(
            <div key={i} className="ai-item">
              <div className="ai-dot" style={{background:iconColor[item.type]||'var(--accent)'}}/>
              <div>
                <div className="ai-item-title">{item.title}</div>
                <div className="ai-item-body">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <EquityCurve trades={filtered}/>
      <AssetBars trades={filtered}/>
      {Object.keys(stats.sessions).some(k=>k!=='No Session'&&stats.sessions[k].n>0)&&(
        <>
          <div className="sl">Performance by Session</div>
          <div className="ab-list">
            {Object.entries(stats.sessions).filter(([k])=>k!=='No Session').sort((a,b)=>b[1].r-a[1].r).map(([sess,s])=>{
              const mx=Math.max(...Object.values(stats.sessions).map(x=>Math.abs(x.r)),0.01);
              return (
                <div key={sess} className="ab-row">
                  <div className="ab-name">{sess}</div>
                  <div className="ab-track"><div className="ab-fill" style={{width:`${(Math.abs(s.r)/mx)*100}%`,background:s.r>=0?'var(--green)':'var(--red)'}}/></div>
                  <div className={`ab-r ${s.r>=0?'td-win':'td-loss'}`}>{rSign(s.r)}</div>
                  <div className="ab-wr">{s.n>0?((s.w/s.n)*100).toFixed(0):0}% WR</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!!Object.keys(stats.days).length&&(
        <>
          <div className="sl">Performance by Day of Week</div>
          <div className="ab-list">
            {['Mon','Tue','Wed','Thu','Fri'].filter(d=>stats.days[d]).map(d=>{
              const s=stats.days[d];
              return (
                <div key={d} className="ab-row">
                  <div className="ab-name">{d}</div>
                  <div className="ab-track"><div className="ab-fill" style={{width:`${(Math.abs(s.r)/dayMx)*100}%`,background:s.r>=0?'var(--green)':'var(--red)'}}/></div>
                  <div className={`ab-r ${s.r>=0?'td-win':'td-loss'}`}>{rSign(s.r)}</div>
                  <div className="ab-wr">{s.n} trade{s.n!==1?'s':''}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {showFilters&&(
        <>
          <div className="sl">Filtered Trades</div>
          <div className="tbl-wrap">
            {!filtered.length?<div className="empty-st">No trades match your filters.</div>:(
              <div className="tbl-scroll">
                <table>
                  <thead><tr>
                    <th>Date</th><th>Mode</th><th>Asset</th><th>Session</th><th>Outcome</th><th>R</th><th>Notes</th>
                  </tr></thead>
                  <tbody>
                    {[...filtered].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=>(
                      <tr key={t.id} className={rowClass(t)}>
                        <td className="td-date">{fmtD(t.date)}</td>
                        <td><span className={`badge ${t.mode==='Live'?'bl':'bb'}`}>{t.mode}</span></td>
                        <td style={{color:'var(--text)',fontWeight:600}}>{t.asset||'—'}</td>
                        <td>{t.session&&t.session!=='No Session'?<span className="sess-badge">{t.session}</span>:<span style={{color:'var(--text3)',fontSize:10}}>—</span>}</td>
                        <td className={t.outcome==='Win'?'td-win':t.outcome==='Loss'?'td-loss':'td-be'}>{t.outcome}</td>
                        <td className={rClass(t.resultR)} style={{fontFamily:'var(--mono)',fontWeight:600}}>{rSign(t.resultR)}</td>
                        <td className="td-note">{t.notes||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
  // FIX: editing existing strategy step
  const [editingField,setEditingField]=useState(null);
  const [nf,setNf]=useState({name:'',type:'dropdown',options:[],optIn:''});
  const [saved,setSaved]=useState(false);
  const typeLabel={dropdown:'Dropdown',text:'Free Text',checkbox:'Tick',multiselect:'Multi-Select'};

  const save=async s=>{setStrat(s);await onSave({...profile,strategy:s});setSaved(true);setTimeout(()=>setSaved(false),2000)};
  const addF=()=>{
    if(!nf.name.trim()) return;
    if((nf.type==='dropdown'||nf.type==='multiselect')&&!nf.options.length) return;
    if(editingField){
      // Update existing field
      save({...strat,fields:strat.fields.map(f=>f.id===editingField?{...f,name:nf.name,type:nf.type,options:nf.options}:f)});
      setEditingField(null);
    } else {
      save({...strat,fields:[...strat.fields,{id:genId(),name:nf.name,type:nf.type,options:nf.options}]});
    }
    setNf({name:'',type:'dropdown',options:[],optIn:''});setAdding(false);
  };
  const startEdit=f=>{
    setEditingField(f.id);
    setNf({name:f.name,type:f.type,options:f.options||[],optIn:''});
    setAdding(true);
  };
  const cancelEdit=()=>{
    setEditingField(null);
    setAdding(false);
    setNf({name:'',type:'dropdown',options:[],optIn:''});
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
                <button className="ib edit-btn" title="Edit step" onClick={()=>startEdit(f)}>{I.Edit}</button>
                <button className="ib" onClick={()=>mvF(i,-1)}>{I.Up}</button>
                <button className="ib" onClick={()=>mvF(i,1)}>{I.Down}</button>
                <button className="ib del" onClick={()=>rmF(f.id)}>{I.Trash}</button>
              </div>
            </div>
          ))}
        </div>
        {adding?(
          <div className="add-panel">
            <div className="add-panel-title">{editingField?'Edit Step':'New Step'}</div>
            <div className="f"><label>Name</label>
              <input type="text" value={nf.name} autoFocus onChange={e=>setNf({...nf,name:e.target.value})} placeholder="e.g. HTF Bias, Liquidity Target…"/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:8,letterSpacing:3,textTransform:'uppercase',color:'var(--text2)',marginBottom:8,fontFamily:'var(--mono)',fontWeight:600}}>Answer Type</div>
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
                    <input type="text" value={nf.optIn} placeholder="Add option…" onChange={e=>setNf({...nf,optIn:e.target.value})}
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
              <button className="btn btn-primary" onClick={addF}>{editingField?'Update Step':'Save Step'}</button>
              <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        ):(
          <button className="add-trig" onClick={()=>setAdding(true)}>{I.Plus} Add a step</button>
        )}
        <div className="div"/>
        <div style={{background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:10,padding:'20px 24px'}}>
          <div style={{fontSize:8,letterSpacing:3,textTransform:'uppercase',color:'var(--text3)',marginBottom:8,fontFamily:'var(--mono)',fontWeight:600}}>Account</div>
          <div style={{fontSize:14,color:'var(--text)',marginBottom:4,fontWeight:700,fontFamily:'var(--sans)'}}>@{profile.username}</div>
          <div style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--mono)'}}>
            Member since {profile.createdAt?new Date(profile.createdAt).toLocaleDateString('en-GB',{month:'long',year:'numeric'}):'—'}
          </div>
        </div>
      </div>
    </div>
  );
}
