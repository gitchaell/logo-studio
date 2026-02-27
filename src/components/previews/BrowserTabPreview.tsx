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
      <div className={`flex flex-col h-64 overflow-hidden relative ${isDark ? 'bg-zinc-950 text-gray-300' : 'bg-white text-gray-700'}`}>

        {/* Mock Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
           <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                 <div style={logoTransformStyle}>
                     <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                 </div>
              </div>
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{projectName || 'Brand'}</span>
           </div>

           <div className="hidden sm:flex items-center space-x-6 text-sm font-medium opacity-70">
              <span>Home</span>
              <span>Features</span>
              <span>Pricing</span>
              <span>About</span>
           </div>

           <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}></div>
        </div>

        {/* Mock Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
             <h1 className={`text-2xl sm:text-3xl font-bold max-w-md ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Build something amazing with {projectName || 'Brand'}
             </h1>
             <p className="max-w-sm text-sm opacity-70">
                The ultimate solution for your next big project. Start creating today and scale your business.
             </p>
             <div className="flex space-x-3 mt-4">
                 <div className={`h-9 px-5 rounded-md flex items-center text-sm font-medium ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Get Started</div>
                 <div className={`h-9 px-5 rounded-md flex items-center text-sm font-medium border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-gray-200 hover:bg-gray-50'}`}>Learn More</div>
             </div>
        </div>

      </div>
    </div>
  );
}
