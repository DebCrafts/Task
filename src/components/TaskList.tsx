import { useStore } from '../store/useStore';
import { TaskItem } from './TaskItem';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { CreateTaskInput } from './CreateTaskInput';
import { isToday, isPast } from 'date-fns';
import { Trash2, CheckCircle2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { useAuth } from './AuthProvider';

export function TaskList() {
  const { tasks, activeTab, categories, clearCompletedTasks, clearHistory, reorderTasks } = useStore();
  const { profile } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [localIncompleteTasks, setLocalIncompleteTasks] = useState<Task[]>([]);

  const getFilteredTasks = () => {
    let filtered = tasks;
    let title = 'Inbox';

    if (activeTab === 'today') {
      filtered = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));
      title = 'Today';
    } else if (activeTab === 'completed') {
      filtered = tasks.filter(t => t.completed);
      title = 'Completed';
    } else if (activeTab === 'history') {
      filtered = tasks.filter(t => t.completed || (t.dueDate && isPast(new Date(t.dueDate))));
      title = 'History';
    } else if (activeTab.startsWith('cat-')) {
      const catId = activeTab.replace('cat-', '');
      filtered = tasks.filter(t => t.categoryId === catId);
      title = categories.find(c => c.id === catId)?.name || 'Category';
    } else {
      // Inbox
      filtered = tasks.filter(t => !t.completed);
      title = 'Inbox';
    }

    return { filtered, title };
  };

  const { filtered, title } = getFilteredTasks();
  
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const incompleteTasks = sortedFiltered.filter(t => !t.completed);
  const completedTasks = sortedFiltered.filter(t => t.completed);

  useEffect(() => {
    setLocalIncompleteTasks(incompleteTasks);
  }, [tasks, activeTab]); // Update local state when tasks or tab changes

  const handleClearAction = () => {
    if (activeTab === 'history') {
      clearHistory();
    } else {
      clearCompletedTasks();
    }
    setShowClearConfirm(false);
  };

  const handleReorder = (newOrder: Task[]) => {
    setLocalIncompleteTasks(newOrder);
    reorderTasks(newOrder);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-10 flex items-end justify-between">
        <div className="space-y-1">
          {activeTab === 'inbox' && profile?.displayName && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold text-[var(--primary)] uppercase tracking-widest"
            >
              Welcome back, {profile.displayName.split(' ')[0]}
            </motion.p>
          )}
          <h2 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">{title}</h2>
          <p className="text-[var(--muted-foreground)] font-medium">
            {activeTab === 'completed' || activeTab === 'history'
              ? `${completedTasks.length} tasks completed`
              : `${localIncompleteTasks.length} tasks remaining`}
          </p>
        </div>
        
        {(activeTab === 'completed' || activeTab === 'history') && filtered.length > 0 && (
          <div className="relative pb-1">
            {showClearConfirm ? (
              <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in zoom-in duration-200">
                <span className="text-[var(--destructive)]">Clear all?</span>
                <div className="flex gap-2">
                  <button onClick={handleClearAction} className="text-[var(--destructive)] hover:underline">Yes</button>
                  <button onClick={() => setShowClearConfirm(false)} className="text-[var(--muted-foreground)] hover:underline">No</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all px-4 py-2.5 rounded-xl hover:bg-[var(--destructive)]/10 border border-transparent hover:border-[var(--destructive)]/20"
              >
                <Trash2 className="w-4 h-4" />
                {activeTab === 'history' ? 'Clear History' : 'Clear All'}
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab !== 'completed' && activeTab !== 'history' && (
        <div className="mb-10">
          <CreateTaskInput />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2">
        <div className="space-y-3">
          <Reorder.Group axis="y" values={localIncompleteTasks} onReorder={handleReorder} className="space-y-3">
            <AnimatePresence mode="popLayout">
              {localIncompleteTasks.map((task) => (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="relative"
                >
                  <TaskItem task={task} />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {completedTasks.length > 0 && activeTab !== 'completed' && activeTab !== 'history' && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest whitespace-nowrap">
                Completed
              </h3>
              <div className="h-[1px] w-full bg-[var(--border)]" />
            </div>
            <div className="space-y-3 opacity-60 grayscale-[0.5]">
              <AnimatePresence mode="popLayout">
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TaskItem task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {completedTasks.length > 0 && (activeTab === 'completed' || activeTab === 'history') && (
           <div className="space-y-3">
           <AnimatePresence mode="popLayout">
             {completedTasks.map((task) => (
               <motion.div
                 key={task.id}
                 layout
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.3 }}
               >
                 <TaskItem task={task} />
               </motion.div>
             ))}
           </AnimatePresence>
         </div>
        )}

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-[var(--secondary)] flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[var(--muted-foreground)]/30" />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">All caught up!</h3>
            <p className="text-[var(--muted-foreground)] max-w-xs">
              No tasks found for this view. Enjoy your free time or create a new task.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
