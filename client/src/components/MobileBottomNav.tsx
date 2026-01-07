import { useState, useEffect } from 'react';
import { Plus, BarChart3, History, DollarSign, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
  onAddEntry: () => void;
  onAddTipExpense: () => void;
  onScrollToSection: (section: 'stats' | 'chart' | 'history' | 'tips') => void;
}

export default function MobileBottomNav({ 
  onAddEntry, 
  onAddTipExpense,
  onScrollToSection,
}: MobileBottomNavProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setShowAddMenu(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Backdrop when add menu is open */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Add menu popup */}
      {showAddMenu && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 sm:hidden animate-fade-in-up">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-2 flex gap-2">
            <Button
              onClick={() => {
                onAddEntry();
                setShowAddMenu(false);
              }}
              className="gap-2 px-4"
            >
              <Plus className="w-4 h-4" />
              Add Bet
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onAddTipExpense();
                setShowAddMenu(false);
              }}
              className="gap-2 px-4"
            >
              <DollarSign className="w-4 h-4" />
              Add Tip
            </Button>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav 
        className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl border-t border-border/50" />
        
        <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {/* Home/Stats */}
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setShowAddMenu(false);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* Chart */}
          <button 
            onClick={() => {
              onScrollToSection('chart');
              setShowAddMenu(false);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Chart</span>
          </button>

          {/* Add button (center, elevated) */}
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`relative -mt-6 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all ${
              showAddMenu 
                ? 'bg-muted rotate-45' 
                : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30'
            }`}
          >
            <Plus className={`w-6 h-6 ${showAddMenu ? 'text-foreground' : 'text-white'}`} />
          </button>

          {/* History */}
          <button 
            onClick={() => {
              onScrollToSection('history');
              setShowAddMenu(false);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>

          {/* Tips */}
          <button 
            onClick={() => {
              onScrollToSection('tips');
              setShowAddMenu(false);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tips</span>
          </button>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 sm:hidden" />
    </>
  );
}
