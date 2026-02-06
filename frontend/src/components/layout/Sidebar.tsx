import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, Plus, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAgents } from '../../hooks/useAgents';
import { useSessions } from '../../hooks/useSessions';
import { AgentList } from '../agents/AgentList';
import { SessionList } from '../sessions/SessionList';
import { KnowledgePanel } from '../knowledge/KnowledgePanel';

export function Sidebar() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { agents, selectedId: selectedAgentId, fetchAgents } = useAgents();
  const { sessions, selectedId: selectedSessionId, fetchSessions, createSession } = useSessions();

  const collapsed = state.ui.sidebarCollapsed;
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Fetch sessions when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      fetchSessions(selectedAgentId);
    }
  }, [selectedAgentId, fetchSessions]);

  const handleNewAgent = () => {
    dispatch({ type: 'OPEN_MODAL', payload: { type: 'agent-create' } });
  };

  const handleNewSession = async () => {
    if (selectedAgentId) {
      const session = await createSession(selectedAgentId);
      navigate(`/chat/${selectedAgentId}/${session.id}`);
    }
  };

  const handleBackToAgents = () => {
    navigate('/chat');
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <aside
      className={`flex flex-col bg-neutral-900 text-slate-300 transition-all duration-300 border-r border-white/5 ${
        collapsed ? 'w-20' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            {selectedAgentId ? (
              <button 
                onClick={handleBackToAgents}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <div className="p-1 rounded bg-white/5 group-hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">All Agents</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <Bot className="h-6 w-6 text-primary-400" />
                </div>
                <span className="font-bold text-white tracking-wide">AI Platform</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>  
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-hidden flex flex-col animate-fade-in">
          {selectedAgentId ? (
            // Session View
            <>
              <div className="flex-1 overflow-hidden flex flex-col p-4">
                 <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
                       {selectedAgent?.name || 'Session'}
                     </h3>
                   </div>
                   <button
                     onClick={handleNewSession}
                     className="p-1.5 rounded-lg hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 transition-all duration-200"
                     title="New Session"
                   >
                     <Plus className="h-4 w-4" />
                   </button>
                 </div>
                 <SessionList />
               </div>

               {/* Knowledge Base Section - Only show in Session View */}
               <div className="flex-shrink-0 border-t border-white/5">
                 <div className="flex items-center gap-2 px-6 pt-4">
                   <BookOpen className="h-4 w-4 text-slate-500" />
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                     Knowledge
                   </h3>
                 </div>
                 <KnowledgePanel agentId={selectedAgentId} />
               </div>
            </>
          ) : (
            // Agent View
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Agent
                </h3>
                <button
                  onClick={handleNewAgent}
                  className="p-1.5 rounded-lg hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 transition-all duration-200"
                  title="Create Agent"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <AgentList />
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-6 gap-4 animate-fade-in">
           {selectedAgentId ? (
             // Collapsed Session View Actions
             <>
               <button
                onClick={handleBackToAgents}
                className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 group relative"
                title="Back to Agents"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="absolute left-14 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  All Agents
                </span>
              </button>

              <div className="w-8 h-px bg-white/10 my-1"></div>

               <button
                 onClick={handleNewSession}
                 className="p-3 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-200 shadow-lg shadow-primary-900/20 group relative"
                 title="New Session"
               >
                 <Plus className="h-6 w-6" />
                 <span className="absolute left-14 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                   New Session
                 </span>
               </button>
               <button
                 className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 group relative"
                 title="Knowledge Base"
               >
                 <BookOpen className="h-6 w-6" />
                 <span className="absolute left-14 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                   Knowledge
                 </span>
               </button>
             </>
           ) : (
             // Collapsed Agent View Actions
             <button
               onClick={handleNewAgent}
               className="p-3 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-200 shadow-lg shadow-primary-900/20 group relative"
               title="Create Agent"
             >
               <Plus className="h-6 w-6" />
               <span className="absolute left-14 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                 New Agent
               </span>
             </button>
           )}
        </div>
      )}
    </aside>
  );
}
