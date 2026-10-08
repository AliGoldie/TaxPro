import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ExpenseEntryModal({
  isOpen,
  onClose,
  initialData = null,
  onSaveExpense
}) {
  const { activeWorkspace, activeWorkspaceId, addToast, resolveAuditIssue } = useWorkspace();
  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Base Input Fields: Amount, Merchant, Date
  const [amount, setAmount] = useState(() => (initialData?.amount ? initialData.amount.toString() : ''));
  const [merchant, setMerchant] = useState(() => initialData?.merchant || '');
  const [date, setDate] = useState(() => initialData?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(() => initialData?.notes || '');

  // Primary Category Selection
  const [category, setCategory] = useState(() => {
    if (!initialData?.category) return 'Supplies';
    const cat = initialData.category.toLowerCase();
    if (cat.includes('equipment') || cat.includes('asset')) return 'Equipment / Assets';
    if (cat.includes('vehicle')) return 'Vehicle';
    if (cat.includes('phone') || cat.includes('internet')) return 'Phone / Internet';
    return 'Supplies';
  });

  // Progressive Disclosure: Equipment / Assets secondary options
  const [equipmentType, setEquipmentType] = useState('new_purchase');
  const [assetSubtype, setAssetSubtype] = useState('kitchen_office');

  // Progressive Disclosure: Private Use Percentage (0 - 100%)
  const [privateUsePct, setPrivateUsePct] = useState(20);

  if (!isOpen) return null;

  // Numerical calculations for private use split
  const parsedAmount = parseFloat(amount) || 0;
  const isPrivateUseCategory = category === 'Vehicle' || category === 'Phone / Internet';
  const privateAmount = (parsedAmount * (privateUsePct / 100));
  const businessClaimableAmount = parsedAmount - privateAmount;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    if (!merchant.trim()) {
      alert('Please enter a merchant or vendor name.');
      return;
    }

    // Structure tax-compliant record
    const expenseRecord = {
      id: `exp-${Date.now()}`,
      amount: parsedAmount,
      merchant: merchant.trim(),
      date,
      category,
      notes,
      workspaceId: activeWorkspaceId,
      // Tax classification attributes
      isCapitalAllowance: category === 'Equipment / Assets' && equipmentType === 'new_purchase',
      isAllowableDeduction: category !== 'Equipment / Assets' || equipmentType === 'repair',
      assetSubtype: category === 'Equipment / Assets' ? assetSubtype : null,
      privateUsePct: isPrivateUseCategory ? privateUsePct : 0,
      businessClaimableAmount: isPrivateUseCategory ? businessClaimableAmount : parsedAmount,
      privatePortionAmount: isPrivateUseCategory ? privateAmount : 0,
      taxRuleApplied:
        category === 'Equipment / Assets'
          ? equipmentType === 'new_purchase'
            ? 'Schedule 3 Capital Allowance'
            : 'Section 33(1) Allowable Revenue Repair'
          : isPrivateUseCategory
          ? `Section 39(1) Apportionment (${100 - privateUsePct}% Business)`
          : 'Section 33(1) Wholly & Exclusively Incurred',
    };

    if (onSaveExpense) {
      onSaveExpense(expenseRecord);
    }

    // If resolving vehicle missing private pct, resolve from audit
    if (isPrivateUseCategory) {
      resolveAuditIssue('vehicleMissingPrivatePct', 1);
    }
    // Also resolve uncategorized if it was linked
    resolveAuditIssue('uncategorizedTransactions', 1);

    addToast({
      title: 'Expense Successfully Recorded',
      message: `RM ${parsedAmount.toFixed(2)} categorized under ${category}.`,
      type: 'success',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${
              isWarm ? 'bg-orange-50/50' : 'bg-blue-50/50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Log Business Expense
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isWarm ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {activeWorkspace.shortName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simple guided flow — tax treatments are applied automatically for Borang B filing.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Row 1: Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Amount Field */}
              <div>
                <label htmlFor="expense-amount-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <span className="text-sm font-bold text-slate-400">RM</span>
                  </div>
                  <input
                    id="expense-amount-input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`block w-full rounded-xl border border-slate-300 pl-12 pr-4 py-2.5 text-base font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 ${
                      isWarm ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-blue-600 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Date Field */}
              <div>
                <label htmlFor="expense-date-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="expense-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                    isWarm ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-blue-600 focus:border-blue-600'
                  }`}
                />
              </div>
            </div>

            {/* Row 2: Merchant Field */}
            <div>
              <label htmlFor="expense-merchant-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Merchant / Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                id="expense-merchant-input"
                type="text"
                required
                placeholder={isWarm ? "e.g. Kian Seng Wholesale, Shell KK, Foodpanda" : "e.g. Tenaga Nasional Berhad, Nippon Paint, Plumber"}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className={`block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  isWarm ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-blue-600 focus:border-blue-600'
                }`}
              />
            </div>

            {/* Row 3: Category Dropdown */}
            <div>
              <label htmlFor="expense-category-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Expense Category
              </label>
              <select
                id="expense-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 ${
                  isWarm ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-blue-600 focus:border-blue-600'
                }`}
              >
                <option value="Supplies">{isWarm ? 'Food Supplies & Ingredients' : 'Property Maintenance & Repairs'}</option>
                <option value="Utilities & Bills">Utilities & Bills (Water, Electricity)</option>
                <option value="Equipment / Assets">Equipment / Assets (Heavy Tools, Appliances, Tech)</option>
                <option value="Vehicle">Vehicle (Fuel, Service, Tolls, Road Tax)</option>
                <option value="Phone / Internet">Phone / Internet (Telco Bills, Wifi)</option>
                <option value="Marketing & Advertising">Marketing & Advertising</option>
                <option value="Professional & Legal Fees">Professional & Legal Fees</option>
              </select>
            </div>

            {/* PROGRESSIVE DISCLOSURE 1: EQUIPMENT / ASSETS BRANCH */}
            {category === 'Equipment / Assets' && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Guided Asset Classification:
                </span>

                {/* Secondary Radio Button Group: New Purchase vs Routine Repair */}
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-2">
                    Is this a new purchase or a routine repair?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        equipmentType === 'new_purchase'
                          ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="equipment_nature"
                        value="new_purchase"
                        checked={equipmentType === 'new_purchase'}
                        onChange={() => setEquipmentType('new_purchase')}
                        className="mt-0.5 accent-amber-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">New Purchase</span>
                        <span className="text-[11px] text-slate-500 block leading-tight">
                          Brand new machine, appliance, or lasting equipment
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        equipmentType === 'repair'
                          ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="equipment_nature"
                        value="repair"
                        checked={equipmentType === 'repair'}
                        onChange={() => setEquipmentType('repair')}
                        className="mt-0.5 accent-amber-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Routine Repair</span>
                        <span className="text-[11px] text-slate-500 block leading-tight">
                          Fixing or servicing existing equipment to maintain condition
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* DYNAMIC TAX BANNER ACCORDING TO SELECTION */}
                {equipmentType === 'new_purchase' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300/80 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-600" />
                        LHDN Capital Allowances (Schedule 3)
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        This purchase is treated as a <strong>Capital Asset</strong>. It cannot be deducted 100% at once as operational expense, but will be claimed via <strong>Initial Allowance (20%)</strong> + <strong>Annual Allowance (12% - 20%)</strong> across qualifying assessment years.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="asset-subtype-select" className="block text-[11px] font-bold text-amber-900 mb-1">
                        Asset Category for LHDN Depreciation Rate:
                      </label>
                      <select
                        id="asset-subtype-select"
                        value={assetSubtype}
                        onChange={(e) => setAssetSubtype(e.target.value)}
                        className="w-full text-xs rounded-lg border border-amber-300 bg-white p-2 text-slate-800 font-medium"
                      >
                        <option value="kitchen_office">Kitchen & Restaurant Machinery (Initial 20% + Annual 14%)</option>
                        <option value="ict_hardware">Computers & POS Systems (Initial 20% + Annual 40%)</option>
                        <option value="furniture_fittings">Furniture & Fittings (Initial 20% + Annual 10%)</option>
                        <option value="general_plant">General Plant & Machinery (Initial 20% + Annual 14%)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Section 33(1) Allowable Revenue Deduction
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Routine repairs to maintain operating status are <strong>100% tax-deductible</strong> immediately in the current Year of Assessment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PROGRESSIVE DISCLOSURE 2: PRIVATE USE PERCENTAGE SLIDER */}
            {isPrivateUseCategory && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Private Use Apportionment
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {privateUsePct}% Personal
                  </span>
                </div>

                <p className="text-[11px] text-indigo-800 leading-snug">
                  Malaysian tax law (LHDN Form B) requires excluding non-business personal use. Adjust the slider to specify how much of this {category.toLowerCase()} cost was personal.
                </p>

                {/* Interactive Slider */}
                <div className="space-y-1">
                  <input
                    id="private-use-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={privateUsePct}
                    onChange={(e) => setPrivateUsePct(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-indigo-500 font-mono">
                    <span>0% (100% Business)</span>
                    <span>50%</span>
                    <span>100% (Fully Personal)</span>
                  </div>
                </div>

                {/* Real-time Calculation Breakdown */}
                {parsedAmount > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-200/80 text-xs">
                    <div className="p-2 rounded-lg bg-white/80 border border-indigo-100">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                        Deductible ({100 - privateUsePct}%)
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        RM {businessClaimableAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/80 border border-indigo-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Private Add-back ({privateUsePct}%)
                      </span>
                      <span className="font-mono font-semibold text-slate-600 text-sm">
                        RM {privateAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <label htmlFor="expense-notes-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Notes / Reference (Optional)
              </label>
              <input
                id="expense-notes-input"
                type="text"
                placeholder="e.g. Receipt No. #4912, weekly team ingredient run"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                id="save-expense-submit-button"
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all transform active:scale-95 ${
                  isWarm
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                }`}
              >
                Save & Apply Tax Rule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
