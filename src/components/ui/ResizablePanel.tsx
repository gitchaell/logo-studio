import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ResizablePanelProps {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
  storageKey?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
}

export function ResizablePanel({
  defaultWidth = 256,
  minWidth = 200,
  maxWidth = 480,
  side = 'left',
  storageKey,
  children,
  className = '',
  collapsible = true,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved state
  useEffect(() => {
    if (storageKey) {
      const savedWidth = localStorage.getItem(`${storageKey}-width`);
      const savedCollapsed = localStorage.getItem(`${storageKey}-collapsed`);
      if (savedWidth) setWidth(Number(savedWidth));
      if (savedCollapsed) setIsCollapsed(savedCollapsed === 'true');
    }
  }, [storageKey]);

  // Save state
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`${storageKey}-width`, String(width));
      localStorage.setItem(`${storageKey}-collapsed`, String(isCollapsed));
    }
  }, [width, isCollapsed, storageKey]);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      let newWidth;
      const rect = sidebarRef.current.getBoundingClientRect();
      if (side === 'left') {
        newWidth = mouseMoveEvent.clientX - rect.left;
      } else {
        newWidth = rect.right - mouseMoveEvent.clientX;
      }

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    }
  }, [isResizing, side, minWidth, maxWidth]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      ref={sidebarRef}
      className={`relative flex flex-col shrink-0 h-full bg-white dark:bg-zinc-900 transition-[width] border-zinc-200 dark:border-zinc-800
        ${isResizing ? 'duration-0 select-none' : 'duration-300 ease-in-out'}
        ${side === 'left' ? 'border-r' : 'border-l'}
        ${className}`}
      style={{ width: isMobile ? '100%' : (isCollapsed ? 0 : width) }}
    >
      <div className={`flex-1 overflow-hidden flex flex-col min-w-0 ${isCollapsed && !isMobile ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-opacity duration-200`}>
        {children}
      </div>

      {/* Drag Handle */}
      {!isCollapsed && !isMobile && (
        <div
          className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-40 group flex items-center justify-center
            ${side === 'left' ? '-right-0.5' : '-left-0.5'}`}
          onMouseDown={startResizing}
          title="Drag to resize"
        >
             <div className="w-0.5 h-full group-hover:bg-blue-500 transition-colors" />
        </div>
      )}

      {/* Collapse Toggle Button */}
      {collapsible && !isMobile && (
        <button
          onClick={toggleCollapse}
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-blue-500 z-50 focus:outline-none transition-transform duration-300 hover:scale-110
            ${side === 'left' ? '-right-3' : '-left-3'}
          `}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
             side === 'left' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          ) : (
             side === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
