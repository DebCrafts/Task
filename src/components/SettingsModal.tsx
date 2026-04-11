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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSettingsOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] glass-card shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary)] flex items-center justify-center">
                <Palette className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Settings</h2>
            </div>
            <button onClick={() => setSettingsOpen(false)} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-10">
            {/* Appearance Section */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Appearance
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'system', 'dark'] as const).map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => setThemeMode(mode)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                      themeMode === mode 
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-indigo-500/5" 
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]/30 bg-[var(--secondary)]/20"
                    )}
                  >
                    {mode === 'light' && <Sun className={cn("w-6 h-6", themeMode === mode ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />}
                    {mode === 'system' && <Monitor className={cn("w-6 h-6", themeMode === mode ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />}
                    {mode === 'dark' && <Moon className={cn("w-6 h-6", themeMode === mode ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />}
                    <span className={cn("text-[11px] font-bold uppercase tracking-wider", themeMode === mode ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>
                      {mode}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Section */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color Accent
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    className={cn(
                      "group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
                      colorTheme === t.id ? "scale-110 ring-4 ring-[var(--primary)]/20" : "hover:scale-105"
                    )}
                  >
                    <div className={cn("w-full h-full rounded-2xl shadow-lg", t.color)} />
                    {colorTheme === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Data Management
              </h3>
              
              <div className="p-6 rounded-3xl bg-[var(--secondary)]/30 border border-[var(--border)] space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Retention Period</label>
                  <p className="text-[11px] font-medium text-[var(--muted-foreground)] leading-relaxed">
                    Automatically clear completed tasks older than this period.
                  </p>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={historyRetentionDays}
                    onChange={(e) => setHistoryRetentionDays(parseInt(e.target.value) || 30)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-bold focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/5 transition-all"
                  />
                  <span className="absolute right-4 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Days</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 pt-0">
            <button 
              onClick={() => setSettingsOpen(false)}
              className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Save & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
