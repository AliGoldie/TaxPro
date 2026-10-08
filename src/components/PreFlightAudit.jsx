import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function PreFlightAudit({ onOpenExpenseModal, onNavigateScanner }) {
  const {
    activeWorkspace,
    currentIssues,
    resolveAuditIssue,
    totalWarnings,
    addToast
  } = useWorkspace();

  const isWarm = activeWorkspace.theme.palette === 'warm';

  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Warning counts
  const missingReceipts = currentIssues.missingReceipts;
  const uncategorizedTransactions = currentIssues.uncategorizedTransactions;
  const vehicleMissingPrivate = currentIssues.vehicleMissingPrivatePct;

  const isAuditClean = totalWarnings === 0;

  /**
   * Placeholder function for backend Tax Agent export bundle packaging
   */
  const handleExport = () => {
    if (!isAuditClean) {
      addToast({
        title: 'Export Blocked by Audit Engine',
        message: 'All red flags must be resolved to ensure LHDN Section 82 compliance.',
        type: 'warning',
      });
      return;
    }

    setIsExporting(true);
    addToast({
      title: 'Packaging Borang B Audit Bundle',
      message: 'Compiling General Ledger, Capital Allowance Schedules, and Receipt Archives into .zip...',
      type: 'info',
    });

    // Simulate server side zip generation
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      // Trigger dummy download trigger
      const dummyContent = `TAXPRO MALAYSIA - BORANG B TAX AGENT AUDIT PACKAGE\n\nEntity: ${activeWorkspace.name}\nRegistration: ${activeWorkspace.regNumber}\nTIN: ${activeWorkspace.tinNumber}\nAssessment Year: YA 2025/2026\nAudit Status: VERIFIED & COMPLIANT\n\nIncluded Files:\n1. Borang_B_Income_Tax_Schedule.pdf\n2. Capital_Allowances_CP204_Schedule.xlsx\n3. Categorized_General_Ledger.csv\n4. Verified_Receipt_Images_Archive.zip\n`;
      const blob = new Blob([dummyContent], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Borang_B_Tax_Package_${activeWorkspace.shortName}_YA2025.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        title: 'Export Downloaded!',
        message: `Borang B Tax Agent .zip ready for tax accountant filing.`,
        type: 'success',
      });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pre-Flight Tax Audit (Borang B)
            </h2>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isAuditClean
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isAuditClean ? 'Ready to Export' : `${totalWarnings} Action Items`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            LHDN Malaysia compliance scan for {activeWorkspace.name} (YA 2025). Resolves risks before tax agent handoff.
          </p>
        </div>

        {/* Audit Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              isAuditClean
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAuditClean ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>Audit Health: {isAuditClean ? '100% Ready' : `${Math.round(((13 - totalWarnings) / 13) * 100)}% Verified`}</span>
          </div>
        </div>
      </div>

      {/* STATUS PANEL: Scans the Year's Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Ledger Scan Status</span>
              <span>•</span>
              <span className="text-slate-700">{activeWorkspace.regime}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Assessment Year (YA) 2025 Ledger Integrity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated rules verification against Malaysian Income Tax Act 1967 (Sec 33, Sec 39, Schedule 3).
            </p>
          </div>

          {/* Quick Ledger Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Rows</span>
              <span className="text-base font-black text-slate-900 font-mono">248</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Claimable RM</span>
              <span className="text-base font-black text-emerald-600 font-mono">RM 112.4k</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Capital Allow.</span>
              <span className="text-base font-black text-amber-600 font-mono">RM 18.2k</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Flags</span>
              <span
                className={`text-base font-black font-mono ${
                  totalWarnings > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {totalWarnings}
              </span>
            </div>
          </div>
        </div>

        {/* AUDIT WARNING ALERTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tax Agent Pre-Flight Checklist
            </h4>
            <span className="text-xs text-slate-400">
              {totalWarnings === 0 ? 'All checklist rules passed' : `${totalWarnings} issues must be resolved`}
            </span>
          </div>

          {/* WARNING 1: X Missing Receipt Images */}
          {missingReceipts > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-red-800">
                    {missingReceipts} Missing Receipt Images
                  </h5>
                  <p className="text-xs text-red-600 mt-0.5">
                    LHDN Section 82 mandates retaining physical or digital receipt proof for 7 years. Transactions without images will be disallowed upon Inland Revenue audit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    resolveAuditIssue('missingReceipts', 1);
                    if (onNavigateScanner) onNavigateScanner();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  Quick Attach Proof ({missingReceipts} left)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs font-semibold">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
              <span>All ledger transactions have verified receipt images attached (Section 82 compliant).</span>
            </div>
          )}

          {/* WARNING 2: Y Uncategorized Transactions */}
          {uncategorizedTransactions > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-red-800">
                    {uncategorizedTransactions} Uncategorized Transactions
                  </h5>
                  <p className="text-xs text-red-600 mt-0.5">
                    Unassigned expenses cannot be mapped to Borang B expense codes (e.g., Code 111 - Direct Costs, Code 118 - Utilities).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    resolveAuditIssue('uncategorizedTransactions', 1);
                    if (onOpenExpenseModal) onOpenExpenseModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  Categorize Item ({uncategorizedTransactions} left)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs font-semibold">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
              <span>All ledger entries are properly assigned to Borang B tax deductible accounts.</span>
            </div>
          )}

          {/* WARNING 3: Z Vehicle Expenses missing Private Use % */}
          {vehicleMissingPrivate > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-red-800">
                    {vehicleMissingPrivate} Vehicle Expenses missing Private Use %
                  </h5>
                  <p className="text-xs text-red-600 mt-0.5">
                    Malaysian tax auditors flag 100% vehicle fuel/maintenance claims as high-audit risk. Set personal usage apportionment percentage.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => resolveAuditIssue('vehicleMissingPrivatePct', 1)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  Set Apportionment ({vehicleMissingPrivate} left)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs font-semibold">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
              <span>All motor vehicle and telephone expenses have statutory private use apportionment declared.</span>
            </div>
          )}
        </div>

        {/* RESOLVE ALL SIMULATOR (for effortless user testing) */}
        {!isAuditClean && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Want to test the export state immediately?
            </span>
            <button
              type="button"
              onClick={() => {
                resolveAuditIssue('missingReceipts', 99);
                resolveAuditIssue('uncategorizedTransactions', 99);
                resolveAuditIssue('vehicleMissingPrivatePct', 99);
                addToast({
                  title: 'All Audit Warnings Cleared',
                  message: 'Ledger is 100% compliant. Export button is now unlocked!',
                  type: 'success',
                });
              }}
              className="font-bold text-slate-800 hover:text-slate-900 underline"
            >
              Simulate Auto-Resolving All Warnings
            </button>
          </div>
        )}

        {/* PRIMARY EXPORT BUTTON BAR */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {isAuditClean ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Audit Passed: Ready to generate Malaysian Borang B Zip Archive.
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Export locked: Resolve {totalWarnings} flagged warning{totalWarnings > 1 ? 's' : ''} to enable export.
              </span>
            )}
          </div>

          {/* PRIMARY "Export for Tax Agent" BUTTON */}
          <button
            id="export-tax-agent-button"
            type="button"
            disabled={!isAuditClean || isExporting}
            onClick={handleExport}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md ${
              !isAuditClean
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                : isWarm
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30 transform active:scale-98'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 transform active:scale-98'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating .zip Archive...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export for Tax Agent (.zip)</span>
              </>
            )}
          </button>
        </div>

        {/* Post-Export Success Alert */}
        {exportComplete && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
            <div className="flex-1">
              <h5 className="text-sm font-bold">Package Successfully Created & Downloaded</h5>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Your zip archive includes the Borang B profit & loss reconciliation, Capital Allowance Schedule (Schedule 3), and verified receipt attachments formatted for Malaysian tax agents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
