import React, { useState } from 'react';
import { WorkspaceProvider } from './context/WorkspaceContext';
import MobileLayout from './components/MobileLayout';
import DashboardOverview from './components/DashboardOverview';
import ScannerView from './components/ScannerView';
import ReviewQueue from './components/ReviewQueue';
import AssetsView from './components/AssetsView';
import MileageView from './components/MileageView';
import PreFlightAudit from './components/PreFlightAudit';
import ExpenseEntryModal from './components/ExpenseEntryModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [prefillExpenseData, setPrefillExpenseData] = useState(null);

  const handleOpenExpenseModal = () => {
    setPrefillExpenseData(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenExpenseWithPrefill = (receipt) => {
    setPrefillExpenseData(receipt);
    setIsExpenseModalOpen(true);
  };

  return (
    <MobileLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenExpenseModal={handleOpenExpenseModal}
    >
      {/* 1. Financial Ledger & Tiered Overview */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          onOpenExpenseModal={handleOpenExpenseModal}
          onNavigateScanner={() => setActiveTab('scanner')}
          onNavigateAudit={() => setActiveTab('audit')}
          onNavigateAssets={() => setActiveTab('assets')}
          onNavigateMileage={() => setActiveTab('mileage')}
        />
      )}

      {/* 2. Dual-Mode Receipt Scanner */}
      {activeTab === 'scanner' && (
        <ScannerView
          onOpenExpenseWithPrefill={handleOpenExpenseWithPrefill}
          onNavigateQueue={() => setActiveTab('review')}
        />
      )}

      {/* 3. Smart OCR Categorization & Review Queue */}
      {activeTab === 'review' && (
        <ReviewQueue
          onOpenExpenseWithPrefill={handleOpenExpenseWithPrefill}
        />
      )}

      {/* 4. Capital Allowance (CA) Asset Register */}
      {activeTab === 'assets' && (
        <AssetsView />
      )}

      {/* 5. Dynamic Vehicles & Mileage Tracker */}
      {activeTab === 'mileage' && (
        <MileageView />
      )}

      {/* 6. Pre-Flight Tax Audit & Borang B Export */}
      {activeTab === 'audit' && (
        <PreFlightAudit
          onOpenExpenseModal={handleOpenExpenseModal}
          onNavigateScanner={() => setActiveTab('scanner')}
        />
      )}

      {/* Guided Categorization Modal */}
      <ExpenseEntryModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        initialData={prefillExpenseData}
        onSaveExpense={(saved) => {
          console.log('Saved expense record:', saved);
        }}
      />
    </MobileLayout>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
