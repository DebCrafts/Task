import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-float" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-500/10 blur-[100px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-500/10 blur-[80px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 lg:w-72 border-r border-[var(--border)] glass z-10">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm border-r border-[var(--border)] glass shadow-2xl md:hidden"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden z-10">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b border-[var(--border)] glass px-6 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-3 text-xl font-bold tracking-tight text-gradient">TaskFlow</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
          <div className="mx-auto max-w-4xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
