import React, { useState } from 'react';
import { WorkspaceProvider } from './context/WorkspaceContext';
import Layout from './components/Layout';
import DashboardOverview from './components/DashboardOverview';
import ScannerView from './components/ScannerView';
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
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenExpenseModal={handleOpenExpenseModal}
    >
      {/* Dynamic View Switching */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          onOpenExpenseModal={handleOpenExpenseModal}
          onNavigateScanner={() => setActiveTab('scanner')}
          onNavigateAudit={() => setActiveTab('audit')}
        />
      )}

      {activeTab === 'scanner' && (
        <ScannerView
          onOpenExpenseWithPrefill={handleOpenExpenseWithPrefill}
        />
      )}

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
    </Layout>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
