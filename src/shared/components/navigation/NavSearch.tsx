/* src/shared/components/navigation/NavSearch.tsx */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Fuse from 'fuse.js';
import { getAssetPath } from '@/shared/lib/utils';

type SearchItem = {
  id: string;
  name: string;
  era: string;
  tags: string[];
  thumbnail: string;
};

export default function NavSearch() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [db, setDb] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  // Ensure portal only renders on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the search index API when the modal is opened
  useEffect(() => {
    if (isOpen && db.length === 0) {
      setIsLoading(true);
      setError(null);
      
      fetch(getAssetPath('/api/search.json'))
        .then(res => {
          if (!res.ok) throw new Error("API failed");
          return res.json();
        })
        .then((data: SearchItem[]) => {
          setDb(data);
          
          fuseRef.current = new Fuse(data, {
            keys: [
              { name: 'name', weight: 0.7 },
              { name: 'tags', weight: 0.2 },
              { name: 'era', weight: 0.1 }
            ],
            threshold: 0.2, 
            location: 0,
            distance: 50,
            ignoreLocation: false, 
            includeScore: true
          });
          
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Search API Error:", err);
          setError("Failed to connect to Archive database.");
          setIsLoading(false);
        });
    }
  }, [isOpen, db.length]);

  // Handle fuzzy search logic and score filtering
  useEffect(() => {
    if (!fuseRef.current) return;
    
    if (query.trim() === '') {
      setResults([]);
    } else {
      const searchResults = fuseRef.current.search(query);
      
      const filteredResults = searchResults.filter(result => {
        if (query.length === 1 && result.score && result.score > 0.1) {
          return false;
        }
        return true;
      });

      setResults(filteredResults.map(result => result.item));
    }
  }, [query]);

  // Global hotkey listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation within the input field
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (results.length > 0) {
        window.location.href = getAssetPath(`/archive?id=${results[0].id}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Modern UI Modal Content utilizing global CSS variables
  const ModalContent = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-32 bg-black/40 backdrop-blur-sm transition-all duration-300">
      
      {/* Background overlay click-to-close */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
      
      {/* Modal Container: Uses specific CSS variables for perfect contrast and extreme border-radius */}
      <div className="relative w-full max-w-2xl bg-background border border-border shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[var(--radius-md)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 mx-4">
        
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-4 border-b border-border bg-background">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground ml-2 shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input 
            autoFocus
            type="text" 
            placeholder="Search by name, era, or tags..." 
            className="w-full bg-transparent border-none outline-none px-4 text-foreground placeholder:text-muted-foreground font-bold tracking-wide text-base lg:text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-muted border border-border px-2 py-1 rounded-md text-muted-foreground font-black tracking-widest mr-2 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Search Results Container */}
        <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-background">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-black uppercase text-muted-foreground tracking-widest animate-pulse">
              Extracting database...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-xs font-black uppercase text-red-500 tracking-widest">
              {error}
            </div>
          ) : query !== '' && results.length === 0 ? (
            <div className="p-12 text-center text-xs font-black uppercase text-muted-foreground tracking-widest">
              No specimens found.
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-1">
              {results.map((item) => (
                <a 
                  key={item.id} 
                  href={getAssetPath(`/archive?id=${item.id}`)}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-[var(--radius-sm)] hover:bg-muted transition-colors group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-background border border-border rounded-xl flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm">
                    <img 
                      src={getAssetPath(item.thumbnail)} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                      onError={(e) => { e.currentTarget.src = getAssetPath("/images/error/placeholder.png"); }} 
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">
                      {item.era} Era
                    </span>
                    <span className="text-sm font-black uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] border border-border bg-background px-2.5 py-1 rounded-[var(--radius-pill)] text-muted-foreground uppercase font-black hidden sm:block shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center gap-2 rounded-full border border-border bg-background p-0 text-sm text-muted-foreground shadow-sm transition-all duration-300 hover:bg-muted lg:h-auto lg:w-64 lg:justify-start lg:rounded-[var(--radius-pill)] lg:px-4 lg:py-2"
        aria-label="Search archive"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span className="hidden font-bold text-xs uppercase tracking-widest lg:inline">Search...</span>
        <kbd className="ml-auto hidden text-[10px] bg-muted border border-border px-2 py-0.5 rounded-md text-muted-foreground font-sans font-bold lg:inline-block">Ctrl K</kbd>
      </button>

      {mounted && isOpen && createPortal(ModalContent, document.body)}
    </>
  );
}
