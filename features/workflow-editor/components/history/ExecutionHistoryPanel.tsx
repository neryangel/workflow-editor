'use client';

import { useState, useRef } from 'react';
import {
  History,
  X,
  Play,
  Trash2,
  Download,
  Upload,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useExecutionHistory } from '../../hooks/useExecutionHistory';
import { Node, Edge } from '@xyflow/react';

export interface ExecutionHistoryPanelProps {
  onReplay?: (nodes: Node[], edges: Edge[], variables?: Record<string, string | number | boolean>) => void;
}

export function ExecutionHistoryPanel({ onReplay }: ExecutionHistoryPanelProps) {
  const {
    filteredHistory,
    currentFilter,
    setFilter,
    deleteExecution,
    clearHistory,
    replayExecution,
    getStats,
    exportHistory,
    importHistory,
  } = useExecutionHistory();

  const [isOpen, setIsOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = getStats();

  const handleReplay = (id: string) => {
    const replay = replayExecution(id);
    if (replay && onReplay) {
      onReplay(replay.nodes as Node[], replay.edges as Edge[], replay.variables);
      setIsOpen(false);
    }
  };

  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'execution-history.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      importHistory(json);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40
          flex items-center gap-2 px-3 py-4 rounded-r-lg
          bg-gradient-to-r from-blue-600 to-indigo-600
          text-white text-sm font-medium
          hover:from-blue-500 hover:to-indigo-500
          transition-all duration-200 shadow-lg`}
        title="Execution History"
      >
        <History className="w-4 h-4" />
        <span className="text-xs">{filteredHistory.length}</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-slate-900 border-r border-slate-700 z-50 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between bg-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-medium">Execution History</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2 bg-slate-800/50">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500
                text-white text-xs rounded transition-colors"
              title="Statistics"
            >
              <TrendingUp className="w-3 h-3" />
              Stats
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600
                text-slate-300 text-xs rounded transition-colors"
              title="Filters"
            >
              <Filter className="w-3 h-3" />
              Filter
            </button>

            <div className="flex-1" />

            <button
              onClick={handleExport}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Export History"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleImport}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Import History"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={clearHistory}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Panel */}
          {showStats && (
            <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Total</div>
                  <div className="text-white font-semibold">{stats.totalExecutions}</div>
                </div>
                <div>
                  <div className="text-slate-400">Success Rate</div>
                  <div className="text-white font-semibold">{stats.successRate.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-slate-400">Avg Duration</div>
                  <div className="text-white font-semibold">{formatDuration(stats.avgDuration)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 space-y-2">
              <select
                value={currentFilter.status || 'all'}
                onChange={(e) => setFilter({ ...currentFilter, status: e.target.value as any })}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                  text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                type="text"
                value={currentFilter.search || ''}
                onChange={(e) => setFilter({ ...currentFilter, search: e.target.value })}
                placeholder="Search by name or error..."
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                  text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Execution List */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No executions yet</p>
                <p className="text-xs mt-1">Run a workflow to see history</p>
              </div>
            ) : (
              filteredHistory.map((execution) => (
                <div
                  key={execution.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-3
                    hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="text-sm text-white font-medium">
                          {execution.workflowName || 'Unnamed Workflow'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDate(execution.timestamp)}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border ${getStatusColor(execution.status)}`}
                    >
                      {formatDuration(execution.duration)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div>
                      {execution.nodes.length} nodes • {execution.edges.length} connections
                    </div>
                    {execution.variables && Object.keys(execution.variables).length > 0 && (
                      <div>{Object.keys(execution.variables).length} variables</div>
                    )}
                    {execution.error && (
                      <div className="text-red-400 mt-1 truncate" title={execution.error}>
                        Error: {execution.error}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => handleReplay(execution.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500
                        text-white text-xs rounded transition-colors flex-1"
                    >
                      <Play className="w-3 h-3" />
                      Replay
                    </button>

                    <button
                      onClick={() => deleteExecution(execution.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </>
  );
}
