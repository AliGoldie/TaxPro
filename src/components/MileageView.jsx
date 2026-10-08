import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function MileageView() {
  const { activeWorkspace, activeWorkspaceId, addToast } = useWorkspace();
  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Vehicles List
  const [vehicles, setVehicles] = useState([
    {
      id: 'veh-1',
      name: 'Isuzu D-Max RT50',
      regNumber: 'SAB 4812 E',
      type: 'Commercial 4x4 (F&B Transport)',
      defaultBusinessPct: 80,
      totalTripsKm: 840,
    },
    {
      id: 'veh-2',
      name: 'Perodua Ativa',
      regNumber: 'SAC 9123 X',
      type: 'Compact SUV (Property Runabout)',
      defaultBusinessPct: 50,
      totalTripsKm: 320,
    }
  ]);

  // Trip Log state
  const [trips, setTrips] = useState([
    {
      id: 'trip-101',
      date: '2026-10-06',
      vehicleId: 'veh-1',
      vehicleName: 'Isuzu D-Max RT50',
      purpose: 'Restock fresh beef patties & supplies from Kian Seng Inanam',
      distanceKm: 42,
      deductionClaim: 25.20,
      workspaceId: 'munchieskk',
    },
    {
      id: 'trip-102',
      date: '2026-10-04',
      vehicleId: 'veh-2',
      vehicleName: 'Perodua Ativa',
      purpose: 'Emergency water tap repair inspection at Damai Point Condo',
      distanceKm: 18,
      deductionClaim: 10.80,
      workspaceId: 'rental',
    },
    {
      id: 'trip-103',
      date: '2026-10-02',
      vehicleId: 'veh-1',
      vehicleName: 'Isuzu D-Max RT50',
      purpose: 'Sabah Electricity (SESB) branch billing payment run',
      distanceKm: 26,
      deductionClaim: 15.60,
      workspaceId: 'munchieskk',
    }
  ]);

  // Trip Form Inputs
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('veh-1');
  const [tripPurpose, setTripPurpose] = useState('');
  const [distanceKm, setDistanceKm] = useState('');

  // Add Vehicle Modal State
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehName, setNewVehName] = useState('');
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehPct, setNewVehPct] = useState(70);

  // Mileage rate benchmark (RM 0.60 per km)
  const KM_BENCHMARK_RATE = 0.60;

  const handleAddTrip = (e) => {
    e.preventDefault();
    const kmNum = parseFloat(distanceKm);
    if (!kmNum || kmNum <= 0 || !tripPurpose.trim()) {
      alert('Please enter valid distance in KM and trip purpose.');
      return;
    }

    const matchedVeh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
    const deduction = kmNum * KM_BENCHMARK_RATE * (matchedVeh.defaultBusinessPct / 100);

    const newTrip = {
      id: `trip-${Date.now()}`,
      date: tripDate,
      vehicleId: matchedVeh.id,
      vehicleName: matchedVeh.name,
      purpose: tripPurpose.trim(),
      distanceKm: kmNum,
      deductionClaim: deduction,
      workspaceId: activeWorkspaceId,
    };

    setTrips([newTrip, ...trips]);
    setDistanceKm('');
    setTripPurpose('');

    addToast({
      title: 'Business Trip Logged',
      message: `${kmNum} km recorded for ${matchedVeh.name} (RM ${deduction.toFixed(2)} claimable).`,
      type: 'success',
    });
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehName.trim() || !newVehReg.trim()) return;

    const newVeh = {
      id: `veh-${Date.now()}`,
      name: newVehName.trim(),
      regNumber: newVehReg.trim(),
      type: 'Registered Business Vehicle',
      defaultBusinessPct: Number(newVehPct),
      totalTripsKm: 0,
    };

    setVehicles([...vehicles, newVeh]);
    setIsAddVehicleOpen(false);
    setNewVehName('');
    setNewVehReg('');

    addToast({
      title: 'New Vehicle Registered',
      message: `${newVeh.name} (${newVeh.regNumber}) added to fleet.`,
      type: 'success',
    });
  };

  const entityTrips = trips.filter((t) => t.workspaceId === activeWorkspaceId);
  const totalKmThisMonth = entityTrips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalDeductionThisMonth = entityTrips.reduce((acc, t) => acc + t.deductionClaim, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Vehicles & Mileage Tracker (Section 39 Apportionment)
          </h2>
          <p className="text-xs text-slate-500">
            Log official business travel to justify fuel and motor maintenance claims during LHDN audits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddVehicleOpen(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs ${
            isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          + Add Vehicle
        </button>
      </div>

      {/* Monthly Mileage KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Distance Logged</span>
          <div className="text-2xl font-black font-mono text-slate-900">{totalKmThisMonth} km</div>
          <span className="text-[11px] text-slate-500 font-medium">Month of October 2026</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Claimable Motor Deduction</span>
          <div className="text-2xl font-black font-mono text-emerald-600">RM {totalDeductionThisMonth.toFixed(2)}</div>
          <span className="text-[11px] text-slate-500 font-medium">Benchmarked @ RM0.60/km</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Registered Vehicles</span>
          <div className="text-2xl font-black font-mono text-slate-900">{vehicles.length} Units</div>
          <span className="text-[11px] text-slate-500 font-medium">Apportioned by default %</span>
        </div>
      </div>

      {/* Trip Logger & Fleet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Fast Trip Logger Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Log Business Trip</h3>
            <p className="text-[11px] text-slate-500">Record point-to-point journey for tax defense</p>
          </div>

          <form onSubmit={handleAddTrip} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 bg-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.regNumber}) — {v.defaultBusinessPct}% Biz
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Distance (KM)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 35"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Business Purpose</label>
              <input
                type="text"
                required
                placeholder="e.g. Supplier stock pickup, bank cash deposit, site visit"
                value={tripPurpose}
                onChange={(e) => setTripPurpose(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-98 ${
                isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              + Record Trip to Logbook
            </button>
          </form>
        </div>

        {/* Trips Log Table & Fleet Badges */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Trip Logbook (LHDN Borang B Audit Trail)</h3>
              <span className="text-[10px] text-slate-400 font-mono">{entityTrips.length} entries</span>
            </div>

            {entityTrips.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No trips logged yet for this entity.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="py-2">Date</th>
                      <th className="py-2">Vehicle</th>
                      <th className="py-2">Purpose</th>
                      <th className="py-2 text-right">KM</th>
                      <th className="py-2 text-right">Tax Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {entityTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono text-slate-500 text-[11px]">{t.date}</td>
                        <td className="py-2.5 font-bold text-slate-900 text-xs">{t.vehicleName}</td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[180px]">{t.purpose}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-800">{t.distanceKm} km</td>
                        <td className="py-2.5 text-right font-mono font-black text-emerald-600">RM {t.deductionClaim.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD VEHICLE MODAL */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddVehicleOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative rounded-3xl bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Add Vehicle to Fleet</h3>
                <button type="button" onClick={() => setIsAddVehicleOpen(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Vehicle Make & Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Isuzu D-Max, Toyota Hilux, Honda City"
                    value={newVehName}
                    onChange={(e) => setNewVehName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Registration Plate (No. Pendaftaran)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAB 1234 A"
                    value={newVehReg}
                    onChange={(e) => setNewVehReg(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Default Business Use Percentage</span>
                    <span>{newVehPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={newVehPct}
                    onChange={(e) => setNewVehPct(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddVehicleOpen(false)} className="px-3 py-2 text-xs font-semibold text-slate-600">
                    Cancel
                  </button>
                  <button type="submit" className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${isWarm ? 'bg-orange-500' : 'bg-blue-600'}`}>
                    Save Vehicle
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
