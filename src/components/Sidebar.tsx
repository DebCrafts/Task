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
  History
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { loginWithGoogle, logout } from '../lib/firebase';

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
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
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
    <div className="flex h-full flex-col py-6">
      <div className="flex items-center justify-between px-6 mb-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-[var(--primary)]" />
          <span className="text-xl font-semibold tracking-tight">TaskFlow</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-[var(--muted-foreground)] md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Categories
            </h3>
            <button 
              onClick={() => setIsCreatingCategory(!isCreatingCategory)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id} className="group relative flex items-center">
                <button
                  onClick={() => setActiveTab(`cat-${category.id}`)}
                  className={cn(
                    "flex flex-1 items-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === `cat-${category.id}`
                      ? "bg-[var(--secondary)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Circle className="w-3 h-3 mt-1 shrink-0" style={{ color: category.color, fill: category.color }} />
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="truncate">{category.name}</span>
                    {category.priority && (
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-200 ease-in-out">
                        <span className={cn(
                          "text-[10px] overflow-hidden leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75",
                          category.priority === 'high' ? "text-orange-500" :
                          category.priority === 'medium' ? "text-blue-500" :
                          "text-[var(--primary)]"
                        )}>
                          {category.priority.charAt(0).toUpperCase() + category.priority.slice(1)} Priority
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="absolute right-2 p-1 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:text-[var(--destructive)] transition-all"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {isCreatingCategory && (
              <form onSubmit={handleCreateCategory} className="px-3 py-2 space-y-2 bg-[var(--secondary)]/30 rounded-lg">
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className="w-full text-sm bg-transparent border-b border-[var(--primary)] focus:outline-none py-1"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex bg-[var(--background)] rounded-md p-0.5 border border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setNewCategoryPriority('high')}
                        className={cn(
                          "text-[10px] px-2 py-1 rounded-sm font-medium transition-colors",
                          newCategoryPriority === 'high' ? "bg-orange-500 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        High
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCategoryPriority('medium')}
                        className={cn(
                          "text-[10px] px-2 py-1 rounded-sm font-medium transition-colors",
                          newCategoryPriority === 'medium' ? "bg-blue-500 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        Med
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCategoryPriority('low')}
                        className={cn(
                          "text-[10px] px-2 py-1 rounded-sm font-medium transition-colors",
                          newCategoryPriority === 'low' ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        Low
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setIsCreatingCategory(false)} className="p-1 hover:text-[var(--destructive)]">
                        <X className="w-3 h-3" />
                      </button>
                      <button type="submit" disabled={!newCategoryName.trim()} className="p-1 hover:text-[var(--primary)] disabled:opacity-50">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 pt-4 border-t border-[var(--border)] space-y-2">
        {error && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {user ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--secondary)]/50">
            <div className="flex items-center gap-2 overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
                  {profile?.displayName?.[0] || 'U'}
                </div>
              )}
              <span className="text-sm font-medium truncate">{profile?.displayName}</span>
            </div>
            <button onClick={logout} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-70"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? 'Signing In...' : 'Sign In'}
          </button>
        )}
        <button
          onClick={() => {
            setSettingsOpen(true);
            if (onClose) onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
