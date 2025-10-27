import React from 'react';
import { ViewModeToggle } from './ViewModeToggle';

type View = 'list' | 'new' | 'detail' | 'edit' | 'search' | 'map' | 'stargazing';
type ViewMode = 'desktop' | 'mobile';

interface NavbarProps {
  view: View;
  onNavigate: (view: 'list' | 'new' | 'search' | 'map' | 'stargazing') => void;
  currentUser: string | null;
  onLogout: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const NavButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string; isIcon?: boolean }> = ({ onClick, children, isIcon, ...props }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 text-sm font-semibold text-white bg-gray-700/80 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors ${isIcon ? 'p-2.5' : 'px-4 py-2'}`}
        {...props}
    >
        {children}
    </button>
);

export const Navbar: React.FC<NavbarProps> = ({ view, onNavigate, currentUser, onLogout, viewMode, setViewMode }) => {
    // The special map view has an overlay header. This logic renders just the back button for it.
    if (view === 'map') {
        return (
             <header className="px-4 sm:px-8 absolute top-0 left-0 right-0 z-20 bg-gray-900/50 backdrop-blur-sm flex justify-between items-center h-20">
                <div className="w-32 flex justify-start">
                    <NavButton onClick={() => onNavigate('list')} aria-label="Go back to journal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${viewMode === 'mobile' ? 'hidden' : 'inline'}`}>Journal</span>
                    </NavButton>
                </div>
                {/* Empty spacer to keep the back button on the left */}
                <div className="flex-1"></div>
            </header>
        )
    }

    // For all other pages, the navbar is part of the main document flow.
    return (
        <nav className="flex items-center h-14" aria-label="Main navigation">
            {view === 'list' ? (
                // Homepage: Centered controls
                <div className="w-full flex justify-center items-center gap-2">
                    <NavButton onClick={() => onNavigate('map')} aria-label="View map" isIcon={true}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM10 0a1 1 0 011 1v18a1 1 0 01-1.707.707L4.293 15.707A1 1 0 014 15V3a1 1 0 01.293-.707L9.293.293A1 1 0 0110 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M12.293.293a1 1 0 011.414 0l5 5A1 1 0 0119 6V18a1 1 0 01-1 1h-6a1 1 0 01-1-1V1a1 1 0 01.293-.707z" clipRule="evenodd" />
                        </svg>
                    </NavButton>
                    <NavButton onClick={() => onNavigate('search')} aria-label="Search entries" isIcon={true}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                       </svg>
                   </NavButton>
                   <NavButton onClick={() => onNavigate('stargazing')} aria-label="Stargazing view" isIcon={true}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                   </NavButton>
                   <NavButton onClick={() => onNavigate('new')} aria-label="Create new entry">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                       </svg>
                       <span className={`${viewMode === 'mobile' ? 'hidden' : 'hidden sm:inline'}`}>New</span>
                   </NavButton>
                    <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    {currentUser && (
                       <button onClick={onLogout} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors" title="Logout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                       </button>
                    )}
                </div>
            ) : (
                // Other pages: Back button left, view toggle right
                <div className="w-full flex justify-between items-center">
                    <div className="w-32 flex justify-start">
                        <NavButton onClick={() => onNavigate('list')} aria-label="Go back to journal">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className={`${viewMode === 'mobile' ? 'hidden' : 'inline'}`}>Journal</span>
                        </NavButton>
                    </div>
                    <div className="w-auto flex justify-end items-center gap-4">
                         {currentUser && (
                            <button onClick={onLogout} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors" title="Logout">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                           </button>
                        )}
                        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    </div>
                </div>
            )}
        </nav>
    );
};
