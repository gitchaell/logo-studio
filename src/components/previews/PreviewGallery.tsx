import React, { useState, useEffect } from 'react';
import { BrowserTabPreview } from './BrowserTabPreview';
import { ManifestPreview } from './ManifestPreview';
import { SocialPreviewCard } from './SocialPreviewCard';
import { ui, defaultLang } from '@/i18n/ui';
import { Check, Download, Globe, Smartphone, Share2, Layout, FileJson } from 'lucide-react';
import { generateOpenGraph, generateManifest, generateAppJson } from '@/lib/generators';
import { AVAILABLE_SIZES } from '@/lib/constants';
import { CodeBlock } from '../ui/CodeBlock';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface PreviewGalleryProps {
  svgContent: string;
  projectName: string;
  lang: string;
  borderRadius?: number;
  backgroundColor?: string;
  displayMode?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  selectedSizes: number[];
  onToggleSize: (size: number) => void;
  onSelectAllSizes: () => void;
  onDeselectAllSizes: () => void;
  scale?: number;
  position?: { x: number; y: number };
  shortName?: string;
  description?: string;
  themeColor?: string;
  selectedExtraAssets: Set<string>;
  onToggleExtraAsset: (asset: string) => void;
}

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
    onSelectAllSizes,
    onDeselectAllSizes,
    scale = 1,
    position = { x: 0, y: 0 },
    shortName,
    description,
    themeColor,
    selectedExtraAssets,
    onToggleExtraAsset
}: PreviewGalleryProps) {
  const [activeTab, setActiveTab] = useLocalStorage<'web' | 'mobile' | 'social' | 'manifest' | 'exports'>('preview-active-tab', 'web');
  const [customSizes, setCustomSizes] = useState<number[]>([]);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [ogImage, setOgImage] = useState<string>('');
  const [showSplashInManifest, setShowSplashInManifest] = useState(false);

  useEffect(() => {
      const generate = async () => {
          if (svgContent && projectName) {
              const svg = await generateOpenGraph({ name: projectName, description: description || 'Designed with Logo Studio' }, svgContent);
              setOgImage(svg);
          }
      };
      generate();
  }, [svgContent, projectName, description]);

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
                             <div className="w-full max-w-sm aspect-[9/19.5] rounded-[40px] overflow-hidden bg-slate-100 shadow-2xl relative group border-4 border-slate-900 dark:border-zinc-800">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&q=80')] bg-cover bg-center">
                                   <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl"></div>
                                </div>
                                {/* Status Bar */}
                                <div className="absolute top-0 w-full h-12 flex justify-between px-6 items-end pb-2 text-xs font-semibold text-slate-900 z-20">
                                    <span className="ml-2">9:41</span>
                                    <div className="flex space-x-1.5 items-center mr-2">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1.66 17.65c.57.59 1.48.59 2.05 0L12 9.41l8.29 8.24c.57.59 1.48.59 2.05 0 .59-.59.59-1.55 0-2.14L13.03 6.18c-.57-.59-1.48-.59-2.05 0L1.66 15.51c-.59.59-.59 1.55 0 2.14z"/></svg>
                                        <div className="w-5 h-2.5 border border-slate-900 rounded-[4px] relative">
                                            <div className="absolute inset-0.5 bg-slate-900 rounded-[2px] w-[80%]"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Dynamic Island / Notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30"></div>

                                {/* Home Screen Grid */}
                                <div className="relative h-full flex flex-col pt-24 px-6 pb-8">
                                    <div className="grid grid-cols-4 gap-4 mb-auto">
                                        {/* User App */}
                                        <div className="flex flex-col items-center space-y-1">
                                            <div
                                                className="w-14 h-14 shadow-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-200 cursor-pointer bg-white"
                                                style={{
                                                    backgroundColor: backgroundColor || '#ffffff',
                                                    borderRadius: borderRadius ? `${borderRadius * (56/512)}px` : '12px'
                                                }}
                                            >
                                                <div style={logoTransformStyle}>
                                                    <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-800 text-center drop-shadow-sm truncate w-full">{projectName || 'App'}</span>
                                        </div>
                                        {/* Mock Apps */}
                                        {[...Array(15)].map((_, i) => (
                                            <div key={i} className="flex flex-col items-center space-y-1 opacity-60">
                                                <div className="w-14 h-14 bg-white/40 backdrop-blur-sm rounded-[12px] shadow-sm"></div>
                                                <div className="w-10 h-2 bg-slate-800/20 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Dock */}
                                    <div className="bg-white/30 backdrop-blur-xl rounded-[28px] p-4 flex justify-around items-center mt-4 mb-4">
                                         {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-[12px] shadow-sm"></div>
                                        ))}
                                    </div>
                                </div>
                                {/* Home Indicator */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full z-20"></div>
                             </div>

                             {/* Android Preview */}
                             <div className="w-full max-w-sm aspect-[9/19.5] rounded-[32px] overflow-hidden bg-zinc-900 shadow-2xl relative group border-4 border-zinc-800">
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80"></div>
                                {/* Status Bar */}
                                <div className="absolute top-0 w-full h-8 flex justify-between px-6 items-center text-xs font-medium text-white/90 z-20 pt-1">
                                    <span>12:00</span>
                                    <div className="flex space-x-2 items-center">
                                         <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L22 9h-3.2L12 17.2 5.2 9H2l10 12z"/></svg>
                                         <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                                    </div>
                                </div>
                                {/* Camera Hole */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30"></div>

                                <div className="relative h-full flex flex-col pt-16 px-6 pb-12">
                                     <div className="grid grid-cols-4 gap-x-4 gap-y-6 mb-auto">
                                        {/* User App */}
                                        <div className="flex flex-col items-center space-y-1">
                                            <div
                                                className="w-14 h-14 shadow-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-200 cursor-pointer"
                                                style={{
                                                    backgroundColor: backgroundColor || '#ffffff',
                                                    borderRadius: borderRadius ? `${borderRadius * (56/512)}px` : '50%' // Android often circle or adaptive
                                                }}
                                            >
                                                <div style={logoTransformStyle}>
                                                    <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-medium text-white/90 text-center drop-shadow-md truncate w-full">{projectName || 'App'}</span>
                                        </div>
                                         {/* Mock Apps */}
                                         {[...Array(15)].map((_, i) => (
                                            <div key={i} className="flex flex-col items-center space-y-1 opacity-50">
                                                <div className="w-14 h-14 bg-white/20 rounded-full shadow-sm"></div>
                                                <div className="w-10 h-2 bg-white/20 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Google Search Bar Mock */}
                                    <div className="bg-white/20 backdrop-blur-md rounded-full h-10 w-full mb-6 flex items-center px-4 space-x-2 opacity-80">
                                        <div className="w-4 h-4 rounded-full bg-white/50"></div>
                                        <div className="w-full h-1.5 bg-white/30 rounded-full"></div>
                                        <div className="w-3 h-4 rounded-sm bg-white/50 ml-auto"></div>
                                    </div>
                                     {/* Dock */}
                                     <div className="flex justify-around items-center px-2">
                                         {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full shadow-sm"></div>
                                        ))}
                                    </div>
                                </div>
                                {/* Nav Bar */}
                                <div className="absolute bottom-0 w-full h-8 flex justify-around items-center px-12 z-20 pb-2">
                                    <div className="w-3 h-3 border-l-2 border-b-2 border-white/60 rotate-45 transform"></div>
                                    <div className="w-3 h-3 border-2 border-white/60 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            <div className="break-inside-avoid">
                                <SocialPreviewCard
                                    platform="linkedin"
                                    image={ogImage || svgContent}
                                    title={projectName || 'Project Title'}
                                    description={description || "Designed with Logo Studio"}
                                />
                            </div>
                            <div className="break-inside-avoid">
                                <SocialPreviewCard
                                    platform="facebook"
                                    image={ogImage || svgContent}
                                    title={projectName || 'Project Title'}
                                    description={description || "Designed with Logo Studio"}
                                />
                            </div>
                            <div className="break-inside-avoid">
                                <SocialPreviewCard
                                    platform="twitter"
                                    image={ogImage || svgContent}
                                    title={projectName || 'Project Title'}
                                    description={description || "Designed with Logo Studio"}
                                />
                            </div>
                            <div className="break-inside-avoid">
                                <SocialPreviewCard
                                    platform="whatsapp"
                                    image={ogImage || svgContent}
                                    title={projectName || 'Project Title'}
                                    description={description || "Designed with Logo Studio"}
                                />
                            </div>
                            <div className="break-inside-avoid">
                                <SocialPreviewCard
                                    platform="instagram"
                                    image={ogImage || svgContent}
                                    title={projectName || 'Project Title'}
                                    description={description || "Designed with Logo Studio"}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'manifest' && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="mb-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showSplashInManifest}
                                    onChange={(e) => setShowSplashInManifest(e.target.checked)}
                                    className="rounded border-zinc-300"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Splash Screen</span>
                            </label>
                        </div>
                        <div className="transform scale-110 md:scale-150 origin-top transition-transform">
                            <ManifestPreview
                                display={displayMode || 'standalone'}
                                orientation={orientation || 'any'}
                                backgroundColor={backgroundColor}
                                themeColor={themeColor || backgroundColor}
                                showSplash={showSplashInManifest}
                                logoContent={svgContent}
                                scale={scale}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'exports' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Export Selection</h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={onSelectAllSizes} className="text-xs text-blue-600 hover:underline">Select All</button>
                                <span className="text-zinc-300">|</span>
                                <button onClick={onDeselectAllSizes} className="text-xs text-slate-500 hover:underline">Deselect All</button>
                            </div>
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
                                            onToggleSize(size);
                                            setNewSizeInput('');
                                        }
                                    }}
                                    disabled={!newSizeInput}
                                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Size
                                </button>
                                <div className="text-sm text-slate-500 ml-2">
                                    {selectedSizes.length + (selectedExtraAssets?.size || 0)} selected
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
                            {/* Favicon & Splash Previews with Selection UI */}
                            <div
                                onClick={() => onToggleExtraAsset('favicon')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets.has('favicon')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                 <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets.has('favicon')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets.has('favicon') && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-8 h-8 flex items-center justify-center">
                                         <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                    </div>
                                </div>
                                <div className="text-center shrink-0">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">favicon.ico</span>
                                </div>
                            </div>

                            <div
                                onClick={() => onToggleExtraAsset('splash')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets.has('splash')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets.has('splash')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets.has('splash') && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-16 h-24 bg-zinc-100 flex items-center justify-center border border-zinc-200" style={{backgroundColor: backgroundColor}}>
                                         <div className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                    </div>
                                </div>
                                <div className="text-center shrink-0">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">splash.png</span>
                                </div>
                            </div>

                            <div
                                onClick={() => onToggleExtraAsset('manifest')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets.has('manifest')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets.has('manifest')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets.has('manifest') && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                     <FileJson className="w-12 h-12 text-slate-300" />
                                </div>
                                <div className="text-center shrink-0">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">manifest.json</span>
                                </div>
                            </div>

                            <div
                                onClick={() => onToggleExtraAsset('appjson')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets.has('appjson')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets.has('appjson')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets.has('appjson') && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                     <FileJson className="w-12 h-12 text-slate-300" />
                                </div>
                                <div className="text-center shrink-0">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">app.json</span>
                                </div>
                            </div>

                            <div
                                onClick={() => onToggleExtraAsset('opengraph')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets.has('opengraph')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets.has('opengraph')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets.has('opengraph') && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                                     <div className="w-full aspect-[1200/630] bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                                        {ogImage ? (
                                            <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: ogImage }} />
                                        ) : (
                                            <div className="text-xs text-slate-400">Preview</div>
                                        )}
                                     </div>
                                </div>
                                <div className="text-center shrink-0">
                                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">opengraph.png</span>
                                </div>
                            </div>

                            {/* Standard Sizes */}
                            {[...AVAILABLE_SIZES, ...customSizes].sort((a, b) => b - a).map(size => {
                                const isSelected = selectedSizes.includes(size);
                                const previewSize = Math.min(160, Math.max(48, size));

                                return (
                                    <div
                                        key={size}
                                        onClick={() => onToggleSize(size)}
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

                        {/* JSON Viewers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                <h4 className="text-sm font-semibold mb-2 flex items-center"><FileJson className="w-4 h-4 mr-2"/> manifest.json</h4>
                                <CodeBlock code={JSON.stringify(generateManifest({ name: projectName, shortName: shortName || projectName }, selectedSizes), null, 2)} language="json" />
                            </div>
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                <h4 className="text-sm font-semibold mb-2 flex items-center"><FileJson className="w-4 h-4 mr-2"/> app.json</h4>
                                <CodeBlock code={JSON.stringify(generateAppJson({ name: projectName, shortName: shortName || projectName }, selectedSizes), null, 2)} language="json" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
