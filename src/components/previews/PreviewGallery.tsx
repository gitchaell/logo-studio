import React, { useState } from 'react';
import { BrowserTabPreview } from './BrowserTabPreview';
import { ManifestPreview } from './ManifestPreview';
import { ui, defaultLang } from '@/i18n/ui';
import { Check, Download, Globe, Smartphone, Share2, Layout } from 'lucide-react';

interface PreviewGalleryProps {
  svgContent: string;
  projectName: string;
  lang: string;
  borderRadius?: number;
  backgroundColor?: string;
  displayMode?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  selectedSizes?: number[];
  onToggleSize?: (size: number) => void;
  scale?: number;
  position?: { x: number; y: number };
}

const AVAILABLE_SIZES = [16, 32, 64, 128, 192, 512, 1024];

export function PreviewGallery({
    svgContent,
    projectName,
    lang,
    borderRadius,
    backgroundColor,
    displayMode = 'standalone',
    orientation = 'any',
    selectedSizes = [],
    onToggleSize,
    scale = 1,
    position = { x: 0, y: 0 }
}: PreviewGalleryProps) {
  const [activeTab, setActiveTab] = useState<'web' | 'mobile' | 'social' | 'manifest' | 'exports'>('web');
  const [customSizes, setCustomSizes] = useState<number[]>([]);
  const [newSizeInput, setNewSizeInput] = useState('');

  const logoTransformStyle = {
      transform: `translate(${(position.x / 512) * 100}%, ${(position.y / 512) * 100}%) scale(${scale})`,
      transformOrigin: 'center',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
  };

  const t = (key: string) => {
    // @ts-ignore
    return ui[lang]?.[key] || ui[defaultLang]?.[key] || key;
  };

  if (!svgContent) {
    return <div className="text-center p-10 text-slate-500">No content to preview</div>;
  }

  const tabs = [
      { id: 'web', label: 'Web', icon: Globe },
      { id: 'mobile', label: 'Mobile', icon: Smartphone },
      { id: 'social', label: 'Social', icon: Share2 },
      { id: 'manifest', label: 'Manifest', icon: Layout },
      { id: 'exports', label: 'Exports', icon: Download },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
        {/* Tabs */}
        <div className="flex items-center justify-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 shrink-0">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg overflow-x-auto max-w-full">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {activeTab === 'web' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                                <Globe className="w-4 h-4 mr-2" /> {t('preview.browser_tab')}
                            </h3>
                            <div className="space-y-6">
                                <BrowserTabPreview svgContent={svgContent} projectName={projectName} theme="light" scale={scale} position={position} />
                                <BrowserTabPreview svgContent={svgContent} projectName={projectName} theme="dark" scale={scale} position={position} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mobile' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                             {/* iOS Preview */}
                             <div className="w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-slate-100 shadow-md relative group border border-zinc-200 dark:border-zinc-800">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&q=80')] bg-cover bg-center">
                                   <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl"></div>
                                </div>
                                <div className="absolute top-0 w-full h-6 flex justify-between px-6 items-center text-[10px] font-medium text-slate-800 z-20">
                                    <span>9:41</span>
                                    <div className="flex space-x-1">
                                        <div className="w-4 h-2.5 bg-slate-800 rounded-[2px]"></div>
                                    </div>
                                </div>
                                <div className="relative h-full flex flex-col items-center pt-20 px-4">
                                    <div
                                        className="w-16 h-16 shadow-xl overflow-hidden flex items-center justify-center mb-2 transition-transform hover:scale-105 duration-200 cursor-pointer"
                                        style={{
                                            backgroundColor: backgroundColor || '#ffffff',
                                            borderRadius: borderRadius ? `${borderRadius * (64/512)}px` : '14px'
                                        }}
                                    >
                                        <div style={logoTransformStyle}>
                                            <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-800 text-center drop-shadow-sm truncate w-20">{projectName || 'App'}</span>
                                    <div className="mt-8 grid grid-cols-4 gap-4 w-full px-2 opacity-30 pointer-events-none grayscale">
                                        {[...Array(12)].map((_, i) => (
                                             <div key={i} className="aspect-square bg-slate-400/50 rounded-[12px]"></div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 h-20 bg-white/40 backdrop-blur-xl rounded-[28px] flex items-center justify-around px-4">
                                        {[...Array(4)].map((_, i) => (
                                             <div key={i} className="w-12 h-12 bg-white/50 rounded-[10px]"></div>
                                        ))}
                                    </div>
                                </div>
                             </div>

                             {/* Android Preview */}
                             <div className="w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 shadow-md relative group border border-zinc-700">
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>
                                <div className="absolute top-0 w-full h-6 flex justify-between px-4 items-center text-[10px] font-medium text-white/80 z-20">
                                    <span>12:00</span>
                                    <div className="flex space-x-1">
                                        <span>100%</span>
                                    </div>
                                </div>
                                <div className="relative h-full flex flex-col items-center pt-24 px-4">
                                    <div
                                        className="w-14 h-14 shadow-lg overflow-hidden flex items-center justify-center mb-2 ring-2 ring-white/20 hover:ring-white/40 transition-all cursor-pointer"
                                        style={{
                                            backgroundColor: backgroundColor || '#ffffff',
                                            borderRadius: borderRadius ? `${borderRadius * (56/512)}px` : '50%'
                                        }}
                                    >
                                        <div style={logoTransformStyle}>
                                            <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90 text-center drop-shadow-md truncate w-20">{projectName || 'App'}</span>
                                    <div className="mt-12 grid grid-cols-4 gap-6 w-full px-2 opacity-40 pointer-events-none">
                                        {[...Array(8)].map((_, i) => (
                                             <div key={i} className="aspect-square bg-white/20 rounded-full"></div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-20 left-4 right-4 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center px-4">
                                        <div className="w-4 h-4 rounded-full border-2 border-white/50"></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="w-full max-w-[600px] aspect-[1.91/1] bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700 flex flex-col">
                             <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                  <div
                                    className="w-32 h-32 flex items-center justify-center shadow-2xl"
                                    style={{
                                        backgroundColor: backgroundColor || 'transparent',
                                        borderRadius: borderRadius ? `${borderRadius * (128/512)}px` : '0'
                                    }}
                                  >
                                    <div style={logoTransformStyle}>
                                        <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                    </div>
                                  </div>
                             </div>
                             <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{projectName || 'Project Name'}</h3>
                                <p className="text-xs text-slate-500 truncate mt-1">Check out my new logo designed with Logo Studio.</p>
                                <p className="text-[10px] text-slate-400 mt-2 uppercase">example.com</p>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'manifest' && (
                    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <ManifestPreview
                            display={displayMode}
                            orientation={orientation}
                            backgroundColor={backgroundColor}
                            themeColor={backgroundColor}
                        />
                    </div>
                )}

                {activeTab === 'exports' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Export Selection</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    placeholder="Size (px)"
                                    value={newSizeInput}
                                    onChange={(e) => setNewSizeInput(e.target.value)}
                                    className="w-24 px-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    onClick={() => {
                                        const size = parseInt(newSizeInput);
                                        if (size > 0 && !AVAILABLE_SIZES.includes(size) && !customSizes.includes(size)) {
                                            setCustomSizes(prev => [...prev, size].sort((a,b) => a-b));
                                            onToggleSize?.(size);
                                            setNewSizeInput('');
                                        }
                                    }}
                                    disabled={!newSizeInput}
                                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Size
                                </button>
                                <div className="text-sm text-slate-500 ml-2">
                                    {selectedSizes.length} selected
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
                            {[...AVAILABLE_SIZES, ...customSizes].sort((a, b) => b - a).map(size => {
                                const isSelected = selectedSizes.includes(size);
                                const previewSize = Math.min(160, Math.max(48, size));

                                return (
                                    <div
                                        key={size}
                                        onClick={() => onToggleSize?.(size)}
                                        className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 transition-all h-[240px] ${
                                            isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="absolute top-3 right-3 z-10">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                                isSelected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                            }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center w-full">
                                            <div
                                                className="flex items-center justify-center overflow-hidden shadow-sm bg-white dark:bg-black/20 rounded-lg transition-all"
                                                style={{
                                                    width: previewSize,
                                                    height: previewSize,
                                                    backgroundColor: backgroundColor || 'transparent',
                                                    borderRadius: borderRadius ? `${borderRadius * (previewSize/512)}px` : '0'
                                                }}
                                            >
                                                <div style={logoTransformStyle}>
                                                    <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center shrink-0">
                                            <span className="block text-sm font-semibold text-slate-900 dark:text-white">{size}x{size}</span>
                                            <span className="text-xs text-slate-500">PNG</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
