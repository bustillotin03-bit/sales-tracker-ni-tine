"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { 
  Trash2, Plus, Minus, PieChart, Wallet, BookOpen, 
  Heart, PhoneCall, Star, TrendingUp, Save
} from "lucide-react";

// --- CUSTOM STYLES ---
const SakuraCSS = () => (
  <style jsx global>{`
    @keyframes fall {
      0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) translateX(100px) rotate(360deg); opacity: 0.3; }
    }
    .petal { position: fixed; background-color: #ffb7c5; border-radius: 150% 0 150% 0; pointer-events: none; z-index: 0; animation: fall linear infinite; }
    .glass-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px 0 rgba(244, 114, 182, 0.2); border-radius: 2rem; }
    .pink-glow { box-shadow: 0 0 20px rgba(244, 114, 182, 0.4); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

// --- CONFIGURATIONS ---
const POINT_CONFIG: { [key: string]: number } = {
  "4th Line": 50, "7th Line": 75, "12th Line": 75, "22nd Line": 75,
  "Smartwatch & Tablet idv": 15, "New Mobile Device Upgrade": 10,
  "Xfinity Mobile Care Insurance": 25, "Internet Connect": 10,
  "HBO Channel (For Xfinity points Exchange)": 15,
  "New Account with an associated Service": 1, "Reinstating an account (Disconnected then Activated)": 1,
  "Internet and Cable Service": 1, "Xfinity Pro": 1, "Mobile plan Upgrade": 1, "Other": 1
};

const CATEGORIES = Object.keys(POINT_CONFIG);

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ledgerFilter, setLedgerFilter] = useState("today");
  const [activeTipStage, setActiveTipStage] = useState("seed");
  
  const [sales, setSales] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [dailyCalls, setDailyCalls] = useState(0);
  const [dailyCSAT, setDailyCSAT] = useState("0");

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [monthlyGoal] = useState(1000);

  useEffect(() => { fetchSales(); fetchCallHistory(); }, []);

  async function fetchSales() {
    const { data, error } = await supabase.from("xfinity_sales").select("*").order("created_at", { ascending: false });
    if (!error) setSales(data || []);
  }

  async function fetchCallHistory() {
    const { data, error } = await supabase.from("call_history_logs").select("*").order("created_at", { ascending: false });
    if (!error) setCallHistory(data || []);
  }

  // --- ACTIONS ---
  async function addSale() {
    const pts = POINT_CONFIG[category] * quantity;
    const { error } = await supabase.from("xfinity_sales").insert([{ 
      category, 
      quantity, 
      points: pts, 
      php_commission: pts * 10,
      usd_amount: 0 
    }]);
    
    if (!error) { 
      setQuantity(1); 
      await fetchSales(); 
      alert("Milestone Saved! 🌸"); 
    } else { 
      alert("Save failed!"); 
    }
  }

  async function saveCallLog() {
    const { error } = await supabase.from("call_history_logs").insert([{
      call_count: dailyCalls,
      csat_score: parseFloat(dailyCSAT)
    }]);
    if (!error) { fetchCallHistory(); alert("Call Stats Logged! 📞"); }
  }

  async function deleteSale(id: number) {
    if (confirm("Delete this entry?")) { await supabase.from("xfinity_sales").delete().eq('id', id); fetchSales(); }
  }

  async function deleteCall(id: number) {
    if (confirm("Delete this record?")) { await supabase.from("call_history_logs").delete().eq('id', id); fetchCallHistory(); }
  }

  // --- SUMMARIES ---
  const totalPoints = sales.reduce((sum, s) => sum + (s.points || 0), 0);
  const goalProgress = Math.min((totalPoints / monthlyGoal) * 100, 100);

  const getFilteredCalls = (days: number) => {
    const now = new Date();
    return callHistory.filter(log => {
      const logDate = new Date(log.created_at);
      const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= days;
    }).reduce((s, l) => s + l.call_count, 0);
  };

  return (
    <main className="min-h-screen bg-[#fff5f7] font-sans pb-24 overflow-x-hidden text-gray-800 tracking-tight">
      <SakuraCSS />
      {[...Array(15)].map((_, i) => (
        <div key={i} className="petal" style={{ left: `${Math.random() * 100}vw`, width: '12px', height: '12px', animationDuration: `${Math.random() * 5 + 5}s`, animationDelay: `${Math.random() * 5}s` }} />
      ))}

      <div className="relative z-10 bg-white/40 backdrop-blur-xl border-b border-pink-200 p-6 mb-6 text-center shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-pink-600 italic uppercase tracking-tighter">
          {"Christine's Sales & Performance 🌸"}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        <div className="flex bg-white/30 backdrop-blur-md p-1.5 rounded-2xl mb-8 border border-white/40 overflow-x-auto no-scrollbar">
          {['dashboard', 'ledger', 'calls', 'analytics', 'tips'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[85px] py-2.5 text-[9px] font-black rounded-xl capitalize transition-all ${
                activeTab === tab ? 'bg-white text-pink-600 shadow-lg pink-glow' : 'text-pink-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="glass-card p-6 text-center">
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Total Earned Points</p>
              <p className="text-4xl font-black text-pink-600">{totalPoints.toLocaleString()} PTS</p>
              <p className="text-lg font-bold text-pink-400 mt-1">₱{(totalPoints * 10).toLocaleString()}</p>
              <div className="mt-6">
                <div className="flex justify-between text-[9px] font-black uppercase mb-1">
                  <span>Monthly Goal Progress</span>
                  <span>{totalPoints} / {monthlyGoal} PTS</span>
                </div>
                <div className="h-4 bg-pink-100 rounded-full overflow-hidden border border-white">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all duration-1000" style={{ width: `${goalProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-black text-pink-500 mb-5 flex items-center gap-2 tracking-tight">Add Sale Milestone ✨</h2>
              <div className="space-y-4">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-2 border-pink-100 p-4 rounded-2xl bg-white/50 text-sm font-semibold outline-none focus:border-pink-400">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border-2 border-pink-100">
                  <span className="text-sm font-bold text-pink-500 uppercase">Quantity</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-pink-100 text-pink-600 rounded-full"><Minus size={16}/></button>
                    <span className="font-black text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-pink-100 text-pink-600 rounded-full"><Plus size={16}/></button>
                  </div>
                </div>
                <button onClick={addSale} className="w-full bg-pink-500 text-white p-5 rounded-2xl font-black shadow-lg pink-glow uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                  Log Points Milestone 🌸
                </button>
              </div>
            </div>

            {/* RESTORED PINK GRADIENT BOX */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 rounded-[2rem] text-white shadow-xl pink-glow border border-white/20">
              <h2 className="font-black flex items-center gap-2 mb-3 italic tracking-wider text-xs uppercase underline">Smart Insight</h2>
              <p className="text-sm leading-relaxed font-medium tracking-tight">
                {"Every single call is a fresh opportunity to turn a standard customer interaction into a major win! You are fully equipped, your tracker is locked in, and your goals are completely within reach. Focus on Reinstating an account and Adding HBO Channels today—securing just a couple of these will instantly spike your PHP commission and supercharge your momentum. You've got this!"}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
            <div className="glass-card p-6 text-center">
              <h2 className="text-2xl font-black text-pink-600 uppercase italic mb-4">Daily Call Tracker</h2>
              <div className="flex items-center justify-center gap-8 mb-8">
                <button onClick={() => setDailyCalls(Math.max(0, dailyCalls - 1))} className="p-4 bg-pink-100 text-pink-600 rounded-full"><Minus size={24}/></button>
                <div className="text-center"><p className="text-5xl font-black text-gray-700">{dailyCalls}</p><p className="text-[10px] font-black text-pink-400 uppercase">Calls Today</p></div>
                <button onClick={() => setDailyCalls(dailyCalls + 1)} className="p-4 bg-pink-500 text-white rounded-full pink-glow"><Plus size={24}/></button>
              </div>
              <div className="mt-8 border-t border-pink-100 pt-6 text-left">
                <div className="flex justify-between items-center mb-4 text-pink-500 font-black"><span className="text-[10px] uppercase">Daily CSAT Score</span> <span>{dailyCSAT}%</span></div>
                <input type="range" min="0" max="100" value={dailyCSAT} onChange={(e) => setDailyCSAT(e.target.value)} className="w-full h-3 bg-pink-100 rounded-lg appearance-none accent-pink-500 mb-6" />
                <button onClick={saveCallLog} className="w-full bg-pink-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 pink-glow shadow-md">
                  <Save size={14}/> Save Current Call Stats
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[{l:'Yesterday',v:getFilteredCalls(1)},{l:'Last 7 Days',v:getFilteredCalls(7)},{l:'Last 15 Days',v:getFilteredCalls(15)},{l:'Full Month',v:getFilteredCalls(30)}].map((s,i)=>(
                <div key={i} className="glass-card p-4 border-white shadow-sm">
                  <p className="text-[8px] font-black text-pink-400 uppercase mb-1">{s.l}</p>
                  <p className="text-lg font-black text-pink-600 leading-none">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-4 border-b border-pink-50 pb-2 text-center italic">Detailed Records</h3>
              <div className="divide-y divide-pink-100 max-h-[40vh] overflow-y-auto no-scrollbar">
                {callHistory.map(log => (
                  <div key={log.id} className="py-3 flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-gray-700 text-sm">{log.call_count} Calls • {log.csat_score}% CSAT</p>
                      <p className="text-[9px] text-pink-400 font-bold uppercase italic">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={() => deleteCall(log.id)} className="p-2 text-red-200 hover:text-red-500 transition-all opacity-40 group-hover:opacity-100"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
              {[{l:'Today',v:'today'},{l:'7 Days',v:'7'},{l:'30 Days',v:'30'},{l:'90 Days',v:'90'}].map(f => (
                <button key={f.v} onClick={() => setLedgerFilter(f.v)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase transition-all border ${ledgerFilter === f.v ? 'bg-pink-500 text-white border-pink-600 shadow-lg pink-glow' : 'bg-white/60 text-pink-400 border-pink-100'}`}>{f.l}</button>
              ))}
            </div>
            <div className="glass-card p-6">
              <div className="divide-y divide-pink-100 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar text-gray-700">
                {sales.map((sale) => (
                  <div key={sale.id} className="py-4 flex justify-between items-center group">
                    <div className="max-w-[70%] font-bold">
                      <p className="text-sm truncate">{sale.category}</p>
                      <p className="text-[9px] uppercase tracking-tighter text-pink-400 font-black italic">{new Date(sale.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-pink-600 font-black text-sm">+{sale.points} PTS</p>
                        <button onClick={() => deleteSale(sale.id)} className="p-2 text-red-200 hover:text-red-500 opacity-30 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-card p-8 rounded-[2.5rem] animate-in fade-in">
            <h3 className="font-black text-pink-500 mb-6 text-center uppercase tracking-widest text-[11px] border-b border-pink-100 pb-4 tracking-tighter">Category Tracking</h3>
            <div className="space-y-6">
              {CATEGORIES.map(cat => {
                const count = sales.filter(s => s.category === cat).length;
                const perc = sales.length > 0 ? ((count / sales.length) * 100).toFixed(0) : 0;
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <span className={count > 0 ? "text-gray-700" : "text-gray-400"}>{cat}</span>
                      <span>{perc}%</span>
                    </div>
                    <div className="h-2.5 bg-pink-100/30 rounded-full overflow-hidden border border-white">
                      <div className="h-full bg-gradient-to-r from-pink-300 to-pink-500 transition-all duration-1000" style={{ width: `${perc}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4 animate-in duration-500">
            <div className="flex bg-white/30 backdrop-blur-md p-1 rounded-xl border border-white/40">
              {['Seed','Pitch','Objection','Close'].map(s => (
                <button key={s} onClick={() => setActiveTipStage(s.toLowerCase())} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTipStage === s.toLowerCase() ? 'bg-white text-pink-600 shadow-md border border-pink-100' : 'text-pink-400'}`}>{s}</button>
              ))}
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] text-gray-600">
              {activeTipStage === 'seed' && (
                <div className="space-y-4">
                  {[
                    "Just a quick note: your account is pre-approved for a special discount that gives you better service for less money.",
                    "Before we dive into resolving your main concern, I noticed your account is fully eligible for an exclusive offer!"
                  ].map((t, i) => <div key={i} className="p-4 bg-white/50 rounded-2xl border-l-4 border-pink-400 italic text-xs font-semibold shadow-sm">{"\""}{t}{"\""}</div>)}
                </div>
              )}
              {activeTipStage === 'pitch' && (
                <div className="space-y-4">
                   {[
                    "With everyone home online, upgrading network speed means no more annoying lagging.",
                    "Since you already use our internet, adding a mobile line puts both on one bill and cuts the cost in half!"
                   ].map((t, i) => <div key={i} className="p-4 bg-white/50 rounded-2xl border-l-4 border-pink-400 italic text-xs font-semibold shadow-sm">{"\""}{t}{"\""}</div>)}
                </div>
              )}
              {activeTipStage === 'objection' && (
                <div className="space-y-4">
                   {[
                    { o: "It's expensive.", s: "I understand! But this bundle lowers your monthly out-of-pocket compared to paying separately." },
                    { o: "Ask my spouse.", s: "I get it! Lock it in today so you don't lose the discount, and review it together over the next 30 days!" }
                   ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/50 rounded-2xl border-l-4 border-pink-400 shadow-sm space-y-1 italic">
                      <p className="text-[9px] font-black text-pink-600 uppercase underline">Objection: "{item.o}"</p>
                      <p className="text-xs font-semibold">What to say: "{item.s}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}