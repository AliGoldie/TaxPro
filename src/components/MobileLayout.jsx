import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function MobileLayout({
  children,
  activeTab,
  setActiveTab,
  onOpenExpenseModal
}) {
  const {
    activeWorkspace,
    activeWorkspaceId,
    switchWorkspace,
    workspaces,
    reviewQueue,
    totalWarnings,
    toasts,
    removeToast
  } = useWorkspace();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isWarm = activeWorkspace.theme.palette === 'warm';

  const entityPendingReceipts = reviewQueue.filter(
    (r) => r.workspaceId === activeWorkspaceId
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Ledger',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 5M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'review',
      label: 'Queue',
      badge: entityPendingReceipts > 0 ? entityPendingReceipts : null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    // Center FAB is rendered separately for the Scanner
    {
      id: 'assets',
      label: 'Assets (CA)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'mileage',
      label: 'Mileage',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'audit',
      label: 'Borang B',
      badge: totalWarnings > 0 ? totalWarnings : null,
      badgeColor: 'bg-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0">
      {/* Dynamic Theme Banner */}
      <div
        className={`h-1.5 w-full transition-colors duration-500 ${
          isWarm
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600'
            : 'bg-gradient-to-r from-blue-600 via-teal-500 to-teal-600'
        }`}
      />

      {/* TOP HEADER WITH WORKSPACE TOGGLE */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shadow-sm transition-all duration-300 ${
                isWarm
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20'
                  : 'bg-gradient-to-br from-blue-600 to-teal-600 shadow-blue-500/20'
              }`}
            >
              <span className="text-sm tracking-wider">TP</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">TAXPRO</span>
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  MY
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                {isWarm ? 'Section 4(a) F&B Business' : 'Section 4(d) Rental Income'}
              </p>
            </div>
          </div>

          {/* HIGHLY VISIBLE WORKSPACE TOGGLE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="mobile-workspace-toggle"
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all ${
                isWarm
                  ? 'border-orange-200 bg-orange-50/80 text-slate-800'
                  : 'border-blue-200 bg-blue-50/80 text-slate-800'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 animate-pulse ${
                  isWarm ? 'bg-orange-500 ring-2 ring-orange-200' : 'bg-blue-600 ring-2 ring-blue-200'
                }`}
              />
              <div className="flex flex-col min-w-0 pr-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">
                  {isWarm ? 'Section 4(a)' : 'Section 4(d)'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                  {activeWorkspace.shortName}
                </span>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isWorkspaceMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Switch Entity Context</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">YA 2025</span>
                </div>
                <div className="p-1 space-y-1">
                  {Object.values(workspaces).map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId;
                    const wsWarm = ws.theme.palette === 'warm';
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          switchWorkspace(ws.id);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? wsWarm ? 'bg-orange-50 border border-orange-300' : 'bg-blue-50 border border-blue-300'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full mt-0.5 ${wsWarm ? 'bg-orange-500' : 'bg-blue-600'}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">{ws.name}</span>
                          <span className="text-[11px] text-slate-500 block truncate">{ws.regime}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Expense Entry Header Button */}
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs ${
              isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            + Log Expense
          </button>
        </div>
      </header>

      {/* DESKTOP SIDEBAR + MAIN VIEW CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex gap-6">
        
        {/* DESKTOP SIDEBAR: hidden on mobile */}
        <aside className="hidden md:flex flex-col w-60 flex-shrink-0 gap-5">
          <nav className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tax Modules
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? isWarm ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 5M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Financial Ledger</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'scanner'
                  ? isWarm ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span>Receipt Scanner</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">Live</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'review'
                  ? isWarm ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Review Queue</span>
              </div>
              {entityPendingReceipts > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold text-white ${isWarm ? 'bg-orange-500' : 'bg-blue-600'}`}>
                  {entityPendingReceipts}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'assets'
                  ? isWarm ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Capital Assets (CA)</span>
              </div>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-bold">Sch 3</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mileage')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mileage'
                  ? isWarm ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Vehicles & Mileage</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? isWarm ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Pre-Flight Tax Audit</span>
              </div>
              {totalWarnings > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-red-500 text-white">
                  {totalWarnings}
                </span>
              )}
            </button>
          </nav>

          <button
            type="button"
            onClick={onOpenExpenseModal}
            className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm ${
              isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            + Log Expense
          </button>
        </aside>

        {/* MAIN BODY VIEW */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* ANDROID-STYLE FIXED BOTTOM NAVIGATION BAR WITH ELEVATED FAB */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-between">
        
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative ${
                isActive
                  ? isWarm ? 'text-orange-600' : 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className={`absolute -top-1 -right-2 text-[9px] font-extrabold text-white px-1.5 rounded-full ${item.badgeColor || (isWarm ? 'bg-orange-500' : 'bg-blue-600')}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* CENTER ELEVATED FLOATING ACTION BUTTON (FAB) FOR SCANNER */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-90 border-4 border-white ${
              isWarm
                ? 'bg-gradient-to-tr from-orange-500 to-amber-500 shadow-orange-500/40 ring-2 ring-orange-400/20'
                : 'bg-gradient-to-tr from-blue-600 to-teal-500 shadow-blue-500/40 ring-2 ring-blue-400/20'
            }`}
            aria-label="Open Receipt Scanner"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Right 3 items */}
        {navItems.slice(2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative ${
                isActive
                  ? isWarm ? 'text-orange-600' : 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className={`absolute -top-1 -right-2 text-[9px] font-extrabold text-white px-1.5 rounded-full ${item.badgeColor || (isWarm ? 'bg-orange-500' : 'bg-blue-600')}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TOAST CONTAINER */}
      <div className="fixed bottom-20 md:bottom-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 text-white rounded-2xl shadow-xl border border-slate-800 p-3.5 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-100">{toast.title}</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
