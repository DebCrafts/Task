import { Task } from '../types';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Check, Calendar, Flag, MoreVertical, Copy, Trash2, Bell, AlertCircle, ChevronRight, Clock, Share2 } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import { TaskDetailModal } from './TaskDetailModal';
import { motion, AnimatePresence } from 'motion/react';

export function TaskItem({ task }: { task: Task }) {
  const { toggleTaskCompletion, deleteTask, updateTask, duplicateTask, categories } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const reminderInputRef = useRef<HTMLInputElement>(null);

  const category = categories.find(c => c.id === task.categoryId);

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !task.completed;

  return (
    <>
      <motion.div 
        layout
        className={cn(
          "group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 glass-card",
          task.completed ? "opacity-60 shadow-none border-transparent" : "hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 active:scale-[0.99]"
        )}
      >
        <button
          onClick={() => toggleTaskCompletion(task.id)}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-300",
            task.completed 
              ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
              : "border-[var(--border)] hover:border-[var(--primary)] text-transparent bg-white/50"
          )}
        >
          <motion.div
            initial={false}
            animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <Check className="h-4.5 w-4.5" strokeWidth={4} />
          </motion.div>
        </button>

        <div 
          className="flex flex-1 flex-col cursor-pointer overflow-hidden py-0.5"
          onClick={() => setShowDetail(true)}
        >
          <span className={cn(
            "text-[15px] font-bold truncate transition-all duration-300",
            task.completed ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"
          )}>
            {task.title}
          </span>
          
          <div className="flex items-center gap-4 mt-1.5 text-[11px] font-bold tracking-wide uppercase">
            {task.dueDate && (
              <span className={cn("flex items-center gap-1.5", isOverdue ? "text-rose-500" : "text-[var(--muted-foreground)]")}>
                <Calendar className="h-3.5 w-3.5" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
            
            {task.priority !== 'low' && (
              <span className={cn(
                "flex items-center gap-1.5",
                task.priority === 'high' ? "text-orange-500" : "text-blue-500"
              )}>
                <Flag className="h-3.5 w-3.5 fill-current opacity-20" />
                {task.priority}
              </span>
            )}

            {category && (
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}

            {task.reminder && (
              <span className="flex items-center gap-1.5 text-[var(--primary)]">
                <Bell className="h-3.5 w-3.5 animate-pulse" />
              </span>
            )}

            {task.subtasks.length > 0 && (
              <span className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-current opacity-40" />
                  ))}
                </div>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (reminderInputRef.current) {
                reminderInputRef.current.showPicker();
              }
            }}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            title="Set Reminder"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
          <input 
            type="datetime-local" 
            ref={reminderInputRef}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onChange={(e) => {
              if (e.target.value) {
                updateTask(task.id, { reminder: new Date(e.target.value).toISOString() });
              }
            }}
          />

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-xl opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full z-20 mt-2 w-48 glass-card p-1.5 shadow-2xl rounded-2xl"
                >
                  <button
                    onClick={() => {
                      duplicateTask(task.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[var(--secondary)] transition-colors"
                  >
                    <Copy className="h-4.5 w-4.5 text-[var(--muted-foreground)]" /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
              onClick={() => setShowDeleteConfirm(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card p-8 shadow-2xl rounded-3xl border border-white/20"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)]">Delete Task?</h3>
                <p className="text-[var(--muted-foreground)] mt-2 font-medium">
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full py-3.5 text-sm font-bold rounded-2xl bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98]"
                >
                  Delete Task
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3.5 text-sm font-bold rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80 transition-all active:scale-[0.98]"
                >
                  Keep Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showDetail && (
        <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
