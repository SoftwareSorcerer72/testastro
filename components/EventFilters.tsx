import React from 'react';
import { AstrologicalEventType } from '../types';

interface EventFiltersProps {
  visibleTypes: Record<AstrologicalEventType, boolean>;
  onToggleType: (type: AstrologicalEventType | 'all-show' | 'all-hide') => void;
}

const EVENT_TYPE_DETAILS: Record<AstrologicalEventType, { label: string; icon: React.ReactNode }> = {
  [AstrologicalEventType.PlanetaryDayChange]: { label: 'Day', icon: '🗓️' },
  [AstrologicalEventType.PlanetaryHourChange]: { label: 'Hour', icon: '🕰️' },
  [AstrologicalEventType.SunSignChange]: { label: 'Sun Sign', icon: '☀️' },
  [AstrologicalEventType.MoonSignChange]: { label: 'Moon Sign', icon: '🌙' },
  [AstrologicalEventType.MoonPhaseChange]: { label: 'Moon Phase', icon: '🌗' },
  [AstrologicalEventType.Retrograde]: { label: 'Retrograde', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m-8-8h4m8 0h4m-4.95-4.95l2.122-2.122m-10.244 0l2.122 2.122m0 6.002l-2.122 2.122m10.244 0l-2.122-2.122" />
      </svg>
  )},
};

const FilterButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 border ${
            isActive
                ? 'bg-purple-600/80 border-purple-500 text-white shadow-md'
                : 'bg-gray-700/60 border-gray-600 text-gray-300 hover:bg-gray-600/80 hover:border-gray-500'
        }`}
    >
        {children}
    </button>
);


export const EventFilters: React.FC<EventFiltersProps> = ({ visibleTypes, onToggleType }) => {
    const allVisible = Object.values(visibleTypes).every(Boolean);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-4 mb-6 animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-sm font-semibold text-gray-400 mr-2 shrink-0">Show Events:</span>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(EVENT_TYPE_DETAILS).map(typeStr => {
                        const type = typeStr as AstrologicalEventType;
                        const details = EVENT_TYPE_DETAILS[type];
                        return (
                             <FilterButton
                                key={type}
                                onClick={() => onToggleType(type)}
                                isActive={visibleTypes[type]}
                            >
                                <span className="text-base">{details.icon}</span>
                                {details.label}
                            </FilterButton>
                        )
                    })}
                </div>
                <div className="flex-grow"></div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onToggleType(allVisible ? 'all-hide' : 'all-show')}
                        className="text-xs font-semibold text-purple-300 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-purple-900/50 hover:bg-purple-800/70"
                    >
                        {allVisible ? 'Hide All' : 'Show All'}
                    </button>
                </div>
            </div>
        </div>
    );
};