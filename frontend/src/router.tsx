import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { AgentModal } from './components/agents/AgentModal';
import { VoiceModeModal } from './components/voice/VoiceModeModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { useAppContext } from './context/AppContext';
import { useAgents } from './hooks/useAgents';
import { useSessions } from './hooks/useSessions';
import { useState } from 'react';

function DeleteDialogs() {
  const { state, dispatch } = useAppContext();
  const { deleteAgent } = useAgents();
  const { deleteSession } = useSessions();
  const [loading, setLoading] = useState(false);

  const isAgentDelete = state.ui.modalType === 'delete-agent';
  const isSessionDelete = state.ui.modalType === 'delete-session';
  const isOpen = isAgentDelete || isSessionDelete;
  const item = state.ui.deletingItem;

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleConfirm = async () => {
    if (!item) return;
    setLoading(true);

    try {
      if (item.type === 'agent') {
        await deleteAgent(item.id);
      } else {
        await deleteSession(item.id);
      }
      handleClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const details = item.type === 'agent'
    ? ['All sessions for this agent', 'All messages in those sessions', 'All voice recordings']
    : ['All messages in this session', 'All voice recordings'];

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={`Delete ${item.type === 'agent' ? 'Agent' : 'Session'}`}
      message={`Are you sure you want to delete "${item.name}"?`}
      details={details}
      confirmText={`Delete ${item.type === 'agent' ? 'Agent' : 'Session'}`}
      loading={loading}
    />
  );
}

function AppShell() {
  return (
    <AppProvider>
      <Outlet />
      <AgentModal />
      <VoiceModeModal />
      <DeleteDialogs />
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      { path: 'chat', element: <Layout /> },
      { path: 'chat/:agentId', element: <Layout /> },
      { path: 'chat/:agentId/:sessionId', element: <Layout /> },
    ],
  },
]);
