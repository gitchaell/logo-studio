import React from 'react';
import { BrowserTabPreview } from './BrowserTabPreview';
import { ui, defaultLang } from '@/i18n/ui';

interface PreviewGalleryProps {
  svgContent: string;
  projectName: string;
  lang: string;
}

export function PreviewGallery({ svgContent, projectName, lang }: PreviewGalleryProps) {
  const t = (key: string) => {
    // @ts-ignore
    return ui[lang]?.[key] || ui[defaultLang]?.[key] || key;
  };

  if (!svgContent) {
    return <div className="text-center p-10 text-slate-500">No content to preview</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-8 overflow-y-auto h-full max-w-7xl mx-auto">

      {/* Browser Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('preview.browser_tab')}</h3>
        <div className="space-y-6">
            <div className="space-y-2">
                <span className="text-xs text-slate-400 pl-1">{t('preview.light_mode')}</span>
                <BrowserTabPreview svgContent={svgContent} projectName={projectName} theme="light" />
            </div>
            <div className="space-y-2">
                <span className="text-xs text-slate-400 pl-1">{t('preview.dark_mode')}</span>
                <BrowserTabPreview svgContent={svgContent} projectName={projectName} theme="dark" />
            </div>
        </div>
      </div>

      {/* Mobile Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('preview.mobile_icon')}</h3>
        <div className="grid grid-cols-2 gap-6">
             {/* iOS Preview */}
             <div className="aspect-[9/16] rounded-3xl overflow-hidden bg-slate-100 shadow-md relative group border border-zinc-200 dark:border-zinc-800">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&q=80')] bg-cover bg-center">
                   <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl"></div>
                </div>

                {/* Status Bar Mock */}
                <div className="absolute top-0 w-full h-6 flex justify-between px-6 items-center text-[10px] font-medium text-slate-800 z-20">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                        <div className="w-4 h-2.5 bg-slate-800 rounded-[2px]"></div>
                    </div>
                </div>

                <div className="relative h-full flex flex-col items-center pt-20 px-4">
                    <div className="w-16 h-16 bg-white rounded-[14px] shadow-xl overflow-hidden p-2 flex items-center justify-center mb-2 transition-transform hover:scale-105 duration-200 cursor-pointer">
                        <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full object-contain" dangerouslySetInnerHTML={{ __html: svgContent }} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-800 text-center drop-shadow-sm truncate w-20">{projectName || 'App'}</span>

                    {/* Other icons grid mock */}
                    <div className="mt-8 grid grid-cols-4 gap-4 w-full px-2 opacity-30 pointer-events-none grayscale">
                        {[...Array(12)].map((_, i) => (
                             <div key={i} className="aspect-square bg-slate-400/50 rounded-[12px]"></div>
                        ))}
                    </div>

                    {/* Dock */}
                    <div className="absolute bottom-4 left-4 right-4 h-20 bg-white/40 backdrop-blur-xl rounded-[28px] flex items-center justify-around px-4">
                        {[...Array(4)].map((_, i) => (
                             <div key={i} className="w-12 h-12 bg-white/50 rounded-[10px]"></div>
                        ))}
                    </div>
                </div>
             </div>

             {/* Android Preview */}
             <div className="aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 shadow-md relative group border border-zinc-700">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>

                {/* Status Bar Mock */}
                <div className="absolute top-0 w-full h-6 flex justify-between px-4 items-center text-[10px] font-medium text-white/80 z-20">
                    <span>12:00</span>
                    <div className="flex space-x-1">
                        <span>100%</span>
                    </div>
                </div>

                <div className="relative h-full flex flex-col items-center pt-24 px-4">
                    <div className="w-14 h-14 bg-white rounded-full shadow-lg overflow-hidden p-3 flex items-center justify-center mb-2 ring-2 ring-white/20 hover:ring-white/40 transition-all cursor-pointer">
                        <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full object-contain" dangerouslySetInnerHTML={{ __html: svgContent }} />
                    </div>
                    <span className="text-[11px] font-medium text-white/90 text-center drop-shadow-md truncate w-20">{projectName || 'App'}</span>

                     {/* Other icons grid mock */}
                    <div className="mt-12 grid grid-cols-4 gap-6 w-full px-2 opacity-40 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                             <div key={i} className="aspect-square bg-white/20 rounded-full"></div>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="absolute bottom-20 left-4 right-4 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center px-4">
                        <div className="w-4 h-4 rounded-full border-2 border-white/50"></div>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
