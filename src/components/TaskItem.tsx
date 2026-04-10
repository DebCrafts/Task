import { Task } from '../types';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Check, Calendar, Flag, MoreVertical, Copy, Trash2, Bell, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { TaskDetailModal } from './TaskDetailModal';

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
      <div 
        className={cn(
          "group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          task.completed && "bg-[var(--secondary)]/50 hover:translate-y-0 hover:shadow-sm"
        )}
      >
        <button
          onClick={() => toggleTaskCompletion(task.id)}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            task.completed 
              ? "border-[var(--primary)] bg-[var(--primary)] text-white" 
              : "border-[var(--muted-foreground)] hover:border-[var(--primary)] text-transparent"
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>

        <div 
          className="flex flex-1 flex-col cursor-pointer overflow-hidden"
          onClick={() => setShowDetail(true)}
        >
          <span className={cn(
            "text-sm font-medium truncate transition-all",
            task.completed && "text-[var(--muted-foreground)] line-through"
          )}>
            {task.title}
          </span>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
            {task.dueDate && (
              <span className={cn("flex items-center gap-1", isOverdue && "text-[var(--destructive)] font-medium")}>
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
            
            {task.priority !== 'low' && (
              <span className={cn(
                "flex items-center gap-1",
                task.priority === 'high' ? "text-orange-500" : "text-blue-500"
              )}>
                <Flag className="h-3 w-3" />
                {task.priority}
              </span>
            )}

            {category && (
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}

            {task.reminder && (
              <span className="flex items-center gap-1 text-[var(--primary)]">
                <Bell className="h-3 w-3" />
              </span>
            )}

            {task.subtasks.length > 0 && (
              <span className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                </div>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-1">
          <button
            onClick={() => {
              if (reminderInputRef.current) {
                reminderInputRef.current.showPicker();
              }
            }}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            title="Set Reminder"
          >
            <Bell className="h-4 w-4" />
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
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 shadow-lg">
                <button
                  onClick={() => {
                    duplicateTask(task.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--secondary)]"
                >
                  <Copy className="h-4 w-4" /> Duplicate
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[var(--background)] p-6 shadow-2xl border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4 text-[var(--destructive)]">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Delete Task</h3>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTask(task.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
