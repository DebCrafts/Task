import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CreateTaskInput() {
  const [title, setTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { addTask } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    addTask({
      title: title.trim(),
      completed: false,
      priority: 'low',
      subtasks: [],
    });
    setTitle('');
    
    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <button 
          type="submit" 
          className="absolute left-3 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors z-10"
        >
          <Plus className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </form>
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-0 flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Task added successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
