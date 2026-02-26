import React, { useState, useEffect } from 'react';
import { BrowserTabPreview } from './BrowserTabPreview';
import { ManifestPreview } from './ManifestPreview';
import { SocialPreviewCard } from './SocialPreviewCard';
import { ui, defaultLang } from '@/i18n/ui';
import { Check, Download, Globe, Smartphone, Share2, Layout, FileJson } from 'lucide-react';
import { generateOpenGraph, generateManifest, generateAppJson } from '@/lib/generators';

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
  onSelectAllSizes?: () => void;
  onDeselectAllSizes?: () => void;
  scale?: number;
  position?: { x: number; y: number };
  shortName?: string;
  description?: string;
  themeColor?: string;
  selectedExtraAssets?: Set<string>;
  onToggleExtraAsset?: (asset: string) => void;
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
    onSelectAllSizes,
    onDeselectAllSizes,
    scale = 1,
    position = { x: 0, y: 0 },
    shortName,
    description,
    themeColor,
    selectedExtraAssets = new Set(),
    onToggleExtraAsset
}: PreviewGalleryProps) {
  const [activeTab, setActiveTab] = useState<'web' | 'mobile' | 'social' | 'manifest' | 'exports'>('web');
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
                                </div>
                             </div>

                             {/* Android Preview */}
                             <div className="w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 shadow-md relative group border border-zinc-700">
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>
                                <div className="absolute top-0 w-full h-6 flex justify-between px-4 items-center text-[10px] font-medium text-white/80 z-20">
                                    <span>12:00</span>
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
                        <div className="mb-4">
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
                                    {selectedSizes.length + (selectedExtraAssets?.size || 0)} selected
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
                            {/* Favicon & Splash Previews with Selection UI */}
                            <div
                                onClick={() => onToggleExtraAsset?.('favicon')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets?.has('favicon')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                 <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets?.has('favicon')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets?.has('favicon') && <Check className="w-3 h-3 text-white" />}
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
                                onClick={() => onToggleExtraAsset?.('splash')}
                                className={`relative group cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-end space-y-3 h-[240px] transition-all ${
                                    selectedExtraAssets?.has('splash')
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <div className="absolute top-3 right-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                        selectedExtraAssets?.has('splash')
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                    }`}>
                                        {selectedExtraAssets?.has('splash') && <Check className="w-3 h-3 text-white" />}
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

                            {/* Standard Sizes */}
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

                        {/* JSON Viewers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                <h4 className="text-sm font-semibold mb-2 flex items-center"><FileJson className="w-4 h-4 mr-2"/> manifest.json</h4>
                                <pre className="text-xs bg-zinc-50 dark:bg-zinc-950 p-2 rounded overflow-auto h-40">
                                    {JSON.stringify(generateManifest({ name: projectName, shortName: shortName || projectName }, selectedSizes), null, 2)}
                                </pre>
                            </div>
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                <h4 className="text-sm font-semibold mb-2 flex items-center"><FileJson className="w-4 h-4 mr-2"/> app.json</h4>
                                <pre className="text-xs bg-zinc-50 dark:bg-zinc-950 p-2 rounded overflow-auto h-40">
                                    {JSON.stringify(generateAppJson({ name: projectName, shortName: shortName || projectName }, selectedSizes), null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
