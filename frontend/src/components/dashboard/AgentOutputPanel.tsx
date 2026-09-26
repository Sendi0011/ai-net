import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { AgentOutputViewer } from '../agents/AgentOutputViewer';

interface AgentOutputPanelProps {
  outputs: Record<string, string>;
  nodes: Array<{ nodeId: string; agentType: string; status: string }>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export const AgentOutputPanel: React.FC<AgentOutputPanelProps> = ({
  outputs,
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  // Default to first active or completed node if none selected
  useEffect(() => {
    if (!selectedNodeId && nodes.length > 0) {
      const activeNode = nodes.find(n => n.status === 'running' || n.status === 'completed') || nodes[0];
      onSelectNode(activeNode.nodeId);
    }
  }, [nodes, selectedNodeId, onSelectNode]);

  const activeOutput = selectedNodeId ? outputs[selectedNodeId] || '' : '';

  const selectedNode = selectedNodeId ? nodes.find(n => n.nodeId === selectedNodeId) : undefined;
  // The filename stem carries the node id and capability so two agents' exports
  // in the same download folder never collide.
  const filenameBase = selectedNode
    ? `agent-output-${selectedNode.nodeId}-${selectedNode.agentType}`
    : 'agent-output';

  return (
    <div className="glass-panel mt-6 overflow-hidden flex flex-col transition-all duration-300" style={{ minHeight: isOpen ? '380px' : '64px', height: isOpen ? '420px' : '64px' }}>
      {/* Header */}
      <div
        className="flex justify-between items-center pb-3 border-b border-[var(--panel-border)] cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
        style={{ height: '40px' }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-indigo-400" />
          <h3 className="text-md font-semibold text-[var(--text-primary)]">{t('task.output.title')}</h3>
        </div>
        <div className="flex items-center gap-4">
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-1 overflow-hidden mt-3" style={{ height: 'calc(100% - 60px)' }}>
          {/* Node Selector Sidebar */}
          <div className="w-1/4 border-r border-[var(--panel-border)] pr-3 flex flex-col gap-1.5 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-1">{t('task.output.nodes')}</div>
            {nodes.map((node) => {
              const isActive = selectedNodeId === node.nodeId;
              const hasOutput = !!outputs[node.nodeId];
              return (
                <button
                  key={node.nodeId}
                  onClick={() => onSelectNode(node.nodeId)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex flex-col gap-0.5 ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                      : 'hover:bg-slate-800/50 text-[var(--text-secondary)] border border-transparent'
                  } ${hasOutput ? 'text-slate-100' : ''}`}
                >
                  <div className="truncate font-semibold capitalize">
                    {t('task.agentName', {
                      name: node.nodeId.replace('node_', '').replace('node-', ''),
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      node.status === 'completed' ? 'bg-emerald-500' :
                      node.status === 'running' ? 'bg-indigo-400 animate-pulse' :
                      node.status === 'failed' ? 'bg-rose-500' : 'bg-slate-500'
                    }`} />
                    <span className="text-[9px] uppercase tracking-wider opacity-80">{node.status}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Highlighted, exportable output */}
          <div className="flex-1 pl-4 min-w-0">
            {activeOutput ? (
              <AgentOutputViewer output={activeOutput} filenameBase={filenameBase} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-slate-950/80 rounded-lg border border-slate-900 text-slate-500">
                <Terminal size={32} className="opacity-20 mb-2" />
                <div>
                  {selectedNodeId
                    ? selectedNode?.status === 'pending'
                      ? t('task.output.waitingForNode')
                      : t('task.output.executing')
                    : t('task.output.selectNode')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
