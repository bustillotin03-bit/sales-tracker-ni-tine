"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Trash2, Plus, PieChart, Wallet, BookOpen, Heart } from "lucide-react";

const SakuraCSS = () => (
  <style jsx global>{`
    @keyframes fall {
      0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) translateX(100px) rotate(360deg); opacity: 0.3; }
    }
    .petal { position: fixed; background-color: #ffb7c5; border-radius: 150% 0 150% 0; pointer-events: none; z-index: 0; animation: fall linear infinite; }
    .glass-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px 0 rgba(244, 114, 182, 0.2); }
    .pink-glow { box-shadow: 0 0 20px rgba(244, 114, 182, 0.4); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

const CATEGORY_CONFIG: { [key: string]: { rate: number } } = {
  "New Account with an associated Service": { rate: 0.10 },
  "Reinstating an account (Disconnected then Activated)": { rate: 0.10 },
  "Internet and Cable Service": { rate: 0.10 },
  "Xfinity Mobile Care Insurance": { rate: 0.10 },
  "Xfinity Pro": { rate: 0.10 },
  "Mobile plan Upgrade (Mobile select to Mobile Plus)": { rate: 0.10 },
  "Mobile service Generation Upgrade (5G to 6G)": { rate: 0.10 },
  "Smartphone, Smartwatch and Tablet": { rate: 0.10 },
  "Service Channels (TV Core, Sports & News, WST, TVplus, TvPremium)": { rate: 0.10 },
  "HBO Channel (For Xfinity points Exchange)": { rate: 0.10 },
  "Other (Will update later)": { rate: 0.10 },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ledgerFilter, setLedgerFilter] = useState("today");
  const [activeTipStage, setActiveTipStage] = useState("seed");
  const [sales, setSales] = useState<any[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [usdAmount, setUsdAmount] = useState("");
  const [isActivated, setIsActivated] = useState(false); // Checkbox state
  const [monthlyGoal] = useState(10000);

  useEffect(() => { fetchSales(); }, []);

  async function fetchSales() {
    const { data, error } = await supabase.from("xfinity_sales").select("*").order("created_at", { ascending: false });
    if (!error) setSales(data || []);
  }

  async function addSale(e: React.FormEvent) {
    e.preventDefault();
    const conversionRate = 56;
    const calculatedPhp = parseFloat(usdAmount) * conversionRate * CATEGORY_CONFIG[category].rate;
    
    // Set Status logic
    let status = null;
    if (category === "Smartphone, Smartwatch and Tablet") {
      status = isActivated ? "Activated" : "Pending for activation";
    }

    const { error } = await supabase.from("xfinity_sales").insert([{ 
      category, 
      usd_amount: parseFloat(usdAmount), 
      php_commission: calculatedPhp,
      status: status
    }]);

    if (!error) { 
      setUsdAmount(""); 
      setIsActivated(false);
      await fetchSales(); 
      alert("Sale successfully saved! ✨"); 
    }
  }

  async function deleteSale(id: number) {
    if (confirm("Delete this sale entry?")) {
      const { error } = await supabase.from("xfinity_sales").delete().eq('id', id);
      if (!error) fetchSales();
    }
  }

  const getFilteredSales = (days: number | string) => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      if (days === "today") return saleDate.toDateString() === now.toDateString();
      return (Math.ceil(Math.abs(now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24))) <= (days as number);
    });
  };

  const totalPhp = sales.reduce((sum, s) => sum + s.php_commission, 0);
  const totalSalesCount = sales.length;
  const goalProgress = Math.min((totalPhp / monthlyGoal) * 100, 100);

  return (
    <main className="min-h-screen bg-[#fff5f7] font-sans pb-20 relative overflow-x-hidden text-gray-800 tracking-tight">
      <SakuraCSS />
      {[...Array(20)].map((_, i) => (
        <div key={i} className="petal" style={{ left: `${Math.random() * 100}vw`, width: `${Math.random() * 8 + 10}px`, height: `${Math.random() * 8 + 10}px`, animationDuration: `${Math.random() * 6 + 4}s`, animationDelay: `${Math.random() * 5}s` }} />
      ))}

      {/* HEADER */}
      <div className="relative z-10 bg-white/40 backdrop-blur-xl border-b border-pink-200 p-6 mb-6 text-center shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-pink-600 italic uppercase tracking-tighter">
          {"Christine's Xfinity Sales Tracker 🌸"}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* NAVIGATION */}
        <div className="flex bg-white/30 backdrop-blur-md p-1.5 rounded-2xl mb-8 border border-white/40">
          {['dashboard', 'ledger', 'analytics', 'tips'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-xl capitalize transition-all duration-300 ${
                activeTab === tab ? 'bg-white text-pink-600 shadow-lg pink-glow scale-[1.02]' : 'text-pink-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="glass-card p-6 rounded-[2rem]">
              <div className="flex justify-between items-end mb-3">
                <h2 className="text-pink-500 font-black text-[10px] uppercase tracking-widest">Monthly Goal Progress</h2>
                <span className="text-pink-600 font-black text-xs">₱{totalPhp.toLocaleString()} / ₱{monthlyGoal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-pink-100/50 h-5 rounded-full overflow-hidden border border-white p-0.5">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${goalProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-pink-500 mt-3 italic font-bold uppercase tracking-tight text-center">
                {goalProgress >= 100 ? "Goal achieved! Excellent work! 👑" : `₱${(monthlyGoal - totalPhp).toLocaleString()} to go!`}
              </p>
            </div>

            <div className="glass-card p-6 rounded-[2rem]">
              <h2 className="text-xl font-black text-pink-500 mb-5 flex items-center gap-2 tracking-tight">Log a New Sale ✨</h2>
              <form onSubmit={addSale} className="flex flex-col gap-4">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border-2 border-pink-100 p-4 rounded-2xl focus:border-pink-400 focus:outline-none bg-white/50 text-sm font-semibold">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* CONDITIONAL CHECKBOX FOR HARDWARE */}
                {category === "Smartphone, Smartwatch and Tablet" && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/50 rounded-2xl border-2 border-pink-100 animate-in slide-in-from-top-2">
                    <input 
                      type="checkbox" 
                      id="activated"
                      checked={isActivated}
                      onChange={(e) => setIsActivated(e.target.checked)}
                      className="w-5 h-5 accent-pink-500"
                    />
                    <label htmlFor="activated" className="text-sm font-bold text-pink-500 uppercase tracking-widest">Mark as Activated</label>
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 font-bold">$</span>
                  <input type="number" placeholder="Original Plan Cost" value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)} className="w-full border-2 border-pink-100 pl-8 p-4 rounded-2xl focus:border-pink-400 focus:outline-none bg-white/50 text-sm font-semibold" required />
                </div>
                <button type="submit" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-5 rounded-2xl font-black shadow-lg hover:shadow-pink-300/50 active:scale-95 transition-all uppercase tracking-widest text-xs pink-glow">
                  Save Sale Entry 🌸
                </button>
              </form>
            </div>

            <div className="bg-gradient-to-br from-pink-500/90 to-pink-600/90 backdrop-blur-md p-6 rounded-[2rem] text-white shadow-xl pink-glow border border-white/20">
              <h2 className="font-black flex items-center gap-2 mb-3 italic tracking-wider text-xs uppercase underline">Smart Insight</h2>
              <p className="text-sm leading-relaxed font-medium tracking-tight">
                {"Every single call is a fresh opportunity to turn a standard customer interaction into a major win! You are fully equipped, your tracker is locked in, and your goals are completely within reach. Focus on Reinstating an account and Adding HBO Channels today—securing just a couple of these will instantly spike your PHP commission and supercharge your momentum. You've got this!"}
              </p>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="glass-card p-6 rounded-[2rem]"><p className="text-[10px] text-pink-400 font-black uppercase tracking-widest mb-1">Lifetime Value</p><p className="text-2xl font-black text-gray-800">${sales.reduce((sum, s) => sum + s.usd_amount, 0).toFixed(0)}</p></div>
              <div className="glass-card p-6 rounded-[2rem]"><p className="text-[10px] text-pink-400 font-black uppercase tracking-widest mb-1">Lifetime Com</p><p className="text-2xl font-black text-pink-600">₱{totalPhp.toFixed(0)}</p></div>
            </div>
            
            <div className="glass-card p-8 rounded-[2.5rem]">
              <h3 className="font-black text-pink-500 mb-6 text-center uppercase tracking-widest text-[11px] border-b border-pink-100 pb-4 tracking-tighter">Live Category Breakdown</h3>
              <div className="space-y-6">
                {CATEGORIES.map(cat => {
                  const count = sales.filter(s => s.category.trim() === cat.trim()).length;
                  const percentage = totalSalesCount > 0 ? ((count / totalSalesCount) * 100).toFixed(0) : 0;
                  return (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                        <span className={count > 0 ? "text-gray-700" : "text-gray-400"}>{cat}</span>
                        <span className={count > 0 ? "text-pink-600" : "text-gray-300"}>{count > 0 ? `${percentage}% (${count} Sales)` : "Sitting at zero"}</span>
                      </div>
                      <div className="w-full bg-pink-100/30 h-3 rounded-full border border-white/50 shadow-inner overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${count > 0 ? 'bg-gradient-to-r from-pink-300 to-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.4)]' : 'bg-transparent'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'ledger' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
              {[{l:'Today',v:'today'},{l:'7 Days',v:'7'},{l:'15 Days',v:'15'},{l:'30 Days',v:'30'},{l:'90 Days',v:'90'}].map(f => (
                <button key={f.v} onClick={() => setLedgerFilter(f.v)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${ledgerFilter === f.v ? 'bg-pink-500 text-white border-pink-600 shadow-lg pink-glow' : 'bg-white/60 text-pink-400 border-pink-100'}`}>{f.l}</button>
              ))}
            </div>
            <div className="glass-card p-5 rounded-2xl flex justify-between items-center px-6">
               <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Period Earnings</span>
               <span className="text-xl font-black text-pink-600">₱{getFilteredSales(ledgerFilter === "today" ? "today" : parseInt(ledgerFilter)).reduce((sum, s) => sum + s.php_commission, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="glass-card p-6 rounded-[2rem]">
              <div className="divide-y divide-pink-100 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar text-gray-700">
                {getFilteredSales(ledgerFilter === "today" ? "today" : parseInt(ledgerFilter)).length === 0 ? <p className="text-center py-10 text-pink-300 italic text-sm font-medium tracking-tighter">No sales found for this period. ✨</p> : getFilteredSales(ledgerFilter === "today" ? "today" : parseInt(ledgerFilter)).map((sale) => (
                  <div key={sale.id} className="py-4 flex justify-between items-center hover:bg-white/40 rounded-xl px-2 transition-colors">
                    <div className="max-w-[70%] font-bold">
                      <p className="text-sm truncate">{sale.category}</p>
                      {/* STATUS DISPLAY */}
                      {sale.status && (
                        <p className={`text-[8px] font-black uppercase tracking-widest ${sale.status === 'Activated' ? 'text-green-500' : 'text-orange-400'}`}>
                          {sale.status}
                        </p>
                      )}
                      <p className="text-[9px] uppercase tracking-tighter text-pink-400 font-black italic">{new Date(sale.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-pink-600 font-black text-sm leading-none">₱{sale.php_commission.toFixed(2)}</p>
                          <p className="text-[10px] text-pink-300 font-bold uppercase tracking-widest mt-1">{"Save Complete"}</p>
                        </div>
                        {/* TRASH ICON */}
                        <button 
                          onClick={() => deleteSale(sale.id)}
                          className="p-2 text-red-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIPS TAB */}
        {activeTab === 'tips' && (
          <div className="space-y-4 animate-in duration-500">
            <div className="flex bg-white/30 backdrop-blur-md p-1 rounded-xl border border-white/40">
              {['Seed','Pitch','Objection','Close'].map(s => (
                <button key={s} onClick={() => setActiveTipStage(s.toLowerCase())} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTipStage === s.toLowerCase() ? 'bg-white text-pink-600 shadow-md border border-pink-100' : 'text-pink-400'}`}>{s}</button>
              ))}
            </div>

            <div className="glass-card p-6 rounded-[2.5rem] text-gray-600">
              {activeTipStage === 'seed' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-pink-600 font-black text-xs uppercase text-center mb-4 tracking-widest italic tracking-tight">Planting the Seed 🌱</h3>
                  {[
                    "Just a quick note while I pull up your file: your account is pre-approved for a special discount that gives you better service for less money. Let's fix your current concern first, and I will gladly share those details with you right after.",
                    "Before we dive into resolving your main concern today, I just noticed while pulling up your file that your account is fully eligible for a brand-new exclusive offer. It's designed to help lower your monthly statement while giving you even better service quality—let's definitely take a quick look at that right after we get this current issue sorted out for you!",
                    "While I work on fixing your connection right now, I also saw a great new offer on your account that can lower your monthly bill. Let's get your main problem solved first, and then we can check out those savings together before we finish."
                  ].map((t, i) => (
                    <div key={i} className="p-5 bg-white/50 rounded-2xl border-l-4 border-pink-400 italic text-xs leading-relaxed font-semibold shadow-sm italic">{"\""}{t}{"\""}</div>
                  ))}
                </div>
              )}

              {activeTipStage === 'pitch' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-pink-600 font-black text-xs uppercase text-center mb-4 tracking-widest italic tracking-tight">Pitching Sales 💎</h3>
                  {[
                    "With everyone in the house online at the same time, upgrading to our faster network speed means no more annoying lagging or buffering when you are watching your favorite shows.",
                    "Since you already use our internet every day, adding an Xfinity mobile line to your plan lets you put both services on one easy bill and cuts your total monthly phone cost down by half.",
                    "Let's get your account fully turned back on today so you don't lose your setup. Plus, if we add HBO to your package right now, you get all the best shows and movies, plus extra reward points you can use for free movie rentals."
                  ].map((t, i) => (
                    <div key={i} className="p-5 bg-white/50 rounded-2xl border-l-4 border-pink-400 italic text-xs leading-relaxed font-semibold shadow-sm italic">{"\""}{t}{"\""}</div>
                  ))}
                </div>
              )}

              {activeTipStage === 'objection' && (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 no-scrollbar animate-in fade-in">
                  <h3 className="text-pink-600 font-black text-xs uppercase text-center mb-4 tracking-widest italic tracking-tight">Overcoming Objections 🛡️</h3>
                  {[
                    { o: "It's expensive. I want my bill lower.", s: "I completely understand wanting to keep your bills low. But because this special bundle comes with a multi-service discount, it actually lowers your overall monthly out-of-pocket cost compared to paying for things separately." },
                    { o: "I'll ask my husband/wife first.", s: "I completely understand wanting to talk it over with your spouse! Since this special promotion is only active on your account today, let's go ahead and lock it in right now so you don't lose the discount. You have a full 30 days to review it on the bill together, and it's completely flexible if they prefer a different option. Sound fair?" },
                    { o: "Maybe next time.", s: "I totally get that. But since your account is already pre-qualified right this minute, waiting until next time actually means missing out on several weeks of extra savings and rewards. Let's take just a minute to set it up today so you start saving immediately!" },
                    { o: "I'll think about it later.", s: "I'd love to give you time to think, but promotional slots change daily, and this price won't be here tomorrow. Let's take just 60 seconds to set it up now while we are already connected." },
                    { o: "I found a provider that offers lower cost.", s: "Other companies can look cheap at first, but once you add up hidden activation fees and equipment rentals, our Xfinity bundle actually gives you better speed and value for your money on one simple bill." },
                    { o: "Your service is already bad enough.", s: "I am so sorry you've had a frustrating experience, and that is exactly why I want to fix this for you today. Upgrading our network generation and optimizing your plan will actually give you the fast, stable connection you deserve." }
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-white/50 rounded-2xl border-l-4 border-pink-400 shadow-sm space-y-2 italic">
                      <p className="text-[9px] font-black text-pink-600 uppercase italic tracking-widest border-b border-pink-50 pb-2">Objection: {"\""}{item.o}{"\""}</p>
                      <p className="text-xs italic leading-relaxed font-semibold tracking-tight">What to say: {"\""}{item.s}{"\""}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTipStage === 'close' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-pink-600 font-black text-xs uppercase text-center mb-4 tracking-widest italic tracking-tight">Closing the Deal 🏆</h3>
                  {[
                    "Awesome! Let's get that added to your account right now so you don't miss out on today's special discount. Would you prefer to have your confirmation sent to your email address on file, or via text message?",
                    "To make sure we have everything set up right, you're getting faster service and a lower overall monthly bill today. I've gone ahead and applied that upgrade for you. I'm just sending a quick confirmation text to your phone now—sound good?"
                  ].map((t, i) => (
                    <div key={i} className="p-5 bg-white/50 rounded-2xl border-l-4 border-pink-400 italic text-xs leading-relaxed font-semibold shadow-sm italic">{"\""}{t}{"\""}</div>
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