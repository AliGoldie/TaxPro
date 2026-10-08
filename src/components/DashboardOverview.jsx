import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function DashboardOverview({
  onOpenExpenseModal,
  onNavigateScanner,
  onNavigateAudit
}) {
  const {
    activeWorkspace,
    activeWorkspaceId,
    totalWarnings,
    reviewQueue
  } = useWorkspace();

  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Sample transactions representing active Malaysian business ledger
  const fnbTransactions = [
    { id: 'tx-1', date: '2026-10-06', merchant: 'Kian Seng Wholesale Sdn Bhd', category: 'Food Inventory', amount: 486.50, taxRule: 'Wholly & Exclusively Incurred', status: 'verified' },
    { id: 'tx-2', date: '2026-10-05', merchant: 'Rational Combi Oven Service', category: 'Equipment / Assets', amount: 1250.00, taxRule: 'Section 33(1) Allowable Repair', status: 'verified' },
    { id: 'tx-3', date: '2026-10-04', merchant: 'Petronas Jalan Lintas KK', category: 'Vehicle Expenses', amount: 95.00, taxRule: 'Section 39(1) Apportioned (75% Biz)', status: 'verified' },
    { id: 'tx-4', date: '2026-10-02', merchant: 'Sabah Electricity Sdn Bhd (SESB)', category: 'Utilities & Bills', amount: 840.20, taxRule: 'Standard Deduction', status: 'verified' },
    { id: 'tx-5', date: '2026-09-28', merchant: 'Kitchen Depot Inanam', category: 'Equipment / Assets', amount: 3800.00, taxRule: 'Schedule 3 Capital Allowance (20% Initial)', status: 'verified' },
  ];

  const rentalTransactions = [
    { id: 'tx-11', date: '2026-10-06', merchant: 'Mr. DIY Hardware Damai', category: 'Property Maintenance & Repairs', amount: 138.00, taxRule: 'Section 33(1) Allowable Repair', status: 'verified' },
    { id: 'tx-12', date: '2026-10-04', merchant: 'Dewan Bandaraya Kota Kinabalu (DBKK)', category: 'Assessment Tax (Cukai Pintu)', amount: 620.00, taxRule: 'Section 4(d) Permitted Outgoing', status: 'verified' },
    { id: 'tx-13', date: '2026-10-01', merchant: 'Chuan Seng Aircond Servicing', category: 'Property Maintenance & Repairs', amount: 300.00, taxRule: 'Section 33(1) Allowable Repair', status: 'verified' },
    { id: 'tx-14', date: '2026-09-25', merchant: 'Indah Water Konsortium (IWK)', category: 'Sewerage Utilities', amount: 48.00, taxRule: 'Permitted Outgoing', status: 'verified' },
  ];

  const activeTransactions = activeWorkspaceId === 'munchieskk' ? fnbTransactions : rentalTransactions;

  return (
    <div className="space-y-6">
      {/* Entity Hero Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden shadow-lg transition-all duration-300 ${
          isWarm
            ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 shadow-orange-600/20'
            : 'bg-gradient-to-r from-blue-700 via-blue-600 to-teal-700 shadow-blue-700/20'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                {activeWorkspace.category}
              </span>
              <span className="text-white/80 text-xs font-mono">
                {activeWorkspace.regNumber}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeWorkspace.name}
            </h1>

            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Active tax entity context for Malaysian Borang B filing. Real-time expense categorization, Capital Allowance tracking, and receipt verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md transform active:scale-95"
            >
              + Add Expense
            </button>
            <button
              type="button"
              onClick={onNavigateScanner}
              className="px-4 py-2.5 rounded-xl bg-black/25 hover:bg-black/35 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-md"
            >
              Open Camera Scanner
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 rounded-full bg-black/10 blur-xl pointer-events-none" />
      </div>

      {/* Financial & Tax KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            YTD Gross Revenue
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            RM {activeWorkspace.stats.ytdRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            ↑ 14.2% vs YA 2024
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Claimable Tax Deductions
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            RM {activeWorkspace.stats.ytdExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Section 33(1) Operating Expenses
          </span>
        </div>

        <div
          onClick={onNavigateScanner}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1 cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Review Queue
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                reviewQueue.length > 0 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {reviewQueue.filter(r => r.workspaceId === activeWorkspaceId).length} Receipts
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Requires manual confirmation →
          </span>
        </div>

        <div
          onClick={onNavigateAudit}
          className={`p-5 rounded-2xl border shadow-2xs space-y-1 cursor-pointer transition-all ${
            totalWarnings > 0
              ? 'bg-red-50/50 border-red-200 hover:bg-red-50'
              : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                totalWarnings > 0 ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              Pre-Flight Tax Audit
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                totalWarnings > 0 ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              {totalWarnings > 0 ? `${totalWarnings} Warnings` : 'Clean'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalWarnings > 0 ? `${totalWarnings} Flags` : '100% Ready'}
          </div>
          <span
            className={`text-[11px] font-semibold ${
              totalWarnings > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {totalWarnings > 0 ? 'Click to resolve issues before export →' : 'Ready for Tax Agent Export →'}
          </span>
        </div>
      </div>

      {/* Recent Ledger Entries Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tax Ledger & Transactions (YA 2025)
            </h3>
            <p className="text-xs text-slate-500">
              Transactions tagged with Malaysian tax rules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              + Quick Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Merchant / Payee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">LHDN Tax Treatment</th>
                <th className="py-3 px-3 text-right">Amount (RM)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {activeTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-mono text-slate-500">{tx.date}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{tx.merchant}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {tx.taxRule}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-black font-mono text-slate-900">
                    RM {tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ✓ Audited
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
