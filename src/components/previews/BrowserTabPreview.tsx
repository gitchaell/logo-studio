import { X } from 'lucide-react';
import React from 'react';

interface BrowserTabPreviewProps {
  svgContent: string;
  projectName: string;
  theme?: 'light' | 'dark';
  scale?: number;
  position?: { x: number; y: number };
}

export function BrowserTabPreview({ svgContent, projectName, theme = 'light', scale = 1, position = { x: 0, y: 0 } }: BrowserTabPreviewProps) {
  const isDark = theme === 'dark';

  const logoTransformStyle = {
      transform: `translate(${(position.x / 512) * 100}%, ${(position.y / 512) * 100}%) scale(${scale})`,
      transformOrigin: 'center',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-100 border-gray-200'} shadow-sm`}>
      {/* Browser Chrome */}
      <div className={`h-10 flex items-center px-2 space-x-2 ${isDark ? 'bg-zinc-900' : 'bg-gray-100'}`}>
        {/* Window Controls */}
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>

        {/* Tab */}
        <div className={`flex-1 max-w-[240px] h-8 mt-2 rounded-t-lg flex items-center px-3 space-x-2 text-xs relative
          ${isDark ? 'bg-zinc-800 text-gray-300' : 'bg-white text-gray-700'} shadow-sm`}>

          {/* Favicon */}
          <div className="w-4 h-4 shrink-0 overflow-hidden flex items-center justify-center">
             <div style={logoTransformStyle}>
                 <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
             </div>
          </div>

          <span className="truncate flex-1 font-medium">{projectName || 'New Project'}</span>
          <X className={`w-3 h-3 cursor-pointer ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
        </div>

        {/* New Tab Button */}
        <div className={`w-6 h-6 rounded hover:bg-black/5 flex items-center justify-center cursor-pointer ${isDark ? 'hover:bg-white/10' : ''}`}>
           <span className={`text-lg leading-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>+</span>
        </div>
      </div>

      {/* Address Bar Area */}
      <div className={`h-9 border-b flex items-center px-3 space-x-3 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
         <div className="flex space-x-2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
         </div>
         <div className={`flex-1 h-6 rounded-full flex items-center px-3 text-xs ${isDark ? 'bg-zinc-900 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            <span className="opacity-50">https://</span>example.com
         </div>
      </div>

      {/* Page Content Placeholder */}
      <div className={`h-32 flex items-center justify-center ${isDark ? 'bg-zinc-900 text-gray-600' : 'bg-white text-gray-300'}`}>
         <span className="text-4xl font-black opacity-10 select-none">CONTENT</span>
      </div>
    </div>
  );
}
