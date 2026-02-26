import { languages } from '../../i18n/ui';
import { ChevronDown, Globe } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeLanguage = (lang: string) => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);

    // Check if the first segment is a known language code
    if (segments.length > 0 && Object.keys(languages).includes(segments[0])) {
      segments[0] = lang;
    } else {
      // If no language prefix, prepend the new language (should ideally not happen if routing is strict)
      segments.unshift(lang);
    }

    const newPath = `/${segments.join('/')}`;
    window.location.href = newPath;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleOpen}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-slate-500" />
        <span>{currentLang.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {Object.entries(languages).map(([code, label]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                code === currentLang ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
