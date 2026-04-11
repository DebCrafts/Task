import { Task, Subtask } from '../types';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, Flag, Tag, Bell, Plus, Trash2, Check, Users, UserPlus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from './AuthProvider';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { updateTask, categories } = useStore();
  const { user } = useAuth();
  const [newSubtask, setNewSubtask] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [collaborators, setCollaborators] = useState<{uid: string, email: string, role: string}[]>([]);

  useEffect(() => {
    const fetchCollaborators = async () => {
      const collabs = [];
      for (const uid of task.sharedWithIds || []) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            collabs.push({ uid, email: userDoc.data().email, role: task.sharedWith[uid] });
          } else {
            collabs.push({ uid, email: 'Unknown', role: task.sharedWith[uid] });
          }
        } catch (e) {
          console.error(e);
        }
      }
      setCollaborators(collabs);
    };
    fetchCollaborators();
  }, [task.sharedWithIds, task.sharedWith]);

  const handleUpdate = (updates: Partial<Task>) => {
    updateTask(task.id, updates);
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    handleUpdate({
      subtasks: [...task.subtasks, { id: uuidv4(), title: newSubtask.trim(), completed: false }]
    });
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    handleUpdate({
      subtasks: task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    });
  };

  const deleteSubtask = (subtaskId: string) => {
    handleUpdate({
      subtasks: task.subtasks.filter(st => st.id !== subtaskId)
    });
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    
    alert("In a full production app, this would look up the user's UID by email. For now, please enter a User UID directly to share.");
    
    const uid = shareEmail.trim();
    
    const newSharedWith = { ...task.sharedWith, [uid]: 'edit' as const };
    const newSharedWithIds = [...(task.sharedWithIds || []), uid];
    
    handleUpdate({
      sharedWith: newSharedWith,
      sharedWithIds: newSharedWithIds
    });
    
    setShareEmail('');
  };

  const removeCollaborator = (uid: string) => {
    const newSharedWith = { ...task.sharedWith };
    delete newSharedWith[uid];
    const newSharedWithIds = (task.sharedWithIds || []).filter(id => id !== uid);
    
    handleUpdate({
      sharedWith: newSharedWith,
      sharedWithIds: newSharedWithIds
    });
  };

  const getLocalDatetime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const getLocalDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const canEdit = !task.ownerId || task.ownerId === 'local' || user?.uid === task.ownerId || task.sharedWith?.[user?.uid || ''] === 'edit';
  const isOwner = !task.ownerId || task.ownerId === 'local' || user?.uid === task.ownerId;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] glass-card shadow-2xl border border-white/20 flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Task Details</h2>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <button 
                  onClick={() => setShowShare(!showShare)}
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-300", 
                    showShare ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20" : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
                  )}
                  title="Share Task"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto">
            {showShare && isOwner && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-[var(--secondary)]/30 border border-[var(--border)] space-y-5"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--muted-foreground)]">
                  <UserPlus className="w-4 h-4" /> Share with others
                </h3>
                <form onSubmit={handleShare} className="flex gap-2">
                  <input
                    type="text"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter User UID..."
                    className="flex-1 text-sm font-semibold rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all"
                  />
                  <button type="submit" className="px-6 py-3 bg-gradient-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                    Invite
                  </button>
                </form>
                
                {collaborators.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold text-[var(--muted-foreground)]/60 uppercase tracking-widest">Active Collaborators</span>
                    <div className="grid gap-2">
                      {collaborators.map(c => (
                        <div key={c.uid} className="flex items-center justify-between text-sm bg-[var(--background)]/50 p-3 rounded-xl border border-[var(--border)]">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-xs font-bold">
                              {c.email[0].toUpperCase()}
                            </div>
                            <span className="truncate font-semibold">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md uppercase tracking-wider">{c.role}</span>
                            <button onClick={() => removeCollaborator(c.uid)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Title & Description */}
            <div className="space-y-4">
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                disabled={!canEdit}
                className="w-full text-3xl font-extrabold bg-transparent border-none focus:outline-none focus:ring-0 px-0 disabled:opacity-70 placeholder:text-[var(--muted-foreground)]/30"
                placeholder="Task title"
              />
              <textarea
                value={task.description || ''}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                disabled={!canEdit}
                placeholder="Add more details about this task..."
                className="w-full text-[15px] font-medium bg-transparent border-none focus:outline-none focus:ring-0 px-0 resize-none min-h-[100px] text-[var(--muted-foreground)] disabled:opacity-70 leading-relaxed"
              />
            </div>

            {/* Meta Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Due Date */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5" /> Due Date
                </label>
                <input
                  type="date"
                  value={getLocalDate(task.dueDate)}
                  onChange={(e) => handleUpdate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  disabled={!canEdit}
                  className="w-full text-sm font-bold rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50 px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all disabled:opacity-70"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </label>
                <div className="flex w-full rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50 p-1.5">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleUpdate({ priority: p })}
                      className={cn(
                        "flex-1 text-[10px] py-2.5 rounded-xl font-bold transition-all uppercase tracking-wider disabled:opacity-70",
                        task.priority === p 
                          ? p === 'high' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" :
                            p === 'medium' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" :
                            "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <div className="relative">
                  <select
                    value={task.categoryId || ''}
                    onChange={(e) => handleUpdate({ categoryId: e.target.value || undefined })}
                    disabled={!canEdit}
                    className="w-full appearance-none text-sm font-bold rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50 px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all disabled:opacity-70"
                  >
                    <option value="">No Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]">
                    <Tag className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Reminder */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" /> Reminder
                </label>
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={getLocalDatetime(task.reminder)}
                    onChange={(e) => handleUpdate({ reminder: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    disabled={!canEdit}
                    className="w-full text-sm font-bold rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50 px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all disabled:opacity-70"
                  />
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setHours(d.getHours() + 1);
                          handleUpdate({ reminder: d.toISOString() });
                        }}
                        className="text-[10px] font-bold px-3 py-2 rounded-xl bg-[var(--secondary)]/50 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all border border-transparent hover:border-[var(--primary)]/20"
                      >
                        +1 Hour
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          d.setHours(9, 0, 0, 0);
                          handleUpdate({ reminder: d.toISOString() });
                        }}
                        className="text-[10px] font-bold px-3 py-2 rounded-xl bg-[var(--secondary)]/50 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all border border-transparent hover:border-[var(--primary)]/20"
                      >
                        Tomorrow 9 AM
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="pt-8 border-t border-[var(--border)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Subtasks</h3>
                {canEdit && task.subtasks.some(st => st.completed) && (
                  <button 
                    onClick={() => handleUpdate({ subtasks: task.subtasks.filter(st => !st.completed) })}
                    className="text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Clear completed
                  </button>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                <AnimatePresence mode="popLayout">
                  {task.subtasks.map(subtask => (
                    <motion.div 
                      key={subtask.id} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 group bg-[var(--secondary)]/20 p-3 rounded-2xl border border-transparent hover:border-[var(--border)] transition-all"
                    >
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => canEdit && toggleSubtask(subtask.id)}
                        disabled={!canEdit}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300",
                          subtask.completed 
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "border-[var(--border)] hover:border-[var(--primary)] text-transparent bg-white/50",
                          !canEdit && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={4} />
                      </motion.button>
                      <span className={cn("text-sm font-semibold flex-1 transition-all duration-300", subtask.completed && "line-through text-[var(--muted-foreground)]")}>
                        {subtask.title}
                      </span>
                      {canEdit && (
                        <button 
                          onClick={() => deleteSubtask(subtask.id)}
                          className="p-2 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {canEdit && (
                <form onSubmit={addSubtask} className="flex items-center gap-3 bg-[var(--secondary)]/50 p-4 rounded-2xl border border-dashed border-[var(--border)] focus-within:border-[var(--primary)] focus-within:bg-[var(--primary)]/5 transition-all">
                  <Plus className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a new subtask..."
                    className="flex-1 text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 px-0 placeholder:text-[var(--muted-foreground)]/40"
                  />
                  <button 
                    type="submit" 
                    disabled={!newSubtask.trim()}
                    className="text-[var(--primary)] disabled:opacity-30 font-bold text-sm px-2"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
