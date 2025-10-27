import React, { useState } from 'react';
import { JournalEntryType, Planet, ZodiacSign, MoonPhase, Mood } from '../types';
import { PLANET_DETAILS, ZODIAC_DETAILS, MOON_PHASE_DETAILS, MOOD_DETAILS } from '../constants';
import { MediaGallery } from './ImageGallery';

interface JournalEntryProps {
  entry: JournalEntryType;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  isDetailView?: boolean;
}

const MoodInfoDisplay: React.FC<{ mood: Mood }> = ({ mood }) => {
    const details = MOOD_DETAILS[mood];
    if (!details) return null;
    return (
        <div className="flex items-center space-x-2 bg-gray-900/50 rounded-full px-3 py-1 text-sm" title={`Mood: ${mood}`}>
            <span className="text-lg">{details.emoji}</span>
            <span className={`${details.color} font-bold`}>{mood}</span>
        </div>
    );
};

const PlanetaryInfoDisplay: React.FC<{ label: string; planet: Planet }> = ({ label, planet }) => {
  const details = PLANET_DETAILS[planet];
  return (
    <div className="flex items-center space-x-2 bg-gray-900/50 rounded-full px-3 py-1 text-sm" title={`Planetary ${label} is ${planet}`}>
      <span className="font-medium text-gray-400">{label}:</span>
      <span className={`${details.color} font-bold flex items-center`}>
        <span className="mr-1 text-lg">{details.emoji}</span>
        {planet}
      </span>
    </div>
  );
};

const ZodiacInfoDisplay: React.FC<{ label: 'Sun' | 'Moon'; sign: ZodiacSign; phase?: MoonPhase }> = ({ label, sign, phase }) => {
    const signDetails = ZODIAC_DETAILS[sign];
    const planetDetails = label === 'Sun' ? PLANET_DETAILS[Planet.Sun] : PLANET_DETAILS[Planet.Moon];
    const phaseDetails = (phase && MOON_PHASE_DETAILS[phase]) ? MOON_PHASE_DETAILS[phase] : null;

    return (
      <div className="flex items-center space-x-2 bg-gray-900/50 rounded-full pl-2 pr-3 py-1 text-sm" title={`${label} in ${sign}${phase ? `, ${phase}` : ''}`}>
        <span className={`${planetDetails.color} text-lg`}>{planetDetails.emoji}</span>
        <span className={`${signDetails.color} font-bold flex items-center`}>
            <span className="mr-1 text-lg">{signDetails.emoji}</span>
            {sign}
        </span>
        {phase && phaseDetails && (
             <>
                <span className="text-gray-500">|</span>
                <span className={`${phaseDetails.color} font-semibold flex items-center gap-1.5`}><span className="text-lg">{phaseDetails.emoji}</span>{phase}</span>
            </>
        )}
      </div>
    );
};

const RetrogradeInfoDisplay: React.FC<{ planets?: Planet[] }> = ({ planets }) => {
    if (!planets || planets.length === 0) return null;
  
    return (
      <div className="flex items-center space-x-2 bg-red-900/60 rounded-full px-3 py-1 text-sm" title={`Planets in Retrograde: ${planets.join(', ')}`}>
        <span className="font-medium text-red-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 11.414V14a1 1 0 102 0v-2.586l.293.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
            </svg>
            Retrograde
        </span>
        <div className="flex items-center space-x-1">
          {planets.map(planet => {
            const details = PLANET_DETAILS[planet];
            return (
              <span key={planet} className={`${details.color} font-bold flex items-center`}>
                  <span className="text-lg" title={planet}>{details.emoji}</span>
              </span>
            )
          })}
        </div>
      </div>
    );
};


export const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onDelete, onSelect, onEdit, isDetailView }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const formattedDate = new Date(entry.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const allMedia = [
    ...(entry.images?.map(src => ({ type: 'image' as const, src })) ?? []),
    ...(entry.videos?.map(src => ({ type: 'video' as const, src })) ?? [])
  ];
  const mediaCount = allMedia.length;

  const MAX_LENGTH = 250;
  const isTruncated = !isDetailView && entry.text.length > MAX_LENGTH;
  const displayText = isTruncated ? `${entry.text.substring(0, MAX_LENGTH)}...` : entry.text;

  const handleOpenGallery = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click-through
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <>
      <div 
          className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-5 transition-transform duration-300 ${!isDetailView ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
          onClick={!isDetailView && onSelect ? () => onSelect(entry.id) : undefined}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <p className="shrink-0">{formattedDate}</p>
                {entry.location && (
                    <div className="flex items-center sm:border-l border-gray-600 sm:pl-3" title={`Location: ${entry.location}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate max-w-[20ch]">{entry.location}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center shrink-0 self-end sm:self-center">
              {isDetailView && onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(entry.id); }}
                  className="text-gray-500 hover:text-purple-400 transition-colors mr-2"
                  aria-label="Edit entry"
                  title="Edit entry"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                className="text-gray-500 hover:text-red-400 transition-colors"
                aria-label="Delete entry"
                title="Delete entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <MoodInfoDisplay mood={entry.mood} />
            <PlanetaryInfoDisplay label="Day" planet={entry.planetaryDay} />
            <PlanetaryInfoDisplay label="Hour" planet={entry.planetaryHour} />
            <ZodiacInfoDisplay label="Sun" sign={entry.sunSign} />
            <ZodiacInfoDisplay label="Moon" sign={entry.moonSign} phase={entry.moonPhase} />
            <RetrogradeInfoDisplay planets={entry.retrogrades} />
        </div>

        <p className="text-gray-200 whitespace-pre-wrap">{displayText}</p>
        {isTruncated && <span className="text-purple-400 font-semibold mt-2 block">Read more...</span>}

        {entry.hashtags && entry.hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
                {entry.hashtags.map(tag => (
                    <span key={tag} className="bg-purple-800/50 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                        #{tag}
                    </span>
                ))}
            </div>
        )}

        {allMedia.length > 0 && (
            <div className="mt-6 relative h-28 flex items-center group">
                {allMedia.map((media, index) => {
                    const commonClass = "absolute w-24 h-24 object-cover rounded-md border-2 border-gray-700 shadow-lg transition-transform duration-300 ease-out cursor-pointer group-hover:rotate-0 group-hover:!translate-x-[var(--tx)]";
                    const style = {
                        zIndex: index,
                        transformOrigin: 'bottom left',
                        transform: `translateX(${index * 15}px) rotate(${(index * 3) - ((mediaCount - 1) * 1.5)}deg)`,
                        '--tx': `${index * 90}px`
                    } as React.CSSProperties;

                    if (media.type === 'image') {
                        return (
                            <img
                                key={index}
                                src={media.src}
                                alt={`Entry content ${index + 1}`}
                                onClick={(e) => handleOpenGallery(index, e)}
                                className={commonClass}
                                style={style}
                            />
                        );
                    } else { // Video
                        return (
                            <div key={index} className={`${commonClass} bg-black overflow-hidden`} style={style} onClick={(e) => handleOpenGallery(index, e)}>
                                <video
                                    src={media.src}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        )}
      </div>

      {isGalleryOpen && (
        <MediaGallery 
            media={allMedia}
            startIndex={galleryStartIndex}
            onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </>
  );
};