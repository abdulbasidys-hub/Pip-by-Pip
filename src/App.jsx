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
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/**
 * PIP BY PIP - TERMINAL V4
 * * --- HARDCODED USERS ---
 * Password for all accounts is: 123
 */
const INITIAL_USERS = [
  { username: 'Mr. Nobody', password: '123', strategy: null },
  { username: 'Onety77', password: '123', strategy: null },
  { username: 'SadikYakasai', password: '123', strategy: null }
];

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
  const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  const [strategyConfigs, setStrategyConfigs] = useState(DEFAULT_STRATEGY_TEMPLATES);
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('pbp_v4_data');
    const theme = localStorage.getItem('pbp_theme');
    if (theme) setDarkMode(theme === 'dark');
    
    if (data) {
      const parsed = JSON.parse(data);
      setTrades(parsed.trades || []);
      const storedUsers = parsed.users || [];
      const mergedUsers = [...INITIAL_USERS];
      storedUsers.forEach(u => {
        if (!mergedUsers.find(mu => mu.username === u.username)) mergedUsers.push(u);
      });
      setAllUsers(mergedUsers);
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
    if (found) { 
      setCurrentUser(found); 
      setView('dashboard'); 
    } else { 
      alert("Invalid credentials."); 
    }
  };

  const setInitialStrategy = (stratName) => {
    const updatedUsers = allUsers.map(u => 
      u.username === currentUser.username ? { ...u, strategy: stratName } : u
    );
    setAllUsers(updatedUsers);
    setCurrentUser({ ...currentUser, strategy: stratName });
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
  };

  const userTrades = trades.filter(t => t.username === currentUser.username);

  // AUTH VIEW
  if (!currentUser) return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} darkMode={darkMode} toggleTheme={toggleTheme} />;

  // STRATEGY ONBOARDING
  if (!currentUser.strategy) return (
    <div className={`min-h-screen flex items-center justify-center p-4 md:p-6 ${darkMode ? 'bg-[#0b0d0e]' : 'bg-slate-50'}`}>
      <div className="max-w-4xl w-full text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-500">
        <div>
          <h1 className={`text-2xl md:text-4xl font-black italic tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>WELCOME, {currentUser.username.toUpperCase()}</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Choose your starting Protocol</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {Object.keys(DEFAULT_STRATEGY_TEMPLATES).map(strat => (
            <button 
              key={strat}
              onClick={() => setInitialStrategy(strat)}
              className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border text-left transition-all hover:scale-[1.02] group relative overflow-hidden ${
                darkMode ? 'bg-[#111315] border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xl shadow-slate-200/50'
              }`}
            >
              <Layers className={`mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} size={32} />
              <h3 className={`text-xl font-black italic uppercase tracking-tighter mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{strat}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select template</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 relative ${darkMode ? 'bg-[#0b0d0e] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* MOBILE HEADER */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-6 border-b transition-colors ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
        <h1 className={`text-lg font-black italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>PIP BY PIP</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={darkMode ? 'text-white' : 'text-slate-900'}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <nav className={`
        fixed lg:relative inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out border-r
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}
        flex flex-col
      `}>
        {/* SIDEBAR HEADER */}
        <div className={`p-6 border-b flex items-center gap-3 overflow-hidden ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className={`flex p-1.5 rounded-lg border flex-shrink-0 transition-all ${
              darkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg font-black tracking-tighter italic truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>PIP BY PIP</h1>
              <p className={`text-[8px] uppercase tracking-widest font-black truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Online Journal</p>
            </div>
          )}
        </div>
        
        {/* NAVIGATION LINKS */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <NavItem collapsed={isSidebarCollapsed} active={view === 'dashboard'} icon={<LayoutDashboard size={18}/>} label="Dashboard" onClick={() => {setView('dashboard'); setIsMobileMenuOpen(false);}} darkMode={darkMode} />
          <NavItem collapsed={isSidebarCollapsed} active={view === 'history'} icon={<History size={18}/>} label="Journal History" onClick={() => {setView('history'); setIsMobileMenuOpen(false);}} darkMode={darkMode} />
          <NavItem collapsed={isSidebarCollapsed} active={view === 'add'} icon={<PlusSquare size={18}/>} label="New Entry" onClick={() => {setView('add'); setIsMobileMenuOpen(false);}} darkMode={darkMode} />
          <NavItem collapsed={isSidebarCollapsed} active={view === 'explorer'} icon={<Layers size={18}/>} label="Overview" onClick={() => {setView('explorer'); setIsMobileMenuOpen(false);}} darkMode={darkMode} />
          <NavItem collapsed={isSidebarCollapsed} active={view === 'settings'} icon={<SettingsIcon size={18}/>} label="Settings" onClick={() => {setView('settings'); setIsMobileMenuOpen(false);}} darkMode={darkMode} />
        </div>

        {/* FOOTER - THEME TOGGLE NEXT TO PROFILE NAME */}
        <div className={`p-4 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div 
              onClick={() => {setView('profile'); setIsMobileMenuOpen(false);}}
              className={`flex flex-1 items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSidebarCollapsed ? 'justify-center p-2' : ''} ${
                view === 'profile' 
                  ? (darkMode ? 'bg-white text-black border-white' : 'bg-blue-600 text-white border-blue-600') 
                  : (darkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
              }`}
            >
              <div className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black ${
                view === 'profile' ? (darkMode ? 'bg-black text-white' : 'bg-white text-blue-600') : 'bg-slate-800 text-white'
              }`}>
                {currentUser.username[0].toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black truncate uppercase ${view === 'profile' ? (darkMode ? 'text-black' : 'text-white') : (darkMode ? 'text-white' : 'text-slate-900')}`}>
                    {currentUser.username}
                  </p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button 
                onClick={toggleTheme} 
                className={`p-3 rounded-xl border transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
          </div>

          <button onClick={() => setCurrentUser(null)} className={`w-full mt-4 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
            <LogOut size={14} /> {!isSidebarCollapsed && 'Log Out'}
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed lg:hidden inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 p-4 md:p-10 pt-20 lg:pt-10 overflow-y-auto`}>
        {view === 'dashboard' && <Dashboard trades={userTrades} currentStrategy={currentUser.strategy} configs={strategyConfigs} darkMode={darkMode} />}
        {view === 'add' && <AddTrade user={currentUser} config={strategyConfigs[currentUser.strategy]} onAdd={(t) => { setTrades([t, ...trades]); setView('history'); }} darkMode={darkMode} />}
        {view === 'history' && <TradeHistory trades={userTrades} currentStrategy={currentUser.strategy} configs={strategyConfigs} darkMode={darkMode} />}
        {view === 'explorer' && <ProtocolExplorer configs={strategyConfigs} trades={trades} darkMode={darkMode} />}
        {view === 'settings' && <ProtocolArchitect strategy={currentUser.strategy} configs={strategyConfigs} setConfigs={setStrategyConfigs} darkMode={darkMode} />}
        {view === 'profile' && <Profile user={currentUser} onUpdatePassword={updatePassword} onDeleteAccount={deleteAccount} darkMode={darkMode} />}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

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
    <div className="max-w-7xl space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Overview</h2>
      </header>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {Object.entries(strategyStats).map(([name, data]) => {
          const btWR = data.backtest.total > 0 ? (data.backtest.wins / data.backtest.total * 100).toFixed(1) : "0.0";
          const liveWR = data.live.total > 0 ? (data.live.wins / data.live.total * 100).toFixed(1) : "0.0";
          const totalR = (data.backtest.r + data.live.r).toFixed(1);
          return (
            <div key={name} className={`border rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className={`p-6 md:p-8 md:w-1/3 border-b md:border-b-0 md:border-r ${darkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/30'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <Layers className="text-slate-400" size={18} />
                  </div>
                  <div>
                    <h3 className={`text-lg md:text-xl font-black italic uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{data.fields} Params</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-8 space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Total P/L</p>
                  <p className={`text-2xl md:text-3xl font-black italic ${parseFloat(totalR) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{totalR}R</p>
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Backtest</h4></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">Win Rate</p><p className="text-base md:text-lg font-black text-blue-400 italic">{btWR}%</p></div>
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">R-Gain</p><p className={`text-base md:text-lg font-black italic ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{data.backtest.r.toFixed(1)}R</p></div>
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Live</h4></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">Win Rate</p><p className="text-base md:text-lg font-black text-emerald-400 italic">{liveWR}%</p></div>
                    <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1">R-Gain</p><p className={`text-base md:text-lg font-black italic ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{data.live.r.toFixed(1)}R</p></div>
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

function AuthPage({ onLogin, onSignUp, darkMode, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', confirm: '', strategy: 'Market Structure' });
  return (
    <div className={`flex items-center justify-center min-h-screen p-4 md:p-6 w-full transition-colors duration-500 ${darkMode ? 'bg-[#0b0d0e]' : 'bg-slate-50'}`}>
      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
        <button onClick={toggleTheme} className={`p-2.5 md:p-3 rounded-xl border transition-all shadow-lg ${darkMode ? 'bg-[#111315] border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 shadow-md hover:bg-slate-50'}`}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 md:mb-10">
          <h1 className={`text-3xl md:text-4xl font-black italic tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>PIP BY PIP</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Journal</p>
        </div>
        <div className={`border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-6 md:space-y-10 text-left transition-all ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-xl md:text-2xl font-bold tracking-tighter uppercase italic text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>{isLogin ? 'Log In' : 'Sign Up'}</h2>
          <form onSubmit={e => { e.preventDefault(); if (isLogin) onLogin(form.username, form.password); else onSignUp(form); }} className="space-y-4 md:space-y-5">
            <FormInput label="Username" value={form.username} onChange={v => setForm({...form, username: v})} required darkMode={darkMode} />
            <FormInput label="Password" type="password" value={form.password} onChange={v => setForm({...form, password: v})} required darkMode={darkMode} />
            {!isLogin && (<><FormInput label="Confirm" type="password" value={form.confirm} onChange={v => setForm({...form, confirm: v})} required darkMode={darkMode} /><FormSelect label="Strategy" options={Object.keys(DEFAULT_STRATEGY_TEMPLATES)} value={form.strategy} onChange={v => setForm({...form, strategy: v})} darkMode={darkMode} /></>)}
            <button className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] mt-4 shadow-xl ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>{isLogin ? 'Log In' : 'Sign Up'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className={`w-full text-center text-[9px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-700 hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>{isLogin ? "Create Account" : "Return to Log In"}</button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6 md:space-y-8 max-w-7xl animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dashboard</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-1 md:mt-2 font-bold">{currentStrategy}</p>
        </div>
        <div className={`flex p-1 rounded-xl border self-start ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-200/50 border-slate-200'}`}>
          {['All', 'Live', 'Backtest'].map(s => (
            <button key={s} onClick={() => setScope(s)} className={`px-4 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${scope === s ? (darkMode ? 'bg-white text-black' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard icon={<Target className="text-emerald-500"/>} label="Win Rate" value={`${stats.wr.toFixed(1)}%`} sub={`${stats.total} Samples`} darkMode={darkMode} />
        <StatCard icon={<TrendingUp className="text-blue-500"/>} label="Net Profit" value={`${stats.rGain.toFixed(1)}R`} sub="Cumulative" darkMode={darkMode} />
        <StatCard icon={<Activity className="text-slate-500"/>} label="Volume" value={stats.total} sub="Total Logs" darkMode={darkMode} />
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} className="text-blue-500"/> Recent Activity
        </h3>
        <div className={`border rounded-2xl overflow-hidden shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] min-w-[500px]">
              <thead className={`${darkMode ? 'bg-white/[0.02] border-b border-white/5' : 'bg-slate-50 border-b border-slate-200'}`}>
                <tr className="uppercase tracking-widest text-slate-500 font-black">
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Mode</th>
                  {strategyFields.map(f => (<th key={f.id} className="px-4 py-4">{f.name}</th>))}
                  <th className="px-4 py-4 text-right">R</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
                {filtered.slice(0, 5).map((t, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-4 font-mono whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-4 font-black uppercase text-[9px]">{t.mode}</td>
                    {strategyFields.map(f => (<td key={f.id} className="px-4 py-4 whitespace-nowrap">{t.strategyData[f.name] || '—'}</td>))}
                    <td className={`px-4 py-4 font-black italic text-right ${t.outcome === 'Win' ? 'text-emerald-400' : 'text-rose-500'}`}>{parseFloat(t.resultR).toFixed(1)}R</td>
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
    <div className="space-y-6 md:space-y-8 max-w-7xl animate-in fade-in duration-500">
      <header>
        <h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Journal History</h2>
      </header>
      <div className={`border rounded-2xl overflow-hidden shadow-2xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse min-w-[700px]">
            <thead className={`${darkMode ? 'bg-white/[0.02] border-b border-white/5' : 'bg-slate-50 border-b border-slate-200'} text-slate-500 font-black uppercase tracking-widest`}>
              <tr><th className="px-6 py-5">Date</th><th className="px-6 py-5">Mode</th>{strategyFields.map(f => (<th key={f.id} className="px-6 py-5">{f.name}</th>))}<th className="px-6 py-5">Outcome</th><th className="px-6 py-5 text-right">Result</th></tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {trades.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-5 font-mono">{t.date}</td>
                  <td className="px-6 py-5 text-[9px] font-black uppercase">{t.mode}</td>
                  {strategyFields.map(f => (<td key={f.id} className="px-6 py-5">{t.strategyData[f.name] || '—'}</td>))}
                  <td className={`px-6 py-5 font-black uppercase ${t.outcome === 'Win' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.outcome}</td>
                  <td className="px-6 py-5 font-black italic text-right">{parseFloat(t.resultR).toFixed(1)}R</td>
                </tr>
              ))}
            </tbody>
          </table>
          {trades.length === 0 && (
            <div className="p-16 md:p-24 text-center">
              <History size={32} className={`mx-auto mb-4 opacity-20 ${darkMode ? 'text-slate-800' : 'text-slate-400'}`} />
              <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em]">Empty Journal</p>
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
  const save = (updated) => { const newConfigs = { ...configs, [strategy]: updated }; setConfigs(newConfigs); setFields(updated); };
  const move = (index, dir) => { const next = [...fields]; const target = index + dir; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; save(next); };
  const addOption = () => { if (!optionInput) return; setNewField({ ...newField, options: [...newField.options, optionInput] }); setOptionInput(''); };
  return (
    <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header><h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2><p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2 font-bold">{strategy}</p></header>
      <div className="grid grid-cols-1 gap-3">
        {fields.map((f, i) => (
          <div key={f.id} className={`border p-4 md:p-5 rounded-2xl flex items-center justify-between group transition-all shadow-lg ${darkMode ? 'bg-[#111315] border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} className="text-slate-700 hover:text-blue-500"><ArrowUp size={12}/></button>
                <button onClick={() => move(i, 1)} className="text-slate-700 hover:text-blue-500"><ArrowDown size={12}/></button>
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{f.name}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest truncate">{f.type === 'select' ? `${f.options.length} options` : 'Input'}</p>
              </div>
            </div>
            <button onClick={() => save(fields.filter((_, idx) => idx !== i))} className="p-2 text-slate-700 hover:text-rose-500"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
      {!adding ? (<button onClick={() => setAdding(true)} className={`w-full py-5 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all ${darkMode ? 'border-white/5 text-slate-500 hover:text-white bg-white/[0.01]' : 'border-slate-200 text-slate-400 hover:text-slate-900 bg-white'}`}>New Column</button>) : (
        <div className={`border-2 p-6 md:p-8 rounded-2xl space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 ${darkMode ? 'bg-[#111315] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Name" value={newField.name} onChange={v => setNewField({...newField, name: v})} darkMode={darkMode} />
            <FormSelect label="Type" options={['Text', 'Dropdown']} value={newField.type} onChange={v => setNewField({...newField, type: v})} darkMode={darkMode} />
          </div>
          {newField.type === 'Dropdown' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input className={`flex-1 rounded-xl px-4 py-3 text-xs outline-none ${darkMode ? 'bg-black/40 border border-white/5 text-white' : 'bg-slate-50 border border-slate-200'}`} placeholder="Option..." value={optionInput} onChange={e => setOptionInput(e.target.value)} />
                <button onClick={addOption} className={`px-5 rounded-xl text-[10px] font-black uppercase ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>Add</button>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => { const mappedType = newField.type === 'Dropdown' ? 'select' : 'text'; save([...fields, { ...newField, type: mappedType, id: generateId() }]); setAdding(false); }} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>Save</button>
            <button onClick={() => setAdding(false)} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${darkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTrade({ user, config, onAdd, darkMode }) {
  const [mode, setMode] = useState('Live');
  const [baseData, setBaseData] = useState({ date: new Date().toISOString().split('T')[0], resultR: '0', outcome: 'Win', notes: '' });
  const [strategyData, setStrategyData] = useState(config.reduce((acc, f) => ({ ...acc, [f.name]: f.type === 'select' ? f.options[0] : '' }), {}));
  return (
    <div className="max-w-5xl mx-auto pb-10 md:pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className={`text-xl md:text-2xl font-black italic uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>New Entry</h2>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{user.strategy}</p>
        </div>
        <div className={`flex p-1 rounded-xl border shadow-xl self-start ${darkMode ? 'bg-[#111315] border-white/10' : 'bg-white border-slate-200'}`}>
          <button onClick={() => setMode('Live')} className={`px-6 md:px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Live' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Live</button>
          <button onClick={() => setMode('Backtest')} className={`px-6 md:px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Backtest' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Backtest</button>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onAdd({ ...baseData, strategyData, mode, username: user.username, strategyName: user.strategy }); }} className="space-y-4 md:space-y-6">
        <div className={`border p-6 md:p-8 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <FormInput label="Date" type="date" value={baseData.date} onChange={v => setBaseData({...baseData, date: v})} darkMode={darkMode} />
          <FormSelect label="Outcome" options={['Win', 'Loss', 'BE', 'No Trade']} value={baseData.outcome} onChange={v => setBaseData({...baseData, outcome: v})} darkMode={darkMode} />
          <FormInput label="Result (R)" type="number" step="0.1" value={baseData.resultR} onChange={v => setBaseData({...baseData, resultR: v})} darkMode={darkMode} />
        </div>
        <div className={`border p-6 md:p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 md:mb-8 italic">Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-10 gap-y-6 md:gap-y-8">
            {config.map(f => (
              f.type === 'select' 
                ? <FormSelect key={f.id} label={f.name} options={f.options} value={strategyData[f.name]} onChange={v => setStrategyData({...strategyData, [f.name]: v})} darkMode={darkMode} />
                : <FormInput key={f.id} label={f.name} value={strategyData[f.name]} onChange={v => setStrategyData({...strategyData, [f.name]: v})} darkMode={darkMode} />
            ))}
          </div>
        </div>
        <div className={`border p-6 md:p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Notes</h3>
          <textarea className={`w-full rounded-xl p-4 md:p-6 text-xs transition-all outline-none min-h-[120px] font-medium border ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-white/20' : 'bg-slate-50 border-slate-200'}`} placeholder="..." value={baseData.notes} onChange={e => setBaseData({...baseData, notes: e.target.value})} />
        </div>
        <button className={`w-full py-5 md:py-6 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all ${darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>Save Log</button>
      </form>
    </div>
  );
}

function Profile({ user, onUpdatePassword, onDeleteAccount, darkMode }) {
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handlePassUpdate = (e) => { e.preventDefault(); if (passForm.new !== passForm.confirm) return alert("Mismatch."); onUpdatePassword(passForm.old, passForm.new); setPassForm({ old: '', new: '', confirm: '' }); };
  return (
    <div className="max-w-2xl space-y-8 md:space-y-10 animate-in fade-in duration-500">
      <header><h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Profile</h2></header>
      <div className={`border rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-2xl space-y-4 md:space-y-6 ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8"><div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">User</p><p className={`text-lg md:text-xl font-medium italic uppercase tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.username}</p></div><div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Strategy</p><p className={`text-lg md:text-xl font-medium italic uppercase tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.strategy}</p></div></div></div>
      <div className={`border rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}><div className="flex items-center gap-3 mb-6 md:mb-8 text-slate-500"><Lock size={18}/><h3 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Security</h3></div><form onSubmit={handlePassUpdate} className="space-y-4 md:space-y-5"><FormInput label="Old" type="password" value={passForm.old} onChange={v => setPassForm({...passForm, old: v})} required darkMode={darkMode} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"><FormInput label="New" type="password" value={passForm.new} onChange={v => setPassForm({...passForm, new: v})} required darkMode={darkMode} /><FormInput label="Confirm" type="password" value={passForm.confirm} onChange={v => setPassForm({...passForm, confirm: v})} required darkMode={darkMode} /></div><button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl ${darkMode ? 'bg-blue-50 text-black' : 'bg-slate-900 text-white'}`}>Update</button></form></div>
      <div className="pt-8 md:pt-10 border-t border-white/5"><div className={`border rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center justify-between ${darkMode ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}><div className="text-center sm:text-left"><h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Danger Zone</h4></div>{!showDeleteConfirm ? (<button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">Delete Account</button>) : (<div className="flex items-center gap-2 md:gap-3 animate-in fade-in zoom-in duration-200"><button onClick={onDeleteAccount} className="px-4 md:px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase">Confirm</button><button onClick={() => setShowDeleteConfirm(false)} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase ${darkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button></div>)}</div></div>
    </div>
  );
}

// --- UI HELPERS ---

function NavItem({ icon, label, active, onClick, darkMode, collapsed }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${collapsed ? 'justify-center' : ''} ${
      active 
        ? (darkMode ? 'bg-white text-black shadow-xl' : 'bg-slate-900 text-white shadow-xl shadow-slate-200') 
        : (darkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50')
    }`}>
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

function StatCard({ icon, label, value, sub, darkMode }) {
  return (
    <div className={`border p-6 md:p-8 rounded-2xl md:rounded-[2rem] relative overflow-hidden group shadow-xl transition-all ${darkMode ? 'bg-[#111315] border-white/5' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">{icon} {label}</h3>
      </div>
      <div className={`text-3xl md:text-4xl font-black italic tracking-tighter mb-1 md:mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function FormInput({ label, type = 'text', value, onChange, required, step, darkMode }) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} required={required} step={step} className={`w-full border rounded-xl px-4 md:px-5 py-3 md:py-3.5 text-xs transition-all outline-none font-bold ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'}`} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function FormSelect({ label, options, value, onChange, darkMode }) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <select className={`w-full border rounded-xl px-4 md:px-5 py-3 md:py-3.5 text-xs outline-none appearance-none font-bold cursor-pointer transition-all ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'}`} value={value} onChange={e => onChange(e.target.value)}>
          {options && options.map(o => <option key={o} value={o} className={darkMode ? 'bg-[#111315]' : 'bg-white'}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
      </div>
    </div>
  );
}