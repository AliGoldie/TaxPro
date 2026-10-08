import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function DashboardOverview({
  onOpenExpenseModal,
  onNavigateScanner,
  onNavigateAudit,
  onNavigateAssets,
  onNavigateMileage
}) {
  const {
    activeWorkspace,
    activeWorkspaceId,
    totalWarnings,
  } = useWorkspace();

  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Tier State: 'free' vs 'pro'
  const [tier, setTier] = useState('free');

  // Free Tier Expense Breakdown Categories (Doughnut Chart Data)
  const categoryData = activeWorkspaceId === 'munchieskk'
    ? [
        { name: 'Food & Raw Stock', amount: 58400, percent: 52, color: '#f97316' },
        { name: 'Kitchen Repairs (Sec 33)', amount: 14200, percent: 13, color: '#f59e0b' },
        { name: 'Vehicle & Fuel (Sec 39)', amount: 11800, percent: 10, color: '#6366f1' },
        { name: 'Staff Welfare Meals', amount: 8400, percent: 8, color: '#a855f7' },
        { name: 'Utilities (SESB/Water)', amount: 19630, percent: 17, color: '#06b6d4' },
      ]
    : [
        { name: 'Property Repairs (Sec 33)', amount: 12400, percent: 44, color: '#2563eb' },
        { name: 'Assessment Tax (Cukai Pintu)', amount: 6200, percent: 22, color: '#0d9488' },
        { name: 'Mortgage Loan Interest', amount: 7800, percent: 27, color: '#6366f1' },
        { name: 'Quit Rent (Cukai Tanah)', amount: 1200, percent: 4, color: '#f59e0b' },
        { name: 'Fire Insurance', amount: 800, percent: 3, color: '#ec4899' },
      ];

  // 12-Month Historical Bar Data for Pro Tier
  const monthlyData = [
    { month: 'Jan', inc: 18500, exp: 12400 },
    { month: 'Feb', inc: 16200, exp: 11100 },
    { month: 'Mar', inc: 19400, exp: 13800 },
    { month: 'Apr', inc: 17800, exp: 10900 },
    { month: 'May', inc: 21500, exp: 14500 },
    { month: 'Jun', inc: 20100, exp: 12800 },
    { month: 'Jul', inc: 19800, exp: 13100 },
    { month: 'Aug', inc: 22400, exp: 15200 },
    { month: 'Sep', inc: 23100, exp: 14800 },
    { month: 'Oct', inc: 21900, exp: 13900 },
    { month: 'Nov', inc: 24500, exp: 15600 },
    { month: 'Dec', inc: 28000, exp: 17200 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Tier Switcher Pill */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Account Tier:</span>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${tier === 'pro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'}`}>
            {tier === 'pro' ? '★ Pro Tier (Unlimited)' : 'Free Tier (5 Categories Limit)'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setTier(tier === 'free' ? 'pro' : 'free')}
          className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${
            tier === 'free'
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {tier === 'free' ? 'Switch to Pro Preview' : 'Switch to Free Tier'}
        </button>
      </div>

      {/* Entity Hero Banner */}
      <div
        className={`p-6 sm:p-7 rounded-3xl text-white relative overflow-hidden shadow-lg transition-all ${
          isWarm
            ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 shadow-orange-600/20'
            : 'bg-gradient-to-r from-blue-700 via-blue-600 to-teal-700 shadow-blue-700/20'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md">
                {isWarm ? 'Section 4(a) Business' : 'Section 4(d) Rental Income'}
              </span>
              <span className="text-white/80 text-[11px] font-mono">{activeWorkspace.regNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeWorkspace.name}</h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Single owner-operator tax tracking for Malaysian Borang B (LHDN Income Tax Act 1967).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-md"
            >
              + Log Expense
            </button>
            <button
              type="button"
              onClick={onNavigateScanner}
              className="px-4 py-2.5 rounded-xl bg-black/25 hover:bg-black/35 text-white font-bold text-xs border border-white/20"
            >
              Scan Receipt
            </button>
            <button
              type="button"
              onClick={onNavigateMileage}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20"
            >
              Mileage Log
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">YTD Revenue</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            RM {activeWorkspace.stats.ytdRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 14.2% YoY</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Operating Expenses</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            RM {activeWorkspace.stats.ytdExpenses.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Sec 33(1) Claimable</span>
        </div>

        <div
          onClick={onNavigateAssets}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1 cursor-pointer hover:border-slate-300"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Capital Allowances</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-600">RM 18,240</div>
          <span className="text-[10px] text-slate-500 font-medium">Schedule 3 IA+AA →</span>
        </div>

        <div
          onClick={onNavigateAudit}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1 cursor-pointer hover:border-slate-300"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Borang B Status</span>
          <div className={`text-xl sm:text-2xl font-black font-mono ${totalWarnings > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {totalWarnings > 0 ? `${totalWarnings} Flags` : '100% Ready'}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Pre-Flight Audit →</span>
        </div>
      </div>

      {/* TIERED CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* FREE TIER: Doughnut Chart of Current Month Expenses */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expense Allocation</h3>
              <p className="text-[11px] text-slate-500">Current month statutory categories (Free Tier)</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              5 Categories Max
            </span>
          </div>

          {/* SVG Doughnut Chart */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                {/* SVG circular segments */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke={categoryData[0].color} strokeWidth="16" strokeDasharray="124 238" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke={categoryData[1].color} strokeWidth="16" strokeDasharray="31 238" strokeDashoffset="-124" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke={categoryData[2].color} strokeWidth="16" strokeDasharray="24 238" strokeDashoffset="-155" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke={categoryData[3].color} strokeWidth="16" strokeDasharray="19 238" strokeDashoffset="-179" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke={categoryData[4].color} strokeWidth="16" strokeDasharray="40 238" strokeDashoffset="-198" />
              </svg>
              <div className="absolute text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">October</span>
                <span className="text-sm font-black font-mono text-slate-900">
                  RM {(categoryData.reduce((acc, c) => acc + c.amount, 0) / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-1">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 font-medium truncate max-w-[160px]">{cat.name}</span>
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  RM {cat.amount.toLocaleString()} <span className="text-slate-400 text-[10px]">({cat.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRO TIER: 12-Month Historical Bar Chart (Blurred for Free Tier) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">12-Month Income vs. Expense Trend</h3>
              <p className="text-[11px] text-slate-500">Historical trend for Borang B tax installment planning (CP500)</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
              {tier === 'pro' ? 'Pro Unlocked' : 'Pro Feature'}
            </span>
          </div>

          {/* 12-Month Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1">
            {monthlyData.map((m, idx) => {
              const incHeight = (m.inc / 30000) * 100;
              const expHeight = (m.exp / 30000) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-0.5 h-44">
                    {/* Revenue Bar */}
                    <div
                      className="w-1/2 rounded-t-md transition-all bg-emerald-500"
                      style={{ height: `${incHeight}%` }}
                      title={`Revenue: RM ${m.inc}`}
                    />
                    {/* Expense Bar */}
                    <div
                      className={`w-1/2 rounded-t-md transition-all ${isWarm ? 'bg-orange-500' : 'bg-blue-600'}`}
                      style={{ height: `${expHeight}%` }}
                      title={`Expense: RM ${m.exp}`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex justify-center gap-6 text-[11px] pt-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Gross Revenue</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className={`w-2.5 h-2.5 rounded-sm ${isWarm ? 'bg-orange-500' : 'bg-blue-600'}`} />
              <span>Allowable Expenses</span>
            </div>
          </div>

          {/* PRO TIER BACKDROP BLUR OVERLAY (When on Free Tier) */}
          {tier === 'free' && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg font-bold text-lg">
                ★
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white drop-shadow-md">
                  Unlock 12-Month Tax Modeling & Unlimited Categories
                </h4>
                <p className="text-xs text-white/90 max-w-sm mt-0.5 drop-shadow">
                  Analyze quarterly CP500 tax installments and multi-year Capital Allowance carrying values with Pro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTier('pro')}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-xl hover:bg-slate-100 transition-transform active:scale-95"
              >
                Upgrade to Pro (Demo Unlock)
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
