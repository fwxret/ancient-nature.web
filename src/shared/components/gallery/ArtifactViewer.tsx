/* src/shared/components/gallery/ArtifactViewer.tsx */
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getAssetPath } from '@/shared/lib/utils';

const SPECIMEN_METADATA = {
  id: "CLASSIFIED DATA",
  title: "ANCIENT SPECIMEN: TEMPORAL OVERVIEW",
  epoch: "MIXED CHRONOLOGICAL EPOCHS",
};

const SPECIMEN_IMAGE_PATH = "/images/version1.png";

export default function ArtifactViewer() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when the image viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const ViewerModal = () => (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 cursor-pointer"
      onClick={() => setIsOpen(false)} // Close modal when clicking outside the image
    >
      
      {/* 1. Header Metadata Section - Font size reduced for a more balanced look */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white mb-2 block opacity-40">
            {SPECIMEN_METADATA.id}
          </span>
          {/* Reduced from text-4xl to text-2xl */}
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
            {SPECIMEN_METADATA.title}
          </h3>
          <div className="h-[2px] w-24 bg-white mx-auto mt-4 opacity-30"></div>
          <p className="text-[9px] font-bold uppercase text-white/70 tracking-[0.2em] mt-4">
            {SPECIMEN_METADATA.epoch}
          </p>
      </div>

      {/* 2. Main Image - Kept original max-size constraints as requested */}
      <div className="relative p-4 max-w-7xl max-h-[75vh] cursor-default" onClick={(e) => e.stopPropagation()}>
        <img 
          src={getAssetPath(SPECIMEN_IMAGE_PATH)} 
          alt="Specimen" 
          className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(255,255,255,0.15)]"
        />
      </div>

      {/* 3. Navigation/Control Bar (Bottom Bar) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-fit" onClick={(e) => e.stopPropagation()}>
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center gap-6 pointer-events-auto border border-white/10 shadow-2xl">
          <button type="button" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors" aria-label="Close viewer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <a
            href={getAssetPath(SPECIMEN_IMAGE_PATH)}
            target="_blank"
            rel="noreferrer"
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Open image in a new tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* TRIGGER: Floating image without a background box to blend into the grid */}
      <div 
        className="relative w-full flex items-center justify-center cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={getAssetPath(SPECIMEN_IMAGE_PATH)} 
          alt="Specimen Overview" 
          className="w-full h-auto object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        />
        
        {/* Hover magnifying glass icon indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            </div>
        </div>
      </div>

      {/* Render the Viewer Modal via React Portal to ensure it sits on top of all elements */}
      {isOpen && ReactDOM.createPortal(<ViewerModal />, document.body)}
    </>
  );
}
