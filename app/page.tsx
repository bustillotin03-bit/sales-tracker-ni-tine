"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const CATEGORIES = [
  "Creating New Account with an associated Service",
  "Reinstating an account (Disconnected then Activated)",
  "Adding Internet and Cable Service",
  "Adding Xfinity Mobile Care Insurance",
  "Adding Xfinity Pro",
  "Upgrading a mobile plan (Mobile select to Mobile Plus)",
  "Upgrading a mobile service Generation (5G to 6G)",
  "Adding Smartphone, Smartwatch and Tablet",
  "Adding Service Channels (TV Core, Sports & News, WST, TVplus, TvPremium)",
  "Adding HBO Channel (For Xfinity points Exchange)",
  "Other (Will update later)"
];

export default function Home() {
  const [sales, setSales] = useState<any[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [usdAmount, setUsdAmount] = useState("");

  async function fetchSales() {
    const { data, error } = await supabase
      .from("xfinity_sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setSales(data);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  async function addSale(e) {
    e.preventDefault();
    const conversionRate = 56; // 1 USD = 56 PHP
    const commissionPercentage = 0.10; // 10% commission
    const calculatedPhp = parseFloat(usdAmount) * conversionRate * commissionPercentage;

    const { error } = await supabase
      .from("xfinity_sales")
      .insert([{
        category: category,
        usd_amount: parseFloat(usdAmount),
        php_commission: calculatedPhp
      }]);

    if (!error) {
      setUsdAmount("");
      fetchSales(); 
    }
  }

  // --- ANALYTICS ENGINE ---
  const totalPhp = sales.reduce((sum, sale) => sum + Number(sale.php_commission), 0);
  const totalUsd = sales.reduce((sum, sale) => sum + Number(sale.usd_amount), 0);
  
  // Find the category with the least sales to give a smart recommendation
  const categoryCounts = sales.reduce((acc, sale) => {
    acc[sale.category] = (acc[sale.category] || 0) + 1;
    return acc;
  }, {});
  
  let lowestCategory = CATEGORIES[0];
  let lowestCount = Infinity;
  
  CATEGORIES.forEach(cat => {
    const count = categoryCounts[cat] || 0;
    if (count < lowestCount && cat !== "Other (Will update later)") {
      lowestCount = count;
      lowestCategory = cat;
    }
  });

  return (
    <main className="min-h-screen bg-pink-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-8 text-center drop-shadow-sm">
        Christine&apos;s Xfinity Sales Tracker 🎀
        </h1>

        {/* PERFORMANCE SUMMARY DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-6 rounded-2xl shadow-lg text-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span>💰</span> Total Commission (PHP)
            </h2>
            <p className="text-4xl font-extrabold">₱{totalPhp.toFixed(2)}</p>
            <p className="text-pink-100 mt-2 text-sm">Total Plan Value: ${totalUsd.toFixed(2)}</p>
          </div>

          <div className="bg-white border-2 border-pink-200 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-pink-500 mb-2 flex items-center gap-2">
              <span>💡</span> Christine&apos;s Smart Insights
            </h2>
            <p className="text-gray-600 text-sm mb-2">Based on your recent numbers, here is where you can boost your sales today:</p>
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-100 text-pink-800 font-medium text-sm">
            Focus on: <span className="font-bold">&quot;{lowestCategory}&quot;</span>. You haven&apos;t logged many of these lately.
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 mb-8">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Log a New Sale</h2>
          <form onSubmit={addSale} className="flex flex-col gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-2 border-pink-200 p-3 rounded-xl focus:outline-none focus:border-pink-400 text-gray-700 bg-pink-50/30"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Original Plan Cost in USD ($)"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              className="border-2 border-pink-200 p-3 rounded-xl focus:outline-none focus:border-pink-400 text-gray-700 bg-pink-50/30"
              required
            />
            <button type="submit" className="bg-pink-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-pink-600 shadow-md transition-all">
              Sparkle & Save Sale ✨
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Recent Sales</h2>
          {sales.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No sales recorded yet. Go get &apos;em, Christine!</p>
          ) : (
            <ul className="divide-y divide-pink-100">
              {sales.map((sale) => (
                <li key={sale.id} className="py-4 flex flex-col sm:flex-row justify-between gap-2 hover:bg-pink-50/50 px-2 rounded-lg transition-colors">
                  <span className="text-gray-800 font-semibold">{sale.category}</span>
                  <div className="flex flex-col sm:text-right">
                    <span className="text-gray-500 text-sm">Plan: ${sale.usd_amount.toFixed(2)}</span>
                    <span className="text-pink-600 font-bold">Com: ₱{sale.php_commission.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
