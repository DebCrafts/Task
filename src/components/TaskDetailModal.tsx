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
    // Load collaborator emails (in a real app, we'd query users collection, but for simplicity we might just show IDs or need a cloud function.
    // Let's just show IDs for now, or fetch user profiles if we have them.)
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
    
    // In a real app, we'd look up the user by email via a Cloud Function.
    // For this demo, we'll just alert that this requires a backend function to resolve email to UID,
    // OR we can simulate it if we had a users collection we could query (but we can't query by email without an index or rules allowing it).
    alert("In a full production app, this would look up the user's UID by email. For now, please enter a User UID directly to share.");
    
    const uid = shareEmail.trim(); // Treating input as UID for demo purposes
    
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--background)] shadow-2xl border border-[var(--border)]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md px-6 py-4">
            <h2 className="text-lg font-semibold">Task Details</h2>
            <div className="flex items-center gap-2">
              {isOwner && (
                <button 
                  onClick={() => setShowShare(!showShare)}
                  className={cn("p-2 rounded-full transition-colors", showShare ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)]")}
                  title="Share Task"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[var(--secondary)] text-[var(--muted-foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {showShare && isOwner && (
              <div className="p-4 rounded-xl bg-[var(--secondary)]/50 border border-[var(--border)] space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Share Task
                </h3>
                <form onSubmit={handleShare} className="flex gap-2">
                  <input
                    type="text"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter User UID to share..."
                    className="flex-1 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 focus:outline-none focus:border-[var(--primary)]"
                  />
                  <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors">
                    Invite
                  </button>
                </form>
                
                {collaborators.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Collaborators</span>
                    {collaborators.map(c => (
                      <div key={c.uid} className="flex items-center justify-between text-sm bg-[var(--background)] p-2 rounded-lg border border-[var(--border)]">
                        <span className="truncate">{c.email}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-[var(--secondary)] rounded-md">{c.role}</span>
                          <button onClick={() => removeCollaborator(c.uid)} className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10 p-1 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Description */}
            <div className="space-y-4">
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                disabled={!canEdit}
                className="w-full text-xl font-medium bg-transparent border-none focus:outline-none focus:ring-0 px-0 disabled:opacity-70"
                placeholder="Task title"
              />
              <textarea
                value={task.description || ''}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                disabled={!canEdit}
                placeholder="Add a description..."
                className="w-full text-sm bg-transparent border-none focus:outline-none focus:ring-0 px-0 resize-none min-h-[80px] text-[var(--muted-foreground)] disabled:opacity-70"
              />
            </div>

            {/* Meta Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> Due Date
                </label>
                <input
                  type="date"
                  value={getLocalDate(task.dueDate)}
                  onChange={(e) => handleUpdate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  disabled={!canEdit}
                  className="w-full text-sm rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 focus:outline-none focus:border-[var(--primary)] disabled:opacity-70"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </label>
                <div className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-1">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleUpdate({ priority: 'high' })}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors disabled:opacity-70",
                      task.priority === 'high' ? "bg-orange-500 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleUpdate({ priority: 'medium' })}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors disabled:opacity-70",
                      task.priority === 'medium' ? "bg-blue-500 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleUpdate({ priority: 'low' })}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors disabled:opacity-70",
                      task.priority === 'low' ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    Low
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <select
                  value={task.categoryId || ''}
                  onChange={(e) => handleUpdate({ categoryId: e.target.value || undefined })}
                  disabled={!canEdit}
                  className="w-full text-sm rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 focus:outline-none focus:border-[var(--primary)] disabled:opacity-70"
                >
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Reminder */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Reminder
                </label>
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={getLocalDatetime(task.reminder)}
                    onChange={(e) => handleUpdate({ reminder: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    disabled={!canEdit}
                    className="w-full text-sm rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 focus:outline-none focus:border-[var(--primary)] disabled:opacity-70"
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
                        className="text-xs px-2 py-1 rounded bg-[var(--secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
                      >
                        +1 Hour
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          d.setHours(9, 0, 0, 0); // 9 AM tomorrow
                          handleUpdate({ reminder: d.toISOString() });
                        }}
                        className="text-xs px-2 py-1 rounded bg-[var(--secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
                      >
                        Tomorrow 9 AM
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Subtasks</h3>
                {canEdit && task.subtasks.some(st => st.completed) && (
                  <button 
                    onClick={() => handleUpdate({ subtasks: task.subtasks.filter(st => !st.completed) })}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                  >
                    Clear completed
                  </button>
                )}
              </div>
              
              <div className="space-y-2 mb-3">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 group">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => canEdit && toggleSubtask(subtask.id)}
                      disabled={!canEdit}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        subtask.completed 
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white" 
                          : "border-[var(--muted-foreground)] hover:border-[var(--primary)] text-transparent",
                        !canEdit && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </motion.button>
                    <span className={cn("text-sm flex-1 transition-all", subtask.completed && "line-through text-[var(--muted-foreground)]")}>
                      {subtask.title}
                    </span>
                    {canEdit && (
                      <button 
                        onClick={() => deleteSubtask(subtask.id)}
                        className="p-1 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:text-[var(--destructive)] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canEdit && (
                <form onSubmit={addSubtask} className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask"
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 px-0"
                  />
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
