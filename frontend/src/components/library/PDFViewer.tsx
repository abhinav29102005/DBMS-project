'use client';

import { X, Maximize2, Minimize2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PDFViewerProps {
  url: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFViewer({ url, title, isOpen, onClose }: PDFViewerProps) {
  if (!isOpen) return null;

  // Transform links for reliable embedding
  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      return url.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
    }
    // Clean the URL to prevent double encoding
    const cleanUrl = decodeURIComponent(url);
    return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8">
      <div className="relative w-full h-full max-w-6xl bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
              <ExternalLink size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Digital Reading Room</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-gray-500">
                <Download size={16} /> Download
              </Button>
            </a>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-gray-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 bg-gray-50 relative group">
          <iframe 
            src={getEmbedUrl(url)} 
            className="w-full h-full border-0"
            allow="autoplay"
          />
          
          {/* Subtle Overlay Hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Interactive PDF Mode Active
          </div>
        </div>
      </div>
    </div>
  );
}
