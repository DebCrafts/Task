import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { 
  CheckCircle2, 
  Calendar, 
  Inbox, 
  Settings, 
  Plus, 
  X,
  Circle,
  LogOut,
  LogIn,
  AlertCircle,
  Trash2,
  History,
  Flag
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { loginWithGoogle, logout } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { categories, activeTab, setActiveTab, setSettingsOpen, addCategory, deleteCategory } = useStore();
  const { user, profile, error, setError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPriority, setNewCategoryPriority] = useState<'low' | 'medium' | 'high'>('low');

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // User intentionally closed the popup, no need to show an error
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized for sign-in. Please add your Vercel URL to the 'Authorized Domains' list in the Firebase Console (Authentication > Settings).");
      } else {
        setError(err?.message || "Failed to sign in.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    // Pick a random color for the new category
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#06b6d4', '#3b82f6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addCategory({
      name: newCategoryName.trim(),
      color: randomColor,
      priority: newCategoryPriority,
    });
    
    setNewCategoryName('');
    setNewCategoryPriority('low');
    setIsCreatingCategory(false);
  };

  return (
    <div className="flex h-full flex-col py-8">
      <div className="flex items-center justify-between px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-gradient">TaskFlow</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] md:hidden rounded-full hover:bg-[var(--secondary)] transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-gradient-primary text-white shadow-md shadow-indigo-500/10 scale-[1.02]" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/50 hover:text-[var(--foreground)]"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[var(--muted-foreground)]")} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)]/60">
              Categories
            </h3>
            <button 
              onClick={() => setIsCreatingCategory(!isCreatingCategory)}
              className="p-1.5 rounded-full text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1.5">
            {categories.map((category) => (
              <div key={category.id} className="group relative flex items-center">
                <button
                  onClick={() => {
                    setActiveTab(`cat-${category.id}`);
                    if (onClose) onClose();
                  }}
                  className={cn(
                    "flex flex-1 items-start gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    activeTab === `cat-${category.id}`
                      ? "bg-[var(--secondary)] text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/50 hover:text-[var(--foreground)]"
                  )}
                >
                  <div 
                    className="w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: category.color }} 
                  />
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="truncate">{category.name}</span>
                    {category.priority && (
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                        <span className={cn(
                          "text-[10px] font-bold overflow-hidden leading-tight opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 mt-0.5",
                          category.priority === 'high' ? "text-orange-500" :
                          category.priority === 'medium' ? "text-blue-500" :
                          "text-emerald-500"
                        )}>
                          {category.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="absolute right-3 p-1.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:text-[var(--destructive)] transition-all hover:bg-[var(--destructive)]/10 rounded-full"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {isCreatingCategory && (
              <form onSubmit={handleCreateCategory} className="mx-2 p-3 space-y-3 glass-card rounded-2xl animate-in fade-in zoom-in duration-200">
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className="w-full text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--primary)] focus:outline-none py-1.5 px-1 transition-colors"
                />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex bg-[var(--secondary)]/50 rounded-lg p-0.5 border border-[var(--border)]">
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewCategoryPriority(p)}
                          className={cn(
                            "text-[9px] px-2.5 py-1.5 rounded-md font-bold transition-all uppercase tracking-wider",
                            newCategoryPriority === p 
                              ? p === 'high' ? "bg-orange-500 text-white shadow-md" :
                                p === 'medium' ? "bg-blue-500 text-white shadow-md" :
                                "bg-emerald-500 text-white shadow-md"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          )}
                        >
                          {p === 'medium' ? 'Med' : p}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setIsCreatingCategory(false)} className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <button type="submit" disabled={!newCategoryName.trim()} className="p-1.5 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-colors disabled:opacity-30">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto px-6 pt-6 border-t border-[var(--border)] space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)] text-xs border border-[var(--destructive)]/20 animate-in slide-in-from-bottom-2 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 p-0.5 hover:bg-[var(--destructive)]/10 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        {user ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-card">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-[var(--background)] shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {profile?.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--background)] shadow-sm" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate text-[var(--foreground)]">{profile?.displayName}</span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-medium">Active Now</span>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-full transition-all">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-primary px-4 py-3.5 text-sm font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            {isLoggingIn ? 'Signing In...' : 'Sign In with Google'}
          </button>
        )}
        
        <button
          onClick={() => {
            setSettingsOpen(true);
            if (onClose) onClose();
          }}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/50 hover:text-[var(--foreground)] transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </div>
  );
}
