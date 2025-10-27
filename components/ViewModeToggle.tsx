import React from 'react';

type ViewMode = 'desktop' | 'mobile';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center bg-gray-700/80 rounded-lg p-1 space-x-1">
      <button
        onClick={() => setViewMode('desktop')}
        aria-pressed={viewMode === 'desktop'}
        title="Desktop View"
        className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 2.75a.75.75 0 00-1.5 0v1.5h1.5V2.75z" />
          <path fillRule="evenodd" d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.506 4.494a.75.75 0 01.75-.058l1.303.752a.75.75 0 01-.692 1.298L5.563 5.734a.75.75 0 01-.057-.75l-.001-.001zM4.448 5.563a.75.75 0 011.298-.692l.752 1.303a.75.75 0 01-.692 1.298L4.448 6.166a.75.75 0 01-.058-.75l.058-.103zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm1.5 4.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM10 18a.75.75 0 00.75-.75v-1.5a.75.75 0 00-1.5 0v1.5c0 .414.336.75.75.75zm3.197-2.803a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM15.506 15.506a.75.75 0 01.057.75l-.752 1.303a.75.75 0 11-1.298-.692l.752-1.303a.75.75 0 011.24-.058zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zm-3.25 4.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM10 6a4 4 0 100 8 4 4 0 000-8zm0 1.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => setViewMode('mobile')}
        aria-pressed={viewMode === 'mobile'}
        title="Mobile View"
        className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
