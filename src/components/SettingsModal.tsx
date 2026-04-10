import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Monitor, Palette, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsModal() {
  const { 
    isSettingsOpen, 
    setSettingsOpen, 
    themeMode, 
    setThemeMode, 
    colorTheme, 
    setColorTheme,
    historyRetentionDays,
    setHistoryRetentionDays
  } = useStore();

  if (!isSettingsOpen) return null;

  const themes: { id: typeof colorTheme; color: string; name: string }[] = [
    { id: 'blue', color: 'bg-blue-500', name: 'Blue' },
    { id: 'green', color: 'bg-emerald-500', name: 'Green' },
    { id: 'purple', color: 'bg-purple-500', name: 'Purple' },
    { id: 'orange', color: 'bg-orange-500', name: 'Orange' },
    { id: 'rose', color: 'bg-rose-500', name: 'Rose' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSettingsOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--background)] shadow-2xl border border-[var(--border)]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md px-6 py-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button onClick={() => setSettingsOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Appearance Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Appearance
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setThemeMode('light')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    themeMode === 'light' ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                  )}
                >
                  <Sun className={cn("w-5 h-5", themeMode === 'light' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
                  <span className={cn("text-xs font-medium", themeMode === 'light' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>Light</span>
                </button>
                <button 
                  onClick={() => setThemeMode('system')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    themeMode === 'system' ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                  )}
                >
                  <Monitor className={cn("w-5 h-5", themeMode === 'system' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
                  <span className={cn("text-xs font-medium", themeMode === 'system' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>System</span>
                </button>
                <button 
                  onClick={() => setThemeMode('dark')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    themeMode === 'dark' ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                  )}
                >
                  <Moon className={cn("w-5 h-5", themeMode === 'dark' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
                  <span className={cn("text-xs font-medium", themeMode === 'dark' ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>Dark</span>
                </button>
              </div>
            </div>

            {/* Color Theme Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color Theme
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    className={cn(
                      "group relative flex items-center justify-center w-12 h-12 rounded-full transition-all",
                      colorTheme === t.id ? "ring-2 ring-offset-2 ring-offset-[var(--background)] ring-[var(--primary)] scale-110" : "hover:scale-105"
                    )}
                  >
                    <div className={cn("w-full h-full rounded-full shadow-sm", t.color)} />
                  </button>
                ))}
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> History
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Retention Period (Days)</label>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Completed and overdue tasks older than this will be permanently deleted when you clear old history.
                </p>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={historyRetentionDays}
                  onChange={(e) => setHistoryRetentionDays(parseInt(e.target.value) || 30)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
