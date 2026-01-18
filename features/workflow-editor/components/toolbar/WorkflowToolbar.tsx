"use client";

import { useState, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import {
  Save,
  FolderOpen,
  Download,
  Upload,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useWorkflowPersist } from "../../hooks";

interface WorkflowToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onLoad: (nodes: Node[], edges: Edge[]) => void;
  onClear: () => void;
}

export function WorkflowToolbar({
  nodes,
  edges,
  onLoad,
  onClear,
}: WorkflowToolbarProps) {
  const {
    workflowName,
    setWorkflowName,
    saveWorkflow,
    loadWorkflow,
    deleteWorkflow,
    savedWorkflows,
    exportWorkflow,
    importWorkflow,
    createNewWorkflow,
  } = useWorkflowPersist();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    saveWorkflow(nodes, edges);
    setIsMenuOpen(false);
  }, [nodes, edges, saveWorkflow]);

  const handleNew = useCallback(() => {
    createNewWorkflow();
    onClear();
    setIsMenuOpen(false);
  }, [createNewWorkflow, onClear]);

  const handleLoadWorkflow = useCallback(
    (id: string) => {
      const data = loadWorkflow(id);
      if (data) {
        onLoad(data.nodes, data.edges);
      }
      setShowSaved(false);
    },
    [loadWorkflow, onLoad],
  );

  const handleExport = useCallback(() => {
    const json = exportWorkflow(nodes, edges);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  }, [nodes, edges, exportWorkflow, workflowName]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        const data = importWorkflow(json);
        if (data) {
          onLoad(data.nodes, data.edges);
        }
      };
      reader.readAsText(file);
      e.target.value = ""; // Reset input
      setIsMenuOpen(false);
    },
    [importWorkflow, onLoad],
  );

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      {/* Workflow Name */}
      <input
        type="text"
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white
                   focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
        placeholder="Workflow name..."
      />

      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 
                     rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          File
          <ChevronDown className="w-3 h-3" />
        </button>

        {isMenuOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 
                          rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <button
              onClick={handleNew}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 
                         hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 
                         hover:bg-slate-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 
                         hover:bg-slate-700 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Open...
            </button>
            <div className="border-t border-slate-700 my-1" />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 
                         hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 
                         hover:bg-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import JSON
            </button>
          </div>
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

      {/* Saved Workflows Dropdown */}
      {showSaved && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSaved(false)}>
          <div
            className="absolute top-16 left-64 w-72 bg-slate-800 border border-slate-700 
                       rounded-lg shadow-xl p-2 max-h-80 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-slate-500 px-2 py-1 mb-1">
              Saved Workflows
            </div>
            {savedWorkflows.length === 0 ? (
              <div className="px-2 py-4 text-sm text-slate-400 text-center">
                No saved workflows
              </div>
            ) : (
              savedWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between px-2 py-2 rounded hover:bg-slate-700 
                             group cursor-pointer"
                  onClick={() => handleLoadWorkflow(wf.id)}
                >
                  <div>
                    <div className="text-sm text-white">{wf.name}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(wf.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkflow(wf.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 
                               hover:text-red-300 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Save Status */}
      <div className="text-xs text-slate-500 ml-auto">
        {nodes.length} nodes • {edges.length} connections
      </div>
    </div>
  );
}
