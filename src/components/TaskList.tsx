import { useStore } from '../store/useStore';
import { TaskItem } from './TaskItem';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { CreateTaskInput } from './CreateTaskInput';
import { isToday, isPast } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Task } from '../types';

export function TaskList() {
  const { tasks, activeTab, categories, clearCompletedTasks, clearHistory, reorderTasks } = useStore();
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
          <p className="text-[var(--muted-foreground)]">
            {activeTab === 'completed' || activeTab === 'history'
              ? `${completedTasks.length} tasks completed`
              : `${localIncompleteTasks.length} tasks remaining`}
          </p>
        </div>
        
        {(activeTab === 'completed' || activeTab === 'history') && filtered.length > 0 && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-[var(--destructive)]/10 text-[var(--destructive)] px-3 py-1.5 rounded-lg text-sm font-medium">
                <span>Are you sure?</span>
                <button onClick={handleClearAction} className="hover:underline font-bold">Yes</button>
                <button onClick={() => setShowClearConfirm(false)} className="hover:underline">No</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--destructive)]/10"
              >
                <Trash2 className="w-4 h-4" />
                {activeTab === 'history' ? 'Clear History' : 'Clear All'}
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab !== 'completed' && activeTab !== 'history' && <CreateTaskInput />}

      <div className="mt-8 flex-1 overflow-y-auto pb-20">
        <div className="space-y-2">
          <Reorder.Group axis="y" values={localIncompleteTasks} onReorder={handleReorder} className="space-y-2">
            <AnimatePresence mode="popLayout">
              {localIncompleteTasks.map((task) => (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <TaskItem task={task} />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {completedTasks.length > 0 && activeTab !== 'completed' && activeTab !== 'history' && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4 px-2">
              Completed
            </h3>
            <div className="space-y-2 opacity-60">
              <AnimatePresence mode="popLayout">
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskItem task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {completedTasks.length > 0 && (activeTab === 'completed' || activeTab === 'history') && (
           <div className="space-y-2">
           <AnimatePresence mode="popLayout">
             {completedTasks.map((task) => (
               <motion.div
                 key={task.id}
                 layout
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.2 }}
               >
                 <TaskItem task={task} />
               </motion.div>
             ))}
           </AnimatePresence>
         </div>
        )}
      </div>
    </div>
  );
}
