import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Layout({
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close workspace dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter review queue items for this active workspace
  const entityPendingReceipts = reviewQueue.filter(
    (r) => r.workspaceId === activeWorkspaceId
  ).length;

  // Determine dynamic colors based on active workspace palette
  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Navigation items
  const navItems = [
    {
      id: 'dashboard',
      label: 'Financial Ledger',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 5M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'scanner',
      label: 'Receipt Scanner',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: entityPendingReceipts > 0 ? entityPendingReceipts : null,
      badgeColor: isWarm ? 'bg-orange-500' : 'bg-blue-600',
    },
    {
      id: 'audit',
      label: 'Pre-Flight Tax Audit',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badge: totalWarnings > 0 ? totalWarnings : null,
      badgeColor: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Dynamic Theme Banner / Ambient glow according to workspace */}
      <div
        className={`h-1.5 w-full transition-colors duration-500 ${
          isWarm ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600' : 'bg-gradient-to-r from-blue-600 via-teal-500 to-teal-600'
        }`}
      />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shadow-sm transition-all duration-300 ${
                  isWarm ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20' : 'bg-gradient-to-br from-blue-600 to-teal-600 shadow-blue-500/20'
                }`}
              >
                <span className="text-sm tracking-wider">TP</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900">TAXPRO</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    MY
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none">Borang B Malaysian Tax Engine</p>
              </div>
            </div>
          </div>

          {/* Center: HIGHLY VISIBLE WORKSPACE TOGGLE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="workspace-toggle-dropdown"
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl border text-left transition-all duration-200 shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 ${
                isWarm
                  ? 'border-orange-200 bg-orange-50/70 hover:bg-orange-50 text-slate-800 focus:ring-orange-500/40'
                  : 'border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-slate-800 focus:ring-blue-500/40'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse-subtle transition-colors duration-300 ${
                  isWarm ? 'bg-orange-500 ring-4 ring-orange-200/60' : 'bg-blue-600 ring-4 ring-blue-200/60'
                }`}
              />

              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">
                  Active Entity
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                  {activeWorkspace.name}
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full border hidden md:inline-block ${
                      isWarm
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-teal-100 text-teal-800 border-teal-300'
                    }`}
                  >
                    {isWarm ? 'F&B Tax Rules' : 'Section 4(d)'}
                  </span>
                </span>
              </div>

              <svg
                className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  isWorkspaceMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isWorkspaceMenuOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Switch Taxpayer Entity</h4>
                    <p className="text-[11px] text-slate-500">Multi-tenant partition for LHDN reporting</p>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    YA 2025/2026
                  </span>
                </div>

                <div className="p-2 space-y-1.5">
                  {Object.values(workspaces).map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId;
                    const wsIsWarm = ws.theme.palette === 'warm';

                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          switchWorkspace(ws.id);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                          isSelected
                            ? wsIsWarm
                              ? 'bg-orange-50/90 border border-orange-300 ring-1 ring-orange-400/20'
                              : 'bg-blue-50/90 border border-blue-300 ring-1 ring-blue-400/20'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 flex items-center justify-center ${
                            wsIsWarm ? 'bg-orange-500' : 'bg-blue-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {ws.name}
                            </span>
                            {isSelected && (
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  wsIsWarm
                                    ? 'bg-orange-200/70 text-orange-800'
                                    : 'bg-blue-200/70 text-blue-800'
                                }`}
                              >
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{ws.category}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-400">
                            <span>{ws.regNumber}</span>
                            <span>•</span>
                            <span>{ws.tinNumber}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Encrypted Multi-Entity Ledger
                  </span>
                  <span className="font-semibold text-slate-700">LHDN Malaysia Compliant</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Action Buttons & User Profile */}
          <div className="flex items-center gap-2.5">
            <button
              id="global-add-expense-button"
              type="button"
              onClick={onOpenExpenseModal}
              className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 transform active:scale-95 ${
                isWarm
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Log Expense</span>
            </button>

            {/* Quick Scanner Shortcut */}
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors relative`}
              title="Open Receipt Scanner"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              {entityPendingReceipts > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${
                    isWarm ? 'bg-orange-500' : 'bg-blue-600'
                  }`}
                >
                  {entityPendingReceipts}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  isWarm ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                AG
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">Ali Goldie</p>
                <p className="text-[10px] text-slate-500">Sole Proprietor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 gap-6">
          <nav className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? isWarm
                        ? 'bg-orange-500 text-white font-semibold shadow-xs shadow-orange-500/20'
                        : 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-bold text-white ${
                        isActive ? 'bg-white/20' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Active Entity Info Card in Sidebar */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isWarm
                ? 'bg-gradient-to-br from-orange-50 to-amber-50/40 border-orange-200/80'
                : 'bg-gradient-to-br from-blue-50 to-teal-50/40 border-blue-200/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                LHDN Tax Regime
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isWarm ? 'bg-orange-500' : 'bg-blue-600'
                }`}
              />
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              {activeWorkspace.shortName}
            </h4>
            <p className="text-xs text-slate-600 mt-1 font-medium">{activeWorkspace.regime}</p>

            <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1 text-[11px] font-mono text-slate-500">
              <div className="flex justify-between">
                <span>Registration:</span>
                <span className="text-slate-700 font-medium truncate ml-1">{activeWorkspace.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax TIN:</span>
                <span className="text-slate-700 font-medium truncate ml-1">{activeWorkspace.tinNumber}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenExpenseModal}
              className={`w-full mt-3.5 py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors ${
                isWarm ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Quick Log Expense
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL/DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black ${
                        isWarm ? 'bg-orange-500' : 'bg-blue-600'
                      }`}
                    >
                      TP
                    </div>
                    <span className="font-bold text-slate-900">TAXPRO Malaysia</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? isWarm
                              ? 'bg-orange-500 text-white'
                              : 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-bold text-white ${
                              isActive ? 'bg-white/20' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  onOpenExpenseModal();
                }}
                className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-sm ${
                  isWarm ? 'bg-orange-500' : 'bg-blue-600'
                }`}
              >
                + Log New Expense
              </button>
            </div>
          </div>
        )}

        {/* MAIN BODY VIEW */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* NON-BLOCKING TOAST NOTIFICATIONS */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 text-white rounded-2xl shadow-xl border border-slate-800 p-4 flex items-start gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
              ) : toast.type === 'info' ? (
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                    isWarm ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  ℹ
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  !
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-100">{toast.title}</h5>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
