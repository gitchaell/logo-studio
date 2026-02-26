import React from 'react';

interface SocialPreviewCardProps {
  platform: 'linkedin' | 'whatsapp' | 'facebook' | 'twitter' | 'instagram';
  image: string; // SVG String
  title: string;
  description: string;
  domain?: string;
}

function safeBtoa(str: string) {
  try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(_, p1) {
              return String.fromCharCode(Number('0x' + p1));
      }));
  } catch (e) {
      console.error('Base64 encoding failed', e);
      return '';
  }
}

export function SocialPreviewCard({ platform, image, title, description, domain = 'example.com' }: SocialPreviewCardProps) {
  const imgSrc = image ? `data:image/svg+xml;base64,${safeBtoa(image)}` : '';

  if (platform === 'linkedin') {
      return (
          <div className="w-[500px] bg-white border border-zinc-200 rounded-lg overflow-hidden font-sans text-left shadow-sm">
              <div className="relative aspect-[1.91/1] w-full bg-zinc-100 overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">Loading...</div>
                  )}
              </div>
              <div className="p-3 bg-[#f3f6f8] border-t border-zinc-100">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{title || 'Post Title'}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{domain}</p>
              </div>
          </div>
      );
  }

  if (platform === 'facebook') {
      return (
          <div className="w-[500px] bg-white border border-zinc-200 rounded overflow-hidden font-sans text-left shadow-sm">
               <div className="relative aspect-[1.91/1] w-full bg-zinc-100 overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">Loading...</div>
                  )}
              </div>
              <div className="p-3 bg-[#f0f2f5] border-t border-zinc-100">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide truncate">{domain}</p>
                  <h3 className="text-[16px] font-bold text-[#050505] truncate leading-tight mt-0.5">{title || 'Post Title'}</h3>
                  <p className="text-[14px] text-[#65676b] truncate mt-1 line-clamp-1">{description || 'Post description goes here...'}</p>
              </div>
          </div>
      );
  }

  if (platform === 'twitter') {
      return (
          <div className="w-[500px] bg-white border border-zinc-200 rounded-xl overflow-hidden font-sans text-left shadow-sm">
               <div className="relative aspect-[1.91/1] w-full bg-zinc-100 overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">Loading...</div>
                  )}
              </div>
              <div className="p-3 bg-white border-t border-zinc-100">
                  <p className="text-xs text-slate-500 uppercase truncate mb-0.5">{domain}</p>
                  <h3 className="text-[15px] font-bold text-slate-900 truncate">{title || 'Post Title'}</h3>
                  <p className="text-[14px] text-slate-500 truncate mt-0.5">{description || 'Post description goes here...'}</p>
              </div>
          </div>
      );
  }

  if (platform === 'whatsapp') {
      return (
           <div className="w-[300px] bg-[#dcf8c6] p-2 rounded-lg font-sans text-left relative shadow-sm">
               <div className="bg-[#f7f7f7] rounded-lg overflow-hidden">
                    <div className="bg-zinc-200 aspect-video w-full overflow-hidden relative">
                       {imgSrc ? (
                            <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">Loading...</div>
                        )}
                    </div>
                    <div className="p-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{title || 'Title'}</h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{description || 'Description'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{domain}</p>
                    </div>
               </div>
           </div>
      );
  }

   if (platform === 'instagram') {
      return (
          <div className="w-[400px] bg-white border border-zinc-200 rounded font-sans text-left shadow-sm">
               <div className="flex items-center p-3 border-b border-zinc-100">
                   <div className="w-8 h-8 rounded-full bg-zinc-200 mr-3"></div>
                   <span className="text-sm font-semibold text-slate-900">{domain?.split('.')[0] || 'username'}</span>
               </div>
               <div className="aspect-square w-full bg-zinc-100 overflow-hidden relative">
                  {imgSrc ? (
                    <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">Loading...</div>
                  )}
              </div>
              <div className="p-3">
                  <p className="text-sm text-slate-900"><span className="font-semibold mr-2">{domain?.split('.')[0] || 'username'}</span>{title || 'My new logo!'}</p>
              </div>
          </div>
      );
  }

  return null;
}
