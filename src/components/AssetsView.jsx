import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AssetsView() {
  const { activeWorkspace, activeWorkspaceId, addToast } = useWorkspace();
  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Capital Assets Seed & State
  const [assets, setAssets] = useState([
    {
      id: 'ca-01',
      name: 'Rational iCombi Pro Oven (10-Grid)',
      category: 'Kitchen Machinery',
      acquisitionDate: '2025-03-15',
      qualifyingCost: 38500,
      initialAllowanceRate: 20, // 20%
      annualAllowanceRate: 14,  // 14%
      yearAcquired: 2025,
      workspaceId: 'munchieskk',
    },
    {
      id: 'ca-02',
      name: 'Heavy-Duty Stainless Exhaust Hood & Ducting',
      category: 'Kitchen Machinery',
      acquisitionDate: '2025-06-20',
      qualifyingCost: 16800,
      initialAllowanceRate: 20,
      annualAllowanceRate: 14,
      yearAcquired: 2025,
      workspaceId: 'munchieskk',
    },
    {
      id: 'ca-03',
      name: 'iPad Pro POS Terminal & Thermal Printers',
      category: 'ICT Hardware',
      acquisitionDate: '2025-08-10',
      qualifyingCost: 5400,
      initialAllowanceRate: 20,
      annualAllowanceRate: 40, // 40% for computers/ICT
      yearAcquired: 2025,
      workspaceId: 'munchieskk',
    },
    {
      id: 'ca-04',
      name: 'Daikin 2.5HP Inverter Air Conditioners (3 Units)',
      category: 'General Plant & Machinery',
      acquisitionDate: '2025-02-12',
      qualifyingCost: 9600,
      initialAllowanceRate: 20,
      annualAllowanceRate: 14,
      yearAcquired: 2025,
      workspaceId: 'rental',
    }
  ]);

  // Modal State for New Asset Registration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('kitchen_plant');
  const [cost, setCost] = useState('');
  const [acqDate, setAcqDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Rates lookup
  const getRates = (catKey) => {
    switch (catKey) {
      case 'ict_hardware':
        return { ia: 20, aa: 40, label: 'ICT Hardware & Computers (40% AA)' };
      case 'vehicles':
        return { ia: 20, aa: 20, label: 'Motor Vehicles (20% AA)' };
      case 'office_furniture':
        return { ia: 20, aa: 10, label: 'Office Furniture & Fittings (10% AA)' };
      case 'kitchen_plant':
      default:
        return { ia: 20, aa: 14, label: 'Plant & Kitchen Machinery (14% AA)' };
    }
  };

  const handleRegisterAsset = (e) => {
    e.preventDefault();
    const costNum = parseFloat(cost);
    if (!costNum || costNum <= 0 || !assetName.trim()) {
      alert('Please enter valid asset details and cost.');
      return;
    }

    const rates = getRates(assetCategory);
    const newAsset = {
      id: `ca-${Date.now()}`,
      name: assetName.trim(),
      category: rates.label,
      acquisitionDate: acqDate,
      qualifyingCost: costNum,
      initialAllowanceRate: rates.ia,
      annualAllowanceRate: rates.aa,
      yearAcquired: new Date(acqDate).getFullYear(),
      workspaceId: activeWorkspaceId,
    };

    setAssets([...assets, newAsset]);
    setIsModalOpen(false);
    setAssetName('');
    setCost('');

    addToast({
      title: 'Capital Asset Registered',
      message: `${newAsset.name} added. First year tax allowance: RM ${((rates.ia + rates.aa) / 100 * costNum).toFixed(2)}.`,
      type: 'success',
    });
  };

  /**
   * LHDN Capital Allowance Schedule Computation
   * Year 1: IA (20%) + AA (Rate%)
   * Subsequent Years: AA (Rate%) until TWDV reaches 0
   */
  const computeSchedule = (asset) => {
    const cost = asset.qualifyingCost;
    const iaRate = asset.initialAllowanceRate / 100;
    const aaRate = asset.annualAllowanceRate / 100;

    const year1IA = cost * iaRate;
    const year1AA = cost * aaRate;
    const year1TotalCA = year1IA + year1AA;
    const twdvYear1 = Math.max(0, cost - year1TotalCA);

    const year2AA = Math.min(twdvYear1, cost * aaRate);
    const twdvYear2 = Math.max(0, twdvYear1 - year2AA);

    const year3AA = Math.min(twdvYear2, cost * aaRate);
    const twdvYear3 = Math.max(0, twdvYear2 - year3AA);

    return {
      cost,
      year1IA,
      year1AA,
      year1TotalCA,
      twdvYear1,
      year2AA,
      twdvYear2,
      year3AA,
      twdvYear3,
    };
  };

  const entityAssets = assets.filter((a) => a.workspaceId === activeWorkspaceId);
  const totalQualifyingCost = entityAssets.reduce((acc, a) => acc + a.qualifyingCost, 0);
  const totalYear1Allowances = entityAssets.reduce((acc, a) => acc + computeSchedule(a).year1TotalCA, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Capital Allowance (CA) Asset Register
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Schedule 3 LHDN
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track business assets, calculate Initial & Annual Allowances, and preserve Tax Written Down Value (TWDV).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs ${
            isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          + Register Capital Asset
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Qualifying Expenditure</span>
          <div className="text-2xl font-black font-mono text-slate-900">RM {totalQualifyingCost.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">Assets on Balance Sheet</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Year CA Claim</span>
          <div className="text-2xl font-black font-mono text-amber-600">RM {totalYear1Allowances.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Deductible against Adjusted Income</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Registered Capital Assets</span>
          <div className="text-2xl font-black font-mono text-slate-900">{entityAssets.length} Items</div>
          <span className="text-[11px] text-slate-500 font-medium">Carried forward across YAs</span>
        </div>
      </div>

      {/* Assets & TWDV Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Asset Depreciation Schedule (CP204 / Borang B)</h3>
            <p className="text-[11px] text-slate-500">Tax depreciation calculated under Schedule 3 of Malaysian Income Tax Act 1967</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">YA 2025/2026</span>
        </div>

        {entityAssets.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No capital assets recorded for this entity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2.5">Asset Description</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right">Cost (RM)</th>
                  <th className="py-2.5 text-right">Initial (20%)</th>
                  <th className="py-2.5 text-right">Annual (AA)</th>
                  <th className="py-2.5 text-right">Total CA Year 1</th>
                  <th className="py-2.5 text-right">Closing TWDV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {entityAssets.map((asset) => {
                  const sched = computeSchedule(asset);
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">
                        {asset.name}
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">Acquired: {asset.acquisitionDate}</span>
                      </td>
                      <td className="py-3 text-[11px] text-slate-600">
                        {asset.category}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">
                        RM {asset.qualifyingCost.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-amber-700">
                        RM {sched.year1IA.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-amber-700">
                        RM {sched.year1AA.toLocaleString()} ({asset.annualAllowanceRate}%)
                      </td>
                      <td className="py-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/50">
                        RM {sched.year1TotalCA.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono font-black text-slate-900">
                        RM {sched.twdvYear1.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REGISTER ASSET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative rounded-3xl bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Register Capital Asset</h3>
                  <p className="text-[11px] text-slate-500">Asset qualifying for LHDN Schedule 3</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleRegisterAsset} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Asset Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rational Combi Oven, Daikin Aircond, Commercial Chiller"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Asset Category (LHDN Rate)</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold bg-white"
                  >
                    <option value="kitchen_plant">Plant & Kitchen Machinery (IA 20% + AA 14%)</option>
                    <option value="ict_hardware">ICT Hardware, POS & Computers (IA 20% + AA 40%)</option>
                    <option value="vehicles">Motor Commercial Vehicles (IA 20% + AA 20%)</option>
                    <option value="office_furniture">Office Furniture & Fittings (IA 20% + AA 10%)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Purchase Cost (RM)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Acquisition Date</label>
                    <input
                      type="date"
                      required
                      value={acqDate}
                      onChange={(e) => setAcqDate(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 text-xs font-semibold text-slate-600">
                    Cancel
                  </button>
                  <button type="submit" className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${isWarm ? 'bg-orange-500' : 'bg-blue-600'}`}>
                    Register Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
