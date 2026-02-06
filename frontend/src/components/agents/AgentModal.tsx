import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAgents } from '../../hooks/useAgents';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function AgentModal() {
  const { state, dispatch } = useAppContext();
  const { createAgent, updateAgent } = useAgents();

  const isOpen = state.ui.modalType === 'agent-create' || state.ui.modalType === 'agent-edit';
  const isEditing = state.ui.modalType === 'agent-edit';
  const editingAgent = state.ui.editingAgent;

  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingAgent) {
        setName(editingAgent.name);
        setSystemPrompt(editingAgent.system_prompt);
      } else {
        setName('');
        setSystemPrompt('');
      }
      setError(null);
    }
  }, [isOpen, isEditing, editingAgent]);

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing && editingAgent) {
        await updateAgent(editingAgent.id, { name, system_prompt: systemPrompt });
      } else {
        await createAgent({ name, system_prompt: systemPrompt });
      }
      handleClose();
    } catch (err) {
      setError('Failed to save agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Agent' : 'Create Agent'}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer Support Bot"
              className="input"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quick Generate (AI)
            </label>
            <div className="flex gap-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <input
                type="text"
                placeholder="Describe what this agent should do (e.g., 'A funny math teacher')..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Basic internal handling just to prevent form submit
                  }
                }}
                id="refine-input"
              />
              <Button 
                type="button" 
                size="sm"
                variant="primary"
                onClick={async () => {
                   const input = document.getElementById('refine-input') as HTMLInputElement;
                   const desc = input.value;
                   if (!desc) return;
                   
                   setLoading(true);
                   try {
                     const { agentService } = await import('../../services/agentService');
                     const result = await agentService.refine(desc);
                     setSystemPrompt(result.system_prompt);
                   } catch (err) {
                     setError('Failed to generate prompt');
                   } finally {
                     setLoading(false);
                   }
                }}
              >
                ✨ Generate
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
              System Prompt
            </label>
            <textarea
              id="prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              className="textarea h-32 font-mono text-sm"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              This defines the agent's personality and behavior. Use the generator above or write your own.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
