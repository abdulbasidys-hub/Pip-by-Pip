import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  History, 
  Settings as SettingsIcon, 
  LogOut, 
  Trash2,
  Plus,
  Zap,
  ChevronDown,
  TrendingUp,
  Target,
  Activity,
  Layers,
  ArrowUp,
  ArrowDown,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

/**
 * PIP BY PIP - TERMINAL V4
 * Updated: Global theme toggle (icon only) visible on all pages including Auth.
 */

const DEFAULT_STRATEGY_TEMPLATES = {
  'Market Structure': [
    { id: '1', name: 'Pair', type: 'text' },
    { id: '2', name: 'HTF Bias (Daily)', type: 'select', options: ['Bullish', 'Bearish', 'Neutral'] },
    { id: '3', name: 'Premium / Discount', type: 'select', options: ['Premium', 'Discount', 'EQ'] },
    { id: '4', name: 'Entry TF', type: 'select', options: ['1m', '5m', '15m', '1H'] }
  ],
  'IPCEM': [
    { id: '5', name: 'Pair', type: 'text' },
    { id: '6', name: '4H Bias', type: 'select', options: ['Bullish', 'Bearish'] },
    { id: '7', name: '1H Market State', type: 'select', options: ['Expansion', 'Retracement', 'Reversal', 'Compression'] },
    { id: '8', name: 'Entry Model', type: 'select', options: ['A', 'B'] }
  ],
  'Liquidity': [
    { id: '9', name: 'Pair', type: 'select', options: ['Nasdaq', 'GBPJPY'] },
    { id: '10', name: '4H BOS Direction', type: 'select', options: ['Bullish', 'Bearish'] },
    { id: '11', name: 'Liquidity Target', type: 'select', options: ['RH', 'RL', 'EQH', 'EQL'] }
  ]
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [strategyConfigs, setStrategyConfigs] = useState(DEFAULT_STRATEGY_TEMPLATES);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('pbp_v4_data');
    const theme = localStorage.getItem('pbp_theme');
    if (theme) setDarkMode(theme === 'dark');
    
    if (data) {
      const parsed = JSON.parse(data);
      setTrades(parsed.trades || []);
      setAllUsers(parsed.users || []);
      setStrategyConfigs(parsed.configs || DEFAULT_STRATEGY_TEMPLATES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pbp_v4_data', JSON.stringify({ trades, users: allUsers, configs: strategyConfigs }));
  }, [trades, allUsers, strategyConfigs]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('pbp_theme', next ? 'dark' : 'light');
  };

  const handleSignUp = (newUser) => {
    if (allUsers.find(u => u.username === newUser.username)) return alert("User already exists.");
    setAllUsers([...allUsers, newUser]);
    setCurrentUser(newUser);
    setView('dashboard');
  };

  const handleLogin = (username, password) => {
    const found = allUsers.find(u => u.username === username && u.password === password);
    if (found) { setCurrentUser(found); setView('dashboard'); }
    else { alert("Invalid login."); }
  };

  const updatePassword = (oldPass, newPass) => {
    if (currentUser.password !== oldPass) return alert("Wrong password.");
    const updatedUsers = allUsers.map(u => 
      u.username === currentUser.username ? { ...u, password: newPass } : u
    );
    setAllUsers(updatedUsers);
    setCurrentUser({ ...currentUser, password: newPass });
    alert("Password updated!");
  };

  const deleteAccount = () => {
    const updatedUsers = allUsers.filter(u => u.username !== currentUser.username);
    const updatedTrades = trades.filter(t => t.username !== currentUser.username);
    setAllUsers(updatedUsers);
    setTrades(updatedTrades);
    setCurrentUser(null);
    alert("Account deleted.");
  };

  const userTrades = trades.filter(t => t.username === currentUser.username);

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 relative ${darkMode ? 'bg-[#0b0d0e] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* GLOBAL THEME TOGGLE - Icon Only & Always Visible */}
      <div className="fixed top-8 right-8 z-50">
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-xl border transition-all shadow-lg ${
            darkMode 
              ? 'bg-[#111315] border-white/10 text-white hover:bg-white/10' 
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {!currentUser ? (
        <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} darkMode={darkMode} />
      ) : (
        <>
          <nav className={`w-64 border-r flex flex-col fixed h-full z-20 transition-colors duration-300 ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <h1 className={`text-xl font-black tracking-tighter italic ${darkMode ? 'text-white' : 'text-slate-900'}`}>PIP BY PIP</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${darkMode ? 'bg-emerald-500' : 'bg-blue-600'}`}></span>
                <p className={`text-[9px] uppercase tracking-widest font-black ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Online Journal</p>
              </div>
            </div>
            
            <div className="flex-1 py-6 px-4 space-y-1.5">
              <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={18}/>} label="Dashboard" onClick={() => setView('dashboard')} darkMode={darkMode} />
              <NavItem active={view === 'history'} icon={<History size={18}/>} label="Journal History" onClick={() => setView('history')} darkMode={darkMode} />
              <NavItem active={view === 'add'} icon={<PlusSquare size={18}/>} label="New Entry" onClick={() => setView('add')} darkMode={darkMode} />
              <NavItem active={view === 'explorer'} icon={<Layers size={18}/>} label="Overview" onClick={() => setView('explorer')} darkMode={darkMode} />
              <NavItem active={view === 'settings'} icon={<SettingsIcon size={18}/>} label="Settings" onClick={() => setView('settings')} darkMode={darkMode} />
            </div>

            <div className={`p-6 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div 
                onClick={() => setView('profile')}
                className={`flex items-center gap-3 p-4 rounded-xl border mb-4 cursor-pointer transition-all ${
                  view === 'profile' 
                    ? (darkMode ? 'bg-white text-black border-white' : 'bg-blue-600 text-white border-blue-600') 
                    : (darkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  view === 'profile' ? (darkMode ? 'bg-black text-white' : 'bg-white text-blue-600') : 'bg-slate-800 text-white'
                }`}>
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-black truncate uppercase ${view === 'profile' ? (darkMode ? 'text-black' : 'text-white') : (darkMode ? 'text-white' : 'text-slate-900')}`}>
                    {currentUser.username}
                  </p>
                  <p className={`text-[9px] truncate font-bold uppercase ${view === 'profile' ? (darkMode ? 'text-slate-800' : 'text-blue-100') : 'text-slate-500'}`}>
                    {currentUser.strategy}
                  </p>
                </div>
              </div>
              <button onClick={() => setCurrentUser(null)} className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </nav>

          <main className="flex-1 ml-64 p-10 overflow-y-auto">
            {view === 'dashboard' && <Dashboard trades={userTrades} currentStrategy={currentUser.strategy} configs={strategyConfigs} darkMode={darkMode} />}
            {view === 'add' && <AddTrade user={currentUser} config={strategyConfigs[currentUser.strategy]} onAdd={(t) => { setTrades([t, ...trades]); setView('history'); }} darkMode={darkMode} />}
            {view === 'history' && <TradeHistory trades={userTrades} currentStrategy={currentUser.strategy} configs={strategyConfigs} darkMode={darkMode} />}
            {view === 'explorer' && <ProtocolExplorer configs={strategyConfigs} trades={trades} darkMode={darkMode} />}
            {view === 'settings' && <ProtocolArchitect strategy={currentUser.strategy} configs={strategyConfigs} setConfigs={setStrategyConfigs} darkMode={darkMode} />}
            {view === 'profile' && <Profile user={currentUser} onUpdatePassword={updatePassword} onDeleteAccount={deleteAccount} darkMode={darkMode} />}
          </main>
        </>
      )}
    </div>
  );
}

// --- VIEW COMPONENTS ---

function Dashboard({ trades, currentStrategy, configs, darkMode }) {
  const [scope, setScope] = useState('All');
  const filtered = scope === 'All' ? trades : trades.filter(t => t.mode === scope);
  
  const stats = useMemo(() => {
    const total = filtered.filter(t => t.outcome !== 'No Trade').length;
    const wins = filtered.filter(t => t.outcome === 'Win').length;
    const wr = total > 0 ? (wins / total) * 100 : 0;
    const rGain = filtered.reduce((s, t) => s + parseFloat(t.resultR || 0), 0);
    return { wr, rGain, total: filtered.length };
  }, [filtered]);

  const strategyFields = configs[currentStrategy] || [];

  return (
    <div className="space-y-10 max-w-7xl animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dashboard</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-bold">{currentStrategy}</p>
        </div>
        <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-200/50 border-slate-200'}`}>
          {['All', 'Live', 'Backtest'].map(s => (
            <button key={s} onClick={() => setScope(s)} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${scope === s ? (darkMode ? 'bg-white text-black' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <StatCard icon={<Target className="text-emerald-500"/>} label="Win Rate" value={`${stats.wr.toFixed(1)}%`} sub={`${stats.total} Samples`} darkMode={darkMode} />
        <StatCard icon={<TrendingUp className="text-blue-500"/>} label="Net Profit" value={`${stats.rGain.toFixed(1)}R`} sub="Cumulative Profit" darkMode={darkMode} />
        <StatCard icon={<Activity className={`${darkMode ? 'text-white' : 'text-slate-400'}`}/>} label="Volume" value={stats.total} sub="Total Logs" darkMode={darkMode} />
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} className="text-blue-500"/> Overview
        </h3>
        <div className={`border rounded-2xl overflow-hidden shadow-2xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-medium">
              <thead>
                <tr className={`${darkMode ? 'bg-white/[0.02] border-b border-white/5' : 'bg-slate-50 border-b border-slate-200'}`}>
                  <th className="px-4 py-4 uppercase tracking-widest text-slate-500 font-black">Date</th>
                  <th className="px-4 py-4 uppercase tracking-widest text-slate-500 font-black">Mode</th>
                  {strategyFields.map(f => (
                    <th key={f.id} className="px-4 py-4 uppercase tracking-widest text-slate-500 font-black">{f.name}</th>
                  ))}
                  <th className="px-4 py-4 uppercase tracking-widest text-slate-500 font-black">Result</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
                {filtered.slice(0, 5).map((t, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className={`px-4 py-4 font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.date}</td>
                    <td className="px-4 py-4 font-black uppercase text-[9px]">{t.mode}</td>
                    {strategyFields.map(f => (
                      <td key={f.id} className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.strategyData[f.name] || '—'}</td>
                    ))}
                    <td className={`px-4 py-4 font-black italic ${t.outcome === 'Win' ? 'text-emerald-400' : 'text-rose-500'}`}>{parseFloat(t.resultR).toFixed(1)}R</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TradeHistory({ trades, currentStrategy, configs, darkMode }) {
  const strategyFields = configs[currentStrategy] || [];

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-500">
      <header>
        <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Journal History</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-bold">{currentStrategy}</p>
      </header>

      <div className={`border rounded-2xl overflow-hidden shadow-2xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
            <thead className={`${darkMode ? 'bg-white/[0.02] border-b border-white/5' : 'bg-slate-50 border-b border-slate-200'} text-slate-500 font-black uppercase tracking-widest`}>
              <tr>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Mode</th>
                {strategyFields.map(f => (
                  <th key={f.id} className="px-6 py-5">{f.name}</th>
                ))}
                <th className="px-6 py-5">Outcome</th>
                <th className="px-6 py-5">Result</th>
                <th className="px-6 py-5">Notes</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {trades.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className={`px-6 py-5 font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.date}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${t.mode === 'Live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                      {t.mode}
                    </span>
                  </td>
                  {strategyFields.map(f => (
                    <td key={f.id} className={`px-6 py-5 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {t.strategyData[f.name] || <span className="opacity-30 italic">N/A</span>}
                    </td>
                  ))}
                  <td className={`px-6 py-5 font-black uppercase tracking-tight ${t.outcome === 'Win' ? 'text-emerald-400' : t.outcome === 'Loss' ? 'text-rose-500' : 'text-slate-500'}`}>
                    {t.outcome}
                  </td>
                  <td className={`px-6 py-5 font-black italic ${darkMode ? 'text-white' : 'text-slate-900'}`}>{parseFloat(t.resultR).toFixed(1)}R</td>
                  <td className={`px-6 py-5 max-w-[200px] truncate italic ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{t.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {trades.length === 0 && (
            <div className="p-24 text-center">
              <History size={32} className={`mx-auto mb-4 opacity-20 ${darkMode ? 'text-slate-800' : 'text-slate-400'}`} />
              <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em]">No Entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProtocolArchitect({ strategy, configs, setConfigs, darkMode }) {
  const [fields, setFields] = useState(configs[strategy] || []);
  const [adding, setAdding] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: 'text', options: [] });
  const [optionInput, setOptionInput] = useState('');

  const save = (updated) => {
    const newConfigs = { ...configs, [strategy]: updated };
    setConfigs(newConfigs);
    setFields(updated);
  };

  const move = (index, dir) => {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    save(next);
  };

  const addOption = () => {
    if (!optionInput) return;
    setNewField({ ...newField, options: [...newField.options, optionInput] });
    setOptionInput('');
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-bold">{strategy}</p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {fields.map((f, i) => (
          <div key={f.id} className={`border p-5 rounded-2xl flex items-center justify-between group transition-all shadow-lg ${darkMode ? 'bg-[#111315] border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} className="text-slate-700 hover:text-blue-500 transition-colors"><ArrowUp size={12}/></button>
                <button onClick={() => move(i, 1)} className="text-slate-700 hover:text-blue-500 transition-colors"><ArrowDown size={12}/></button>
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{f.name}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{f.type === 'select' ? `Selective (${f.options.length} items)` : 'Text Input'}</p>
              </div>
            </div>
            <button onClick={() => save(fields.filter((_, idx) => idx !== i))} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>

      {!adding ? (
        <button onClick={() => setAdding(true)} className={`w-full py-6 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all ${darkMode ? 'border-white/5 text-slate-500 hover:text-white hover:border-white/20 bg-white/[0.01]' : 'border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 bg-white'}`}>
          New Column
        </button>
      ) : (
        <div className={`border-2 p-8 rounded-2xl space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 ${darkMode ? 'bg-[#111315] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="grid grid-cols-2 gap-6">
            <FormInput label="Column Name" value={newField.name} onChange={v => setNewField({...newField, name: v})} darkMode={darkMode} />
            <FormSelect label="Input Type" options={['Text', 'Dropdown']} value={newField.type} onChange={v => setNewField({...newField, type: v})} darkMode={darkMode} />
          </div>
          
          {newField.type === 'Dropdown' && (
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Options</label>
              <div className="flex gap-2">
                <input className={`flex-1 rounded-xl px-5 py-3 text-xs outline-none ${darkMode ? 'bg-black/40 border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'}`} placeholder="Option..." value={optionInput} onChange={e => setOptionInput(e.target.value)} />
                <button onClick={addOption} className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newField.options.map((o, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 ${darkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    {o} <button onClick={() => setNewField({...newField, options: newField.options.filter((_, idx) => idx !== i)})}><Trash2 size={10}/></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => {
              const mappedType = newField.type === 'Dropdown' ? 'select' : 'text';
              save([...fields, { ...newField, type: mappedType, id: generateId() }]);
              setNewField({ name: '', type: 'text', options: [] });
              setAdding(false);
            }} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${darkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'}`}>Save Column</button>
            <button onClick={() => setAdding(false)} className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border ${darkMode ? 'bg-white/5 text-white border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProtocolExplorer({ configs = {}, trades = [], darkMode }) {
  const strategyStats = useMemo(() => {
    const stats = {};
    Object.keys(configs).forEach(stratName => {
      stats[stratName] = {
        backtest: { r: 0, wins: 0, total: 0 },
        live: { r: 0, wins: 0, total: 0 },
        fields: configs[stratName].length
      };
    });
    trades.forEach(t => {
      const strat = t.strategyName || t.currentStrategy;
      if (strat && stats[strat]) {
        const modeKey = t.mode === 'Live' ? 'live' : 'backtest';
        if (t.outcome !== 'No Trade') {
          stats[strat][modeKey].total += 1;
          if (t.outcome === 'Win') stats[strat][modeKey].wins += 1;
        }
        stats[strat][modeKey].r += parseFloat(t.resultR || 0);
      }
    });
    return stats;
  }, [configs, trades]);

  return (
    <div className="max-w-7xl space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Overview</h2>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(strategyStats).map(([name, data]) => {
          const btWR = data.backtest.total > 0 ? (data.backtest.wins / data.backtest.total * 100).toFixed(1) : "0.0";
          const liveWR = data.live.total > 0 ? (data.live.wins / data.live.total * 100).toFixed(1) : "0.0";
          const totalR = (data.backtest.r + data.live.r).toFixed(1);
          return (
            <div key={name} className={`border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className={`p-8 md:w-1/3 border-b md:border-b-0 md:border-r ${darkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/30'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <Layers className="text-slate-400" size={20} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black italic uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{data.fields} Params</p>
                  </div>
                </div>
                <div className="mt-8 space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Total P/L</p>
                  <p className={`text-3xl font-black italic ${parseFloat(totalR) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{totalR}R</p>
                </div>
              </div>
              <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Backtest</h4></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">Win Rate</p><p className="text-lg font-black text-blue-400 italic">{btWR}%</p></div>
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">R-Gain</p><p className={`text-lg font-black italic ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{data.backtest.r.toFixed(1)}R</p></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Live</h4></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">Win Rate</p><p className="text-lg font-black text-emerald-400 italic">{liveWR}%</p></div>
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">R-Gain</p><p className={`text-lg font-black italic ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{data.live.r.toFixed(1)}R</p></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddTrade({ user, config, onAdd, darkMode }) {
  const [mode, setMode] = useState('Live');
  const [baseData, setBaseData] = useState({ date: new Date().toISOString().split('T')[0], resultR: '0', outcome: 'Win', notes: '' });
  const [strategyData, setStrategyData] = useState(config.reduce((acc, f) => {
    return { ...acc, [f.name]: f.type === 'select' ? f.options[0] : '' };
  }, {}));

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>New Entry</h2>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{user.strategy}</p>
        </div>
        <div className={`flex p-1 rounded-xl border shadow-xl ${darkMode ? 'bg-[#111315] border-white/10' : 'bg-slate-200/50 border-slate-200'}`}>
          <button onClick={() => setMode('Live')} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Live' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Live</button>
          <button onClick={() => setMode('Backtest')} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Backtest' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Backtest</button>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onAdd({ ...baseData, strategyData, mode, username: user.username, strategyName: user.strategy }); }} className="space-y-6">
        <div className={`border p-8 rounded-2xl grid grid-cols-3 gap-6 shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <FormInput label="Date" type="date" value={baseData.date} onChange={v => setBaseData({...baseData, date: v})} darkMode={darkMode} />
          <FormSelect label="Outcome" options={['Win', 'Loss', 'Breakeven', 'No Trade']} value={baseData.outcome} onChange={v => setBaseData({...baseData, outcome: v})} darkMode={darkMode} />
          <FormInput label="Result (R)" type="number" step="0.1" value={baseData.resultR} onChange={v => setBaseData({...baseData, resultR: v})} darkMode={darkMode} />
        </div>
        <div className={`border p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {config.map(f => (
              f.type === 'select' 
                ? <FormSelect key={f.id} label={f.name} options={f.options} value={strategyData[f.name]} onChange={v => setStrategyData({...strategyData, [f.name]: v})} darkMode={darkMode} />
                : <FormInput key={f.id} label={f.name} value={strategyData[f.name]} onChange={v => setStrategyData({...strategyData, [f.name]: v})} darkMode={darkMode} />
            ))}
          </div>
        </div>
        <div className={`border p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Notes</h3>
          <textarea className={`w-full rounded-xl p-6 text-xs transition-all outline-none min-h-[140px] font-medium border ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500'}`} placeholder="Thoughts..." value={baseData.notes} onChange={e => setBaseData({...baseData, notes: e.target.value})} />
        </div>
        <button className={`w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] ${darkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'}`}>Save Entry</button>
      </form>
    </div>
  );
}

function Profile({ user, onUpdatePassword, onDeleteAccount, darkMode }) {
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handlePassUpdate = (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) return alert("Passwords don't match.");
    onUpdatePassword(passForm.old, passForm.new);
    setPassForm({ old: '', new: '', confirm: '' });
  };
  return (
    <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Profile</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-bold font-black tracking-widest">User Settings</p>
      </header>
      <div className={`border rounded-[2rem] p-8 shadow-2xl space-y-6 ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="grid grid-cols-2 gap-8">
          <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Username</p><p className={`text-xl font-medium italic uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.username}</p></div>
          <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Strategy</p><p className={`text-xl font-medium italic uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.strategy}</p></div>
        </div>
      </div>
      <div className={`border rounded-[2.5rem] p-10 shadow-2xl ${darkMode ? 'bg-[#111315] border-white/5 border-t-white/10' : 'bg-white border-slate-200 border-t-slate-50'}`}>
        <div className="flex items-center gap-3 mb-8"><Lock size={18} className="text-slate-500" /><h3 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Password Settings</h3></div>
        <form onSubmit={handlePassUpdate} className="space-y-5">
          <FormInput label="Old Password" type="password" value={passForm.old} onChange={v => setPassForm({...passForm, old: v})} required darkMode={darkMode} />
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="New Password" type="password" value={passForm.new} onChange={v => setPassForm({...passForm, new: v})} required darkMode={darkMode} />
            <FormInput label="Confirm New Password" type="password" value={passForm.confirm} onChange={v => setPassForm({...passForm, confirm: v})} required darkMode={darkMode} />
          </div>
          <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all ${darkMode ? 'bg-blue-50 text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'}`}>Update Password</button>
        </form>
      </div>
      <div className="pt-10 border-t border-white/5">
        <div className={`border rounded-2xl p-8 flex items-center justify-between ${darkMode ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
          <div><h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Delete Account</h4></div>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Delete</button>
          ) : (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-200">
              <button onClick={onDeleteAccount} className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthPage({ onLogin, onSignUp, darkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', confirm: '', strategy: 'Market Structure' });
  return (
    <div className={`flex items-center justify-center min-h-screen p-6 w-full transition-colors duration-500 ${darkMode ? 'bg-[#0b0d0e]' : 'bg-slate-50'}`}>
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <h1 className={`text-4xl font-black italic tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>PIP BY PIP</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Journal</p>
        </div>
        <div className={`border rounded-[2.5rem] p-10 shadow-2xl space-y-10 text-left transition-all ${darkMode ? 'bg-[#111315] border-white/5 border-t-white/10' : 'bg-white border-slate-200 border-t-slate-50 shadow-blue-100/50'}`}>
          <div className="space-y-3"><h2 className={`text-2xl font-bold tracking-tighter uppercase italic text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>{isLogin ? 'Log In' : 'Sign Up'}</h2></div>
          <form onSubmit={e => { e.preventDefault(); if (isLogin) onLogin(form.username, form.password); else onSignUp(form); }} className="space-y-5">
            <FormInput label="Username" value={form.username} onChange={v => setForm({...form, username: v})} required darkMode={darkMode} />
            <FormInput label="Password" type="password" value={form.password} onChange={v => setForm({...form, password: v})} required darkMode={darkMode} />
            {!isLogin && (<><FormInput label="Confirm Password" type="password" value={form.confirm} onChange={v => setForm({...form, confirm: v})} required darkMode={darkMode} /><FormSelect label="Strategy" options={Object.keys(DEFAULT_STRATEGY_TEMPLATES)} value={form.strategy} onChange={v => setForm({...form, strategy: v})} darkMode={darkMode} /></>)}
            <button className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] mt-6 shadow-xl active:scale-95 transition-all ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>{isLogin ? 'Log In' : 'Sign Up'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className={`w-full text-center text-[9px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-700 hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>{isLogin ? "Create Account" : "Return to Log In"}</button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, darkMode }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
      active 
        ? (darkMode ? 'bg-white text-black shadow-xl' : 'bg-slate-900 text-white shadow-xl shadow-slate-200') 
        : (darkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50')
    }`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, sub, darkMode }) {
  return (
    <div className={`border p-8 rounded-[2rem] relative overflow-hidden group shadow-xl transition-all ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">{icon} {label}</h3>
      </div>
      <div className={`text-4xl font-black italic tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function FormInput({ label, type = 'text', value, onChange, required, step, darkMode }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} required={required} step={step} className={`w-full border rounded-xl px-5 py-3.5 text-xs transition-all outline-none font-bold ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'}`} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function FormSelect({ label, options, value, onChange, darkMode }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <select className={`w-full border rounded-xl px-5 py-3.5 text-xs outline-none appearance-none font-bold cursor-pointer transition-all ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'}`} value={value} onChange={e => onChange(e.target.value)}>
          {options && options.map(o => <option key={o} value={o} className={darkMode ? 'bg-[#111315]' : 'bg-white'}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
      </div>
    </div>
  );
}

