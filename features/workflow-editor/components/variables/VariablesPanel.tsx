'use client';

import { useState, useRef } from 'react';
import {
  Variable as VariableIcon,
  Plus,
  X,
  Edit2,
  Check,
  Download,
  Upload,
  FolderOpen,
  Save,
  Trash2,
} from 'lucide-react';
import { useVariables } from '../../hooks/useVariables';
import { VariableType } from '../../types';

export function VariablesPanel() {
  const {
    variables,
    addVariable,
    updateVariable,
    removeVariable,
    variableSets,
    activeSetId,
    createVariableSet,
    loadVariableSet,
    deleteVariableSet,
    exportVariableSet,
    importVariableSet,
  } = useVariables();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showSetManager, setShowSetManager] = useState(false);

  // New variable form state
  const [newVarName, setNewVarName] = useState('');
  const [newVarType, setNewVarType] = useState<VariableType>('text');
  const [newVarValue, setNewVarValue] = useState<string | number | boolean>('');
  const [newVarDescription, setNewVarDescription] = useState('');

  // Edit state
  const [editValue, setEditValue] = useState<string | number | boolean>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVariable = () => {
    if (!newVarName || newVarValue === '') return;

    addVariable(newVarName, newVarType, newVarValue, newVarDescription);

    // Reset form
    setNewVarName('');
    setNewVarValue('');
    setNewVarDescription('');
    setShowNewForm(false);
  };

  const handleStartEdit = (variable: any) => {
    setEditingId(variable.id);
    setEditValue(variable.value);
  };

  const handleSaveEdit = (id: string) => {
    updateVariable(id, { value: editValue });
    setEditingId(null);
  };

  const handleExportSet = () => {
    if (!activeSetId) return;
    const json = exportVariableSet(activeSetId);
    if (!json) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'variables.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSet = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      importVariableSet(json);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getTypeColor = (type: VariableType) => {
    const colors = {
      text: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      number: 'bg-green-500/20 text-green-300 border-green-500/30',
      boolean: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      image: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      video: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      audio: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return colors[type] || colors.text;
  };

  const activeSet = variableSets.find(s => s.id === activeSetId);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40
          flex items-center gap-2 px-3 py-4 rounded-l-lg
          bg-gradient-to-l from-violet-600 to-purple-600
          text-white text-sm font-medium
          hover:from-violet-500 hover:to-purple-500
          transition-all duration-200 shadow-lg
          ${isOpen ? 'translate-x-0' : 'translate-x-0'}`}
        title="Variables Panel"
      >
        <VariableIcon className="w-4 h-4" />
        <span className="text-xs">
          {variables.length}
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700 z-50 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between bg-slate-800">
            <div className="flex items-center gap-2">
              <VariableIcon className="w-5 h-5 text-violet-400" />
              <h2 className="text-white font-medium">Variables</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Set Info */}
          {activeSet && (
            <div className="px-4 py-2 bg-violet-500/10 border-b border-violet-500/20">
              <div className="text-xs text-violet-300 font-medium">{activeSet.name}</div>
              {activeSet.description && (
                <div className="text-xs text-slate-400 mt-0.5">{activeSet.description}</div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2 bg-slate-800/50">
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-1 px-2 py-1 bg-violet-600 hover:bg-violet-500
                text-white text-xs rounded transition-colors"
              title="Add Variable"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>

            <button
              onClick={() => setShowSetManager(!showSetManager)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600
                text-slate-300 text-xs rounded transition-colors"
              title="Manage Sets"
            >
              <FolderOpen className="w-3 h-3" />
              Sets
            </button>

            <div className="flex-1" />

            <button
              onClick={handleExportSet}
              disabled={!activeSetId}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30
                disabled:cursor-not-allowed transition-colors"
              title="Export Set"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleImportSet}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Import Set"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {/* New Variable Form */}
          {showNewForm && (
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 space-y-2">
              <input
                type="text"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                placeholder="Variable name"
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                  text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />

              <select
                value={newVarType}
                onChange={(e) => setNewVarType(e.target.value as VariableType)}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                  text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="image">Image URL</option>
                <option value="video">Video URL</option>
                <option value="audio">Audio URL</option>
              </select>

              <input
                type={newVarType === 'number' ? 'number' : 'text'}
                value={String(newVarValue)}
                onChange={(e) => {
                  if (newVarType === 'number') {
                    setNewVarValue(parseFloat(e.target.value) || 0);
                  } else if (newVarType === 'boolean') {
                    setNewVarValue(e.target.value === 'true');
                  } else {
                    setNewVarValue(e.target.value);
                  }
                }}
                placeholder="Value"
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                  text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />

              <input
                type="text"
                value={newVarDescription}
                onChange={(e) => setNewVarDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                  text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleAddVariable}
                  className="flex-1 px-2 py-1 bg-violet-600 hover:bg-violet-500
                    text-white text-xs rounded transition-colors"
                >
                  Add Variable
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600
                    text-slate-300 text-xs rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Variables List */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {variables.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <VariableIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No variables yet</p>
                <p className="text-xs mt-1">Click &quot;Add&quot; to create one</p>
              </div>
            ) : (
              variables.map((variable) => (
                <div
                  key={variable.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-3
                    hover:border-violet-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-violet-300 font-mono">
                          {`{${variable.name}}`}
                        </code>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getTypeColor(variable.type)}`}>
                          {variable.type}
                        </span>
                      </div>
                      {variable.description && (
                        <div className="text-xs text-slate-400 mt-1">{variable.description}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {editingId === variable.id ? (
                        <button
                          onClick={() => handleSaveEdit(variable.id)}
                          className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(variable)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => removeVariable(variable.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingId === variable.id ? (
                    <input
                      type={variable.type === 'number' ? 'number' : 'text'}
                      value={String(editValue)}
                      onChange={(e) => {
                        if (variable.type === 'number') {
                          setEditValue(parseFloat(e.target.value) || 0);
                        } else if (variable.type === 'boolean') {
                          setEditValue(e.target.value === 'true');
                        } else {
                          setEditValue(e.target.value);
                        }
                      }}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded
                        text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  ) : (
                    <div className="text-sm text-white font-mono bg-slate-900 px-2 py-1 rounded
                      border border-slate-700 break-all">
                      {String(variable.value)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Set Manager Modal */}
          {showSetManager && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md max-h-[80%] flex flex-col">
                <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-white font-medium">Variable Sets</h3>
                  <button
                    onClick={() => setShowSetManager(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-2">
                  <button
                    onClick={() => {
                      const name = prompt('Enter set name:');
                      if (name) {
                        createVariableSet(name);
                        setShowSetManager(false);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2
                      bg-violet-600 hover:bg-violet-500 text-white text-sm rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Set
                  </button>

                  {variableSets.map((set) => (
                    <div
                      key={set.id}
                      className={`flex items-center justify-between p-3 rounded border
                        ${set.id === activeSetId
                          ? 'bg-violet-500/20 border-violet-500'
                          : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                        } transition-colors`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          loadVariableSet(set.id);
                          setShowSetManager(false);
                        }}
                      >
                        <div className="text-sm text-white font-medium">{set.name}</div>
                        <div className="text-xs text-slate-400">
                          {set.variables.length} variables
                        </div>
                      </div>

                      {set.id !== activeSetId && (
                        <button
                          onClick={() => deleteVariableSet(set.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
