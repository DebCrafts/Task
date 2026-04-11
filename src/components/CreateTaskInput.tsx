import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
    <div className="relative group">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <button 
          type="submit" 
          disabled={!title.trim()}
          className={cn(
            "absolute left-4 flex items-center justify-center transition-all duration-300 z-10 p-1.5 rounded-lg",
            title.trim() ? "text-[var(--primary)] bg-[var(--primary)]/10 scale-110" : "text-[var(--muted-foreground)]"
          )}
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full rounded-2xl border border-[var(--border)] glass-card py-4.5 pl-14 pr-6 text-[15px] font-semibold shadow-lg shadow-indigo-500/5 transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/5 placeholder:text-[var(--muted-foreground)]/50"
        />
        <div className="absolute right-4 hidden md:flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)]/40 bg-[var(--secondary)] px-2 py-1 rounded-md border border-[var(--border)]">ENTER</span>
        </div>
      </form>
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute -bottom-10 left-4 flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/5 px-3 py-1.5 rounded-full border border-[var(--primary)]/10"
          >
            <CheckCircle2 className="w-4 h-4" /> Task added to your list
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
