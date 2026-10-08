import React, { useState } from 'react';
import JSZip from 'jszip';
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
   * Structured Audit Package Compiler
   * Uses JSZip to generate actual zip containing:
   * 1. Borang_B_Tax_Computation_YA2025.txt (Formatted Malaysian tax computation)
   * 2. Categorized_General_Ledger.csv
   * 3. Capital_Allowances_Schedule_CP204.csv
   * 4. Receipts/ directory organized by month and category
   */
  const handleExport = async () => {
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
      title: 'Compiling Borang B Audit Package',
      message: 'Building P&L, Section 4a vs 4d ring-fenced schedule, and receipts folder...',
      type: 'info',
    });

    try {
      const zip = new JSZip();

      // 1. Borang B Tax Computation Summary
      const taxComputationContent = `================================================================================
TAXPRO MALAYSIA — BORANG B TAX AGENT AUDIT PACKAGE (YA 2025/2026)
LHDN INLAND REVENUE BOARD OF MALAYSIA COMPLIANT AUDIT TRAIL
================================================================================

TAXPAYER DETAILS:
Entity Name        : ${activeWorkspace.name}
Registration No    : ${activeWorkspace.regNumber}
Tax File (TIN)     : ${activeWorkspace.tinNumber}
Tax Regime         : ${activeWorkspace.regime}
Year of Assessment : YA 2025
Audited Readiness  : 100% (Zero unverified entries)

--------------------------------------------------------------------------------
PART 1: STATEMENT OF PROFIT OR LOSS & ADJUSTED INCOME
--------------------------------------------------------------------------------
Gross Revenue / Turnover (Code 101)          : RM ${activeWorkspace.stats.ytdRevenue.toFixed(2)}
Less: Allowable Operational Costs (Sec 33)   : RM ${(activeWorkspace.stats.ytdExpenses * 0.75).toFixed(2)}
Less: Repairs & Maintenance (Sec 33(1))      : RM ${(activeWorkspace.stats.ytdExpenses * 0.15).toFixed(2)}
Less: Apportioned Motor / Telco (Sec 39(1))   : RM ${(activeWorkspace.stats.ytdExpenses * 0.10).toFixed(2)}
--------------------------------------------------------------------------------
Preliminary Net Operating Profit             : RM ${(activeWorkspace.stats.ytdRevenue - activeWorkspace.stats.ytdExpenses).toFixed(2)}

STATUTORY ADD-BACKS (Non-Deductible Private Portions):
Add: Private Vehicle Use Apportionment       : RM 2,400.00
Add: Client Entertainment 50% Disallowed      : RM 1,850.00
--------------------------------------------------------------------------------
Adjusted Business Income                     : RM ${(activeWorkspace.stats.ytdRevenue - activeWorkspace.stats.ytdExpenses + 4250).toFixed(2)}

LESS: CAPITAL ALLOWANCES (SCHEDULE 3):
Initial Allowance (IA @ 20%)                 : RM 11,060.00
Annual Allowance (AA @ 14% - 40%)            : RM  7,180.00
Total Capital Allowances Claimed             : RM 18,240.00
--------------------------------------------------------------------------------
STATUTORY CHARGEABLE INCOME (BORANG B)       : RM ${(activeWorkspace.stats.ytdRevenue - activeWorkspace.stats.ytdExpenses + 4250 - 18240).toFixed(2)}
================================================================================

SECTION 4(a) vs SECTION 4(d) RING-FENCING NOTE:
Any rental income losses under Section 4(d) cannot be set off against business
income under Section 4(a) pursuant to DGIR Public Ruling No. 12/2018.

PREPARED VIA TAXPRO MALAYSIA
Generated on: ${new Date().toISOString()}
`;
      zip.file(`Borang_B_Tax_Computation_YA2025_${activeWorkspace.shortName}.txt`, taxComputationContent);

      // 2. Clean Transactions CSV Ledger
      const csvHeader = 'Transaction_ID,Date,Merchant,Category,Amount_MYR,Claimable_MYR,Private_AddBack_MYR,Tax_Rule,Receipt_Status\n';
      const sampleCsvRows = [
        'TX-1001,2026-10-06,Kian Seng Wholesale Sdn Bhd,Food Inventory,486.50,486.50,0.00,Sec 33(1) Wholly & Exclusively,Verified',
        'TX-1002,2026-10-05,Rational Oven Service KK,Repairs & Maintenance,1250.00,1250.00,0.00,Sec 33(1) Revenue Repair,Verified',
        'TX-1003,2026-10-04,Petronas Jalan Lintas,Vehicle Expense,95.00,76.00,19.00,Sec 39(1) Apportioned 80% Biz,Verified',
        'TX-1004,2026-10-02,Sabah Electricity SESB,Utilities & Bills,840.20,840.20,0.00,Direct Expense,Verified',
        'TX-1005,2026-09-28,Kitchen Depot Inanam,Capital Asset,3800.00,1292.00,0.00,Schedule 3 IA 20% + AA 14%,Verified',
      ].join('\n');
      zip.file('Categorized_General_Ledger_YA2025.csv', csvHeader + sampleCsvRows);

      // 3. Capital Allowance Schedule CSV
      const caCsv = `Asset_ID,Description,Acquisition_Date,Qualifying_Cost_MYR,Initial_Allowance_MYR,Annual_Allowance_MYR,Total_CA_Claim_MYR,Closing_TWDV_MYR\n` +
        `CA-01,Rational iCombi Pro 10-Grid,2025-03-15,38500.00,7700.00,5390.00,13090.00,25410.00\n` +
        `CA-02,Stainless Exhaust Hood,2025-06-20,16800.00,3360.00,2352.00,5712.00,11088.00\n` +
        `CA-03,iPad POS & Printers,2025-08-10,5400.00,1080.00,2160.00,3240.00,2160.00\n`;
      zip.file('Capital_Allowances_CP204_Schedule.csv', caCsv);

      // 4. Receipts Directory organized by month and category
      const receiptsFolder = zip.folder('Receipts');
      const octFolder = receiptsFolder.folder('2026-10');
      const foodFolder = octFolder.folder('Food_Inventory');
      foodFolder.file('2026-10-06_KianSeng_FoodInventory_RM486.50.txt', 'Verified LHDN Receipt Image Meta: SST Reg W10-1808-32000041, Total RM 486.50');

      const vehicleFolder = octFolder.folder('Vehicle_Expenses');
      vehicleFolder.file('2026-10-04_Petronas_Vehicle_RM95.00.txt', 'Verified MyInvois e-Invoice Receipt: Petronas Jalan Lintas, RM 95.00');

      // Generate actual zip blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Trigger client-side download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Borang_B_Tax_Package_${activeWorkspace.shortName}_YA2025.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setIsExporting(false);
      setExportComplete(true);

      addToast({
        title: 'Borang B Package Generated',
        message: 'Saved .zip archive complete with Tax Computation, Ledger CSV, and Receipts directory.',
        type: 'success',
      });
    } catch (err) {
      console.error('Zip generation failed:', err);
      setIsExporting(false);
      addToast({
        title: 'Export Error',
        message: 'Failed to package files. Please try again.',
        type: 'warning',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
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

      {/* STATUS PANEL */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Ledger Scan Status</span>
              <span>•</span>
              <span className="text-slate-700">{activeWorkspace.regime}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Assessment Year (YA) 2025 Ledger Integrity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated rules verification against Malaysian Income Tax Act 1967 (Sec 33, Sec 39, Schedule 3).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
              <span className={`text-base font-black font-mono ${totalWarnings > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {totalWarnings}
              </span>
            </div>
          </div>
        </div>

        {/* WARNING ALERTS */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tax Agent Pre-Flight Checklist
            </h4>
            <span className="text-xs text-slate-400">
              {totalWarnings === 0 ? 'All checklist rules passed' : `${totalWarnings} issues must be resolved`}
            </span>
          </div>

          {/* WARNING 1: Missing Receipts */}
          {missingReceipts > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-red-800">
                  {missingReceipts} Missing Receipt Images
                </h5>
                <p className="text-[11px] text-red-600 mt-0.5">
                  LHDN Section 82 mandates retaining physical or digital receipt proof for 7 years.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resolveAuditIssue('missingReceipts', 1);
                  if (onNavigateScanner) onNavigateScanner();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold self-end sm:self-center"
              >
                Attach Proof ({missingReceipts} left)
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-semibold">
              ✓ All ledger transactions have verified receipt images attached (Section 82 compliant).
            </div>
          )}

          {/* WARNING 2: Uncategorized Transactions */}
          {uncategorizedTransactions > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-red-800">
                  {uncategorizedTransactions} Uncategorized Transactions
                </h5>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Unassigned expenses cannot be mapped to Borang B expense codes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resolveAuditIssue('uncategorizedTransactions', 1);
                  if (onOpenExpenseModal) onOpenExpenseModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold self-end sm:self-center"
              >
                Categorize Item ({uncategorizedTransactions} left)
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-semibold">
              ✓ All ledger entries are properly assigned to Borang B tax deductible accounts.
            </div>
          )}

          {/* WARNING 3: Vehicle Missing Private % */}
          {vehicleMissingPrivate > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-red-800">
                  {vehicleMissingPrivate} Vehicle Expenses missing Private Use %
                </h5>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Malaysian tax auditors flag 100% vehicle fuel claims as audit risk. Apportion private use.
                </p>
              </div>
              <button
                type="button"
                onClick={() => resolveAuditIssue('vehicleMissingPrivatePct', 1)}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold self-end sm:self-center"
              >
                Set Apportionment ({vehicleMissingPrivate} left)
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-semibold">
              ✓ All motor vehicle and telephone expenses have statutory private use apportionment declared.
            </div>
          )}
        </div>

        {/* QUICK RESOLVE SIMULATOR */}
        {!isAuditClean && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Want to test the export state immediately?</span>
            <button
              type="button"
              onClick={() => {
                resolveAuditIssue('missingReceipts', 99);
                resolveAuditIssue('uncategorizedTransactions', 99);
                resolveAuditIssue('vehicleMissingPrivatePct', 99);
                addToast({
                  title: 'All Audit Warnings Cleared',
                  message: 'Ledger is 100% compliant. Export button unlocked!',
                  type: 'success',
                });
              }}
              className="font-bold text-slate-800 underline"
            >
              Simulate Auto-Resolving All Warnings
            </button>
          </div>
        )}

        {/* PRIMARY EXPORT BUTTON BAR */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {isAuditClean ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Audit Passed: Ready to generate Malaysian Borang B Zip Archive.
              </span>
            ) : (
              <span className="text-slate-400">
                Export locked: Resolve {totalWarnings} flagged warning{totalWarnings > 1 ? 's' : ''} to enable export.
              </span>
            )}
          </div>

          <button
            id="export-tax-agent-button"
            type="button"
            disabled={!isAuditClean || isExporting}
            onClick={handleExport}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              !isAuditClean
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : isWarm
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Compiling .zip Archive...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export for Tax Agent (.zip)</span>
              </>
            )}
          </button>
        </div>

        {exportComplete && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
            <div>
              <span className="font-bold block">Borang B Tax Package Downloaded</span>
              <span className="text-emerald-700 text-[11px]">Includes P&L computation, Ledger CSV, CP204 CA schedule, and organized Receipts/ folder.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
