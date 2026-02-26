import React from 'react';

interface ManifestPreviewProps {
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'natural' | 'landscape' | 'portrait';
  backgroundColor?: string;
  themeColor?: string;
  showSplash?: boolean;
  logoContent?: string; // HTML string for svg
  scale?: number;
}

export function ManifestPreview({
    display,
    orientation,
    backgroundColor = '#ffffff',
    themeColor = '#ffffff',
    showSplash = false,
    logoContent = '',
    scale = 1
}: ManifestPreviewProps) {
  const isLandscape = orientation === 'landscape';

  const logoTransformStyle = {
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div
        className={`relative shadow-xl overflow-hidden border-[6px] border-zinc-800 rounded-[2rem] transition-all duration-300 flex flex-col ${
            isLandscape ? 'w-64 h-32' : 'w-32 h-64'
        }`}
        style={{
            backgroundColor: backgroundColor,
            // Smart border contrast if background is dark
            borderColor: '#27272a' // Keep dark frame for realism, but maybe add ring?
        }}
      >
          {showSplash ? (
              <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden">
                  {/* Splash Screen View */}
                  <div className="w-16 h-16">
                      <div style={logoTransformStyle}>
                           <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: logoContent }} />
                      </div>
                  </div>
                  {/* Loading Spinner simulation */}
                  <div className="absolute bottom-12 w-6 h-6 border-2 border-current rounded-full opacity-20 animate-spin" style={{ color: themeColor === backgroundColor ? 'currentColor' : themeColor }}></div>
              </div>
          ) : (
              <>
                {/* Status Bar (Hidden in fullscreen) */}
                {display !== 'fullscreen' && (
                    <div className="h-3 w-full flex justify-between items-center px-3 shrink-0" style={{ backgroundColor: themeColor }}>
                        <div className="w-8 h-1 bg-black/20 rounded-full"></div>
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-black/20 rounded-full"></div>
                            <div className="w-1 h-1 bg-black/20 rounded-full"></div>
                        </div>
                    </div>
                )}

                {/* Browser UI (Only for browser and minimal-ui) */}
                {(display === 'browser' || display === 'minimal-ui') && (
                    <div className="bg-zinc-100 border-b border-zinc-200 p-1.5 flex items-center space-x-1 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                        <div className="flex-1 h-2 bg-white rounded-[2px] border border-zinc-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                    </div>
                )}

                {/* App Content */}
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
                    <div className="w-8 h-8 rounded-lg bg-black/5 mb-2"></div>
                    <div className="w-16 h-1 bg-black/5 rounded-full mb-1"></div>
                    <div className="w-12 h-1 bg-black/5 rounded-full"></div>
                </div>

                {/* Bottom Nav (Browser only) */}
                {display === 'browser' && (
                    <div className="h-4 bg-zinc-100 border-t border-zinc-200 w-full flex justify-around items-center px-2 shrink-0">
                        <div className="w-2 h-2 bg-zinc-300 rounded-[1px]"></div>
                        <div className="w-2 h-2 bg-zinc-300 rounded-[1px]"></div>
                        <div className="w-2 h-2 bg-zinc-300 rounded-[1px]"></div>
                    </div>
                )}

                {/* Gesture Bar (Standalone/Minimal) */}
                {(display === 'standalone' || display === 'minimal-ui' || display === 'fullscreen') && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black/20 rounded-full"></div>
                )}
              </>
          )}
      </div>
      <div className="mt-4 flex gap-2">
         <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">{display}</span>
         <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">{orientation}</span>
         {showSplash && <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">Splash</span>}
      </div>
    </div>
  );
}
