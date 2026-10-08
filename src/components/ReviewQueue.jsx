import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Intelligent Keyword Detection Engine for Malaysian Tax Receipts
 */
export function detectTaxCategoryFromMerchant(merchantName = '') {
  const m = merchantName.toLowerCase();

  if (m.includes('petronas') || m.includes('shell') || m.includes('petron') || m.includes('bhp') || m.includes('tyre') || m.includes('workshop')) {
    return {
      category: 'Vehicle Expense',
      needsPrompt: 'vehicle',
      taxRule: 'Section 39(1) Apportionment',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    };
  }

  if (m.includes('restoran') || m.includes('cafe') || m.includes('coffee') || m.includes('starbucks') || m.includes('kfc') || m.includes('mcdonald')) {
    return {
      category: 'Entertainment',
      needsPrompt: 'entertainment',
      taxRule: 'Sec 39(1)(l) 50% vs 100% Welfare',
      badgeColor: 'bg-purple-100 text-purple-800'
    };
  }

  if (m.includes('mr diy') || m.includes('hardware') || m.includes('nippon') || m.includes('plumbing') || m.includes('chuan seng') || m.includes('equipment')) {
    return {
      category: 'Repairs & Maintenance',
      needsPrompt: 'repairs_vs_asset',
      taxRule: 'Sec 33(1) vs Schedule 3 Asset',
      badgeColor: 'bg-amber-100 text-amber-800'
    };
  }

  if (m.includes('majlis perbandaran') || m.includes('dbkk') || m.includes('cukai pintu') || m.includes('cukai tanah') || m.includes('sesb') || m.includes('water') || m.includes('air')) {
    return {
      category: 'Property Taxes / Utilities',
      needsPrompt: 'rental_outgoing',
      taxRule: 'Section 4(d) Permitted Outgoing',
      badgeColor: 'bg-teal-100 text-teal-800'
    };
  }

  return {
    category: 'General Supplies',
    needsPrompt: null,
    taxRule: 'Section 33(1) Allowable Expense',
    badgeColor: 'bg-slate-100 text-slate-800'
  };
}

export default function ReviewQueue({ onOpenExpenseWithPrefill }) {
  const {
    activeWorkspace,
    activeWorkspaceId,
    reviewQueue,
    removeFromReviewQueue,
    addToast
  } = useWorkspace();

  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Modal / Inline disclosure states for active review item
  const [activeItem, setActiveItem] = useState(null);
  const [entertainmentType, setEntertainmentType] = useState('welfare'); // 'welfare' (100%) vs 'client' (50%)
  const [equipmentType, setEquipmentType] = useState('repair'); // 'repair' (expense) vs 'capital_asset' (CA)
  const [selectedVehicle, setSelectedVehicle] = useState('Isuzu D-Max RT50');
  const [vehicleBusinessPct, setVehicleBusinessPct] = useState(80);
  const [rentalCostType, setRentalCostType] = useState('cukai_pintu'); // 'cukai_pintu', 'cukai_tanah', 'mortgage_interest'

  const entityQueue = reviewQueue.filter((item) => item.workspaceId === activeWorkspaceId);

  // Trigger Review Confirmation Modal
  const handleStartReview = (item) => {
    const detected = detectTaxCategoryFromMerchant(item.merchant);
    setActiveItem({ ...item, detected });
  };

  // Finalize Confirmation
  const handleConfirmReview = () => {
    if (!activeItem) return;

    let finalTaxRule = activeItem.detected.taxRule;
    let finalAmount = activeItem.amount;
    let deductiblePortion = activeItem.amount;

    if (activeItem.detected.needsPrompt === 'entertainment') {
      if (entertainmentType === 'client') {
        deductiblePortion = finalAmount * 0.5;
        finalTaxRule = 'Section 39(1)(l) 50% Client Entertainment (RM ' + deductiblePortion.toFixed(2) + ' deductible)';
      } else {
        finalTaxRule = 'Staff Welfare (100% Tax Deductible)';
      }
    } else if (activeItem.detected.needsPrompt === 'vehicle') {
      deductiblePortion = (finalAmount * (vehicleBusinessPct / 100));
      finalTaxRule = `Vehicle: ${selectedVehicle} (${vehicleBusinessPct}% Business = RM ${deductiblePortion.toFixed(2)})`;
    } else if (activeItem.detected.needsPrompt === 'repairs_vs_asset') {
      if (equipmentType === 'capital_asset') {
        finalTaxRule = 'Schedule 3 Capital Allowance (Initial 20% + Annual 14%)';
      } else {
        finalTaxRule = 'Section 33(1) Revenue Repair & Maintenance (100% Deductible)';
      }
    } else if (activeItem.detected.needsPrompt === 'rental_outgoing') {
      finalTaxRule = `Section 4(d) Permitted Outgoing (${rentalCostType.replace('_', ' ').toUpperCase()})`;
    }

    removeFromReviewQueue(activeItem.id);

    addToast({
      title: 'Tax Ledger Entry Confirmed',
      message: `Posted RM ${finalAmount.toFixed(2)} under ${activeItem.detected.category} (${finalTaxRule}).`,
      type: 'success',
      duration: 4500
    });

    setActiveItem(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Smart OCR Categorization & Review Queue
          </h2>
          <p className="text-xs text-slate-500">
            Keyword auto-tagging with Malaysian LHDN progressive tax disclosure prompts.
          </p>
        </div>
        <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${isWarm ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
          {entityQueue.length} Pending Confirmation
        </span>
      </div>

      {entityQueue.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
            ✓
          </div>
          <h3 className="text-base font-bold text-slate-800">Queue is Clear!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All captured receipts have completed progressive tax disclosure and are posted to Borang B ledger.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entityQueue.map((item) => {
            const detected = detectTaxCategoryFromMerchant(item.merchant);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 relative">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] px-1 font-mono">
                      {item.isMyInvoisVerified ? 'MyInvois' : `OCR ${item.confidence}%`}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.merchant}</h4>
                      <span className="text-xs font-black font-mono text-slate-900">
                        RM {item.amount.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">{item.date} • {item.bucket || 'Storage'}</p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${detected.badgeColor}`}>
                        Auto: {detected.category}
                      </span>
                      {item.isMyInvoisVerified && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          e-Invoice Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartReview(item)}
                    className={`flex-1 py-2 px-3 rounded-xl text-white font-bold text-xs shadow-xs ${
                      isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Confirm Tax Classification
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenExpenseWithPrefill(item)}
                    className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LHDN PROGRESSIVE DISCLOSURE CONFIRMATION MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActiveItem(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative rounded-3xl bg-white w-full max-w-lg border border-slate-200 shadow-2xl p-6 space-y-5 text-left" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Review & Post to Ledger</span>
                  <h3 className="text-base font-extrabold text-slate-900">{activeItem.merchant}</h3>
                  <span className="text-sm font-black font-mono text-emerald-600">RM {activeItem.amount.toFixed(2)}</span>
                </div>
                <button type="button" onClick={() => setActiveItem(null)} className="text-slate-400 p-1">✕</button>
              </div>

              {/* 1. ENTERTAINMENT PROGRESSIVE DISCLOSURE */}
              {activeItem.detected.needsPrompt === 'entertainment' && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                  <span className="text-xs font-bold text-purple-900 block">
                    LHDN Entertainment Rule (Section 39(1)(l))
                  </span>
                  <p className="text-[11px] text-purple-800">
                    Client entertainment is restricted to 50% deduction. Staff welfare meals are 100% allowable.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <label className={`p-3 rounded-xl border cursor-pointer ${entertainmentType === 'welfare' ? 'bg-white border-purple-500 ring-2 ring-purple-500/20' : 'bg-white/60'}`}>
                      <input type="radio" name="ent_type" checked={entertainmentType === 'welfare'} onChange={() => setEntertainmentType('welfare')} className="mr-2" />
                      <span className="text-xs font-bold text-slate-900 block">Staff Welfare</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">100% Deductible</span>
                    </label>

                    <label className={`p-3 rounded-xl border cursor-pointer ${entertainmentType === 'client' ? 'bg-white border-purple-500 ring-2 ring-purple-500/20' : 'bg-white/60'}`}>
                      <input type="radio" name="ent_type" checked={entertainmentType === 'client'} onChange={() => setEntertainmentType('client')} className="mr-2" />
                      <span className="text-xs font-bold text-slate-900 block">Client / Business</span>
                      <span className="text-[10px] text-amber-700 font-bold block">50% Restricted</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 2. REPAIRS VS CAPITAL ASSET PROGRESSIVE DISCLOSURE */}
              {activeItem.detected.needsPrompt === 'repairs_vs_asset' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <span className="text-xs font-bold text-amber-900 block">
                    Repairs vs Capital Asset (Schedule 3)
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Did you purchase brand new machinery, or perform routine maintenance on existing equipment?
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <label className={`p-3 rounded-xl border cursor-pointer ${equipmentType === 'repair' ? 'bg-white border-amber-500 ring-2 ring-amber-500/20' : 'bg-white/60'}`}>
                      <input type="radio" name="eq_rev" checked={equipmentType === 'repair'} onChange={() => setEquipmentType('repair')} className="mr-2" />
                      <span className="text-xs font-bold text-slate-900 block">Routine Repair</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">100% OpEx (Sec 33)</span>
                    </label>

                    <label className={`p-3 rounded-xl border cursor-pointer ${equipmentType === 'capital_asset' ? 'bg-white border-amber-500 ring-2 ring-amber-500/20' : 'bg-white/60'}`}>
                      <input type="radio" name="eq_rev" checked={equipmentType === 'capital_asset'} onChange={() => setEquipmentType('capital_asset')} className="mr-2" />
                      <span className="text-xs font-bold text-slate-900 block">New Asset</span>
                      <span className="text-[10px] text-amber-700 font-bold block">Capital Allowance (CA)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 3. VEHICLE APPORTIONMENT PROGRESSIVE DISCLOSURE */}
              {activeItem.detected.needsPrompt === 'vehicle' && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                  <span className="text-xs font-bold text-indigo-900 block">
                    Vehicle Apportionment & Asset Mapping
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-950 block mb-1">Assign to Registered Vehicle:</label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full text-xs rounded-xl border border-indigo-200 bg-white p-2 font-bold text-slate-800"
                    >
                      <option value="Isuzu D-Max RT50">Isuzu D-Max RT50 (Commercial 4x4 - Sabah)</option>
                      <option value="Perodua Ativa">Perodua Ativa (City Runabout)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-indigo-950 mb-1">
                      <span>Business Use Percentage</span>
                      <span>{vehicleBusinessPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={vehicleBusinessPct}
                      onChange={(e) => setVehicleBusinessPct(Number(e.target.value))}
                      className="w-full h-2 bg-indigo-200 rounded-lg accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-indigo-600 font-mono mt-1">
                      <span>Deductible: RM {(activeItem.amount * (vehicleBusinessPct / 100)).toFixed(2)}</span>
                      <span>Private Add-back: RM {(activeItem.amount * ((100 - vehicleBusinessPct) / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. RENTAL SECTION 4(D) OUTGOINGS */}
              {activeItem.detected.needsPrompt === 'rental_outgoing' && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                  <span className="text-xs font-bold text-teal-900 block">
                    Section 4(d) Rental Permitted Outgoings
                  </span>
                  <p className="text-[11px] text-teal-800">
                    Statutory outgoings are strictly ring-fenced to rental income. Select expenditure type:
                  </p>

                  <select
                    value={rentalCostType}
                    onChange={(e) => setRentalCostType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-teal-200 bg-white p-2.5 font-bold text-slate-800"
                  >
                    <option value="cukai_pintu">Assessment Tax (Cukai Pintu - DBKK / Majlis)</option>
                    <option value="cukai_tanah">Quit Rent (Cukai Tanah)</option>
                    <option value="mortgage_interest">Mortgage Loan Interest (Excluding Principal)</option>
                    <option value="fire_insurance">Fire / Property Insurance</option>
                  </select>
                </div>
              )}

              {/* Confirm Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md ${
                    isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Post to Borang B Ledger
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
