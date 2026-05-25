/* src/shared/components/archive/ArchiveExplorer.tsx */
import { useState, useMemo, useEffect } from 'react';
import { getAssetPath } from '@/shared/lib/utils';

// --- 1. DATA TYPES DEFINITION ---
type SpecimenData = {
  id: string;
  name: string;
  era: string;
  period: string;
  category: string;
  tags: string[];
  stats: Record<string, string | number>;
  information: string[];
  guide?: {
    icon?: string;
    title: string;
    content: string | string[];
  }[];
  dimorphism?: {
    male: string[];
    female: string[];
  };
  visuals: {
    male: string | null;
    female: string | null;
    action?: string | null; 
  };
  audio: string | null;
};

type ArchiveExplorerProps = {
  initialData: SpecimenData[];
};

// --- 2. UI ICONS ---
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
  </svg>
);

export default function ArchiveExplorer({ initialData }: ArchiveExplorerProps) {
  if (!initialData || initialData.length === 0) return null;

  // --- 3. STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialData[0].id);
  const [genderView, setGenderView] = useState<'male' | 'female'>('male');
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Synchronize selection with URL parameter 'id' (e.g. from global search)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      const match = initialData.find(item => item.id.toLowerCase() === idParam.toLowerCase());
      if (match) {
        setSelectedId(match.id);
      }
    }
  }, [initialData]);
  
  const [expandedEras, setExpandedEras] = useState<string[]>(
    Array.from(new Set(initialData.map(item => item.era)))
  );

  // --- 4. DYNAMIC DATA SELECTION ---
  const activeItem = useMemo(() => {
    return initialData.find(item => item.id === selectedId) || initialData[0];
  }, [selectedId, initialData]);

  // --- 5. ACTION FRAMEWORK LOGIC ---
  
  // Reset action state and preload visuals when specimen changes
  useEffect(() => {
    setIsPerformingAction(false);
    setImgStatus('loading');
    
    if (activeItem.visuals.action) {
      const img = new Image();
      img.src = getAssetPath(activeItem.visuals.action);
    }
  }, [activeItem.id]);

  const handleActionTrigger = () => {
    if (!activeItem.audio) return;

    const audio = new Audio(getAssetPath(activeItem.audio));
    
    // Switch to action visual if defined in JSON
    if (activeItem.visuals.action) {
      setImgStatus('loading');
      setIsPerformingAction(true);
    }

    audio.play().catch(err => console.error("Playback failed:", err));

    // Automatically revert to idle state when audio ends
    audio.onended = () => setIsPerformingAction(false);
    audio.onerror = () => setIsPerformingAction(false);
  };

  // Determine final image source
  const rawImgSrc = (isPerformingAction && activeItem.visuals.action)
    ? activeItem.visuals.action
    : (activeItem.visuals[genderView] || activeItem.visuals.male || "/images/error/placeholder.png");
  const currentImgSrc = getAssetPath(rawImgSrc);

  // Filtering & Grouping
  const filteredData = useMemo(() => {
    return initialData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, initialData]);

  const groupedData = useMemo(() => {
    const groups: Record<string, Record<string, SpecimenData[]>> = {};
    filteredData.forEach(item => {
      if (!groups[item.era]) groups[item.era] = {};
      if (!groups[item.era][item.category]) groups[item.era][item.category] = [];
      groups[item.era][item.category].push(item);
    });
    return groups;
  }, [filteredData]);

  return (
    <div className={`w-full min-h-0 flex flex-col gap-4 sm:gap-5 lg:h-full lg:flex-row lg:gap-6 transition-all duration-75 
      ${isPerformingAction && activeItem.id.toLowerCase().includes('tyrannosaurus') ? 'animate-shake' : ''}`}>
      
      {/* COLUMN 1: DIRECTORY TREE */}
      <div className="order-1 w-full lg:w-1/4 lg:min-w-64 flex flex-col gap-4 lg:h-full">
        <div className="liquid-glass rounded-lg p-3 sm:p-4 shrink-0 border border-foreground/5">
          <input 
            type="text" 
            placeholder="Search archive..." 
            className="w-full bg-foreground/5 border border-foreground/10 rounded-md px-4 py-2 text-sm text-foreground font-bold uppercase tracking-wider focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="liquid-glass rounded-lg p-3 sm:p-4 max-h-80 overflow-y-auto border border-foreground/5 no-scrollbar lg:max-h-none lg:flex-1">
          {Object.entries(groupedData).map(([era, categories]) => (
            <div key={era} className="mb-4 select-none">
              <button 
                onClick={() => setExpandedEras(prev => prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era])}
                className="flex items-center gap-2 w-full text-left py-2 text-foreground/80 hover:text-foreground transition-colors group"
              >
                <ChevronIcon isOpen={expandedEras.includes(era)} />
                <FolderIcon />
                <span className="text-xs font-black uppercase tracking-[0.2em] mt-0.5">{era} Era</span>
              </button>
              {expandedEras.includes(era) && (
                <div className="ml-[11px] pl-4 border-l border-foreground/10 flex flex-col gap-3 mt-1">
                  {Object.entries(categories).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1.5 pl-2">{category}</div>
                      {items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => { setSelectedId(item.id); setGenderView('male'); }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border-l-2 ${selectedId === item.id ? 'border-foreground text-foreground bg-foreground/5' : 'border-transparent text-foreground/50 hover:text-foreground/80'}`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 2: INFORMATION */}
      <div className="order-3 w-full lg:order-2 lg:w-1/3 liquid-glass rounded-lg p-5 sm:p-6 lg:p-8 border border-foreground/5 flex flex-col lg:h-full lg:overflow-y-auto no-scrollbar scroll-smooth">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 mb-2">{activeItem.period} • {activeItem.category}</span>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-foreground mb-5 sm:mb-6 break-words">{activeItem.name}</h2>
        
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {activeItem.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border border-foreground/20 bg-foreground/5 text-[9px] font-bold uppercase tracking-widest text-foreground/80">{tag}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 sm:mb-8">
          {Object.entries(activeItem.stats).map(([key, value]) => (
            <div key={key} className="bg-foreground/5 border border-foreground/10 rounded-md p-3">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/40 block mb-1">{key}</span>
              <span className="text-xs font-black uppercase tracking-widest text-foreground">{value}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-3 border-b border-foreground/10 pb-2 flex items-center gap-2">ℹ️ Information</h3>
          <div className="text-sm text-foreground/70 leading-relaxed font-medium space-y-4">
             {activeItem.information.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          </div>
        </div>

        {activeItem.guide && activeItem.guide.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-3 border-b border-foreground/10 pb-2 flex items-center gap-2">🔖 Survival Guide</h3>
            <div className="space-y-4">
              {activeItem.guide.map((section, idx) => (
                <div key={idx} className="bg-foreground/5 rounded-md p-4 border border-foreground/5">
                  <span className="text-[10px] font-black uppercase text-foreground block mb-2">{section.icon && `${section.icon} `}{section.title}</span>
                  <p className="text-xs text-foreground/70 leading-relaxed">{Array.isArray(section.content) ? section.content.join(' ') : section.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COLUMN 3: VISUAL ENGINE */}
      <div className="order-2 w-full min-h-[360px] sm:min-h-[440px] lg:order-3 lg:flex-1 liquid-glass rounded-lg p-5 sm:p-8 border border-foreground/5 flex flex-col items-center justify-center relative lg:h-full overflow-hidden">
        <div className="relative w-full min-h-0 flex-1 flex items-center justify-center">
          
          {/* Performance Skeleton */}
          {imgStatus === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-foreground/5 animate-pulse blur-3xl" />
            </div>
          )}

          {/* Ghost Image Layer */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none blur-2xl"
            style={{ backgroundImage: `url('${getAssetPath("/images/error/placeholder.png")}')`, backgroundSize: '40%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} 
          />

          <img 
            src={currentImgSrc} 
            alt={activeItem.name}
            decoding="async"
            onLoad={() => setImgStatus('loaded')}
            // Changing key forces React to treat this as a fresh element, swapping frames instantly
            key={`${activeItem.id}-${genderView}-${isPerformingAction}`}
            className={`max-w-[90%] max-h-[90%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-300
              ${isPerformingAction ? 'scale-110 blur-0' : 'scale-100'}
              ${imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}
            `}
            onError={(e) => {
              setImgStatus('error');
              const fallback = getAssetPath("/images/error/placeholder.png");
              if (e.currentTarget.src !== window.location.origin + fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        </div>

        {/* DYNAMIC ACTION CONTROLS */}
        {(activeItem.visuals.female || activeItem.audio) && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex max-w-[calc(100%-2rem)] items-center gap-3 sm:gap-4 bg-background/60 backdrop-blur-md rounded-full px-3 sm:px-4 py-2 border border-foreground/10 shadow-xl z-20">
            {activeItem.visuals.female && (
              <div className="flex bg-foreground/5 rounded-full p-1 border border-foreground/10">
                <button onClick={() => setGenderView('male')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all font-black text-[10px] ${genderView === 'male' ? 'bg-foreground text-background' : 'text-foreground/40 hover:text-foreground'}`}>M</button>
                <button onClick={() => setGenderView('female')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all font-black text-[10px] ${genderView === 'female' ? 'bg-foreground text-background' : 'text-foreground/40 hover:text-foreground'}`}>F</button>
              </div>
            )}
            
            {activeItem.audio && (
              <button 
                className={`px-4 sm:px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-all flex items-center gap-2 group whitespace-nowrap ${isPerformingAction ? 'bg-foreground text-background scale-105 shadow-lg' : 'bg-foreground/10 border-foreground/20 text-foreground hover:bg-foreground hover:text-background'}`}
                onClick={handleActionTrigger}
                disabled={isPerformingAction}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {isPerformingAction ? 'ROARING...' : 'PLAY SOUND'}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.2s infinite; }
      `}</style>
    </div>
  );
}
