import React, { createContext, useState, useEffect } from 'react';
import { WORKSPACES } from './workspacesData';
import { useWorkspace } from './useWorkspace';

export const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem('taxpro_active_workspace') || 'munchieskk';
  });

  const [toasts, setToasts] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([
    {
      id: 'rec-001',
      merchant: 'Kian Seng Wholesale Sdn Bhd',
      amount: 486.50,
      date: '2026-10-02',
      category: 'Food Inventory',
      status: 'pending',
      confidence: 96,
      workspaceId: 'munchieskk',
      itemsCount: 4,
      thumbnail: 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'rec-002',
      merchant: 'Petronas Station Jalan Lintas KK',
      amount: 95.00,
      date: '2026-10-04',
      category: 'Vehicle Expenses',
      status: 'pending',
      confidence: 92,
      workspaceId: 'munchieskk',
      itemsCount: 1,
      thumbnail: 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'rec-003',
      merchant: 'Chuan Seng Hardware & Plumbing',
      amount: 320.00,
      date: '2026-10-05',
      category: 'Property Maintenance & Repairs',
      status: 'pending',
      confidence: 89,
      workspaceId: 'rental',
      itemsCount: 2,
      thumbnail: 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=150&auto=format&fit=crop&q=60',
    }
  ]);

  // Tax Audit ledger issues state
  const [auditIssues, setAuditIssues] = useState({
    munchieskk: {
      missingReceipts: 4,
      uncategorizedTransactions: 7,
      vehicleMissingPrivatePct: 2,
    },
    rental: {
      missingReceipts: 2,
      uncategorizedTransactions: 3,
      vehicleMissingPrivatePct: 1,
    }
  });

  const activeWorkspace = WORKSPACES[activeWorkspaceId] || WORKSPACES.munchieskk;

  useEffect(() => {
    localStorage.setItem('taxpro_active_workspace', activeWorkspaceId);
  }, [activeWorkspaceId]);

  const switchWorkspace = (id) => {
    if (WORKSPACES[id]) {
      setActiveWorkspaceId(id);
      addToast({
        title: 'Switched Entity Workspace',
        message: `Active entity set to ${WORKSPACES[id].name}`,
        type: 'info'
      });
    }
  };

  const addToast = ({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToReviewQueue = (receipt) => {
    setReviewQueue((prev) => [receipt, ...prev]);
  };

  const removeFromReviewQueue = (receiptId) => {
    setReviewQueue((prev) => prev.filter((r) => r.id !== receiptId));
  };

  const resolveAuditIssue = (issueKey, count = 1) => {
    setAuditIssues((prev) => {
      const current = prev[activeWorkspaceId][issueKey];
      return {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          [issueKey]: Math.max(0, current - count),
        }
      };
    });
  };

  const currentIssues = auditIssues[activeWorkspaceId] || {
    missingReceipts: 0,
    uncategorizedTransactions: 0,
    vehicleMissingPrivatePct: 0
  };

  const totalWarnings = currentIssues.missingReceipts +
    currentIssues.uncategorizedTransactions +
    currentIssues.vehicleMissingPrivatePct;

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        activeWorkspaceId,
        switchWorkspace,
        workspaces: WORKSPACES,
        toasts,
        addToast,
        removeToast,
        reviewQueue,
        addToReviewQueue,
        removeFromReviewQueue,
        currentIssues,
        resolveAuditIssue,
        totalWarnings,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export { useWorkspace };
