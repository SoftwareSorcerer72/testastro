import React from 'react';
import { AstrologicalEventEntry as AstrologicalEventEntryType, AstrologicalEventType, Planet, ZodiacSign, MoonPhase } from '../types';
import { PLANET_DETAILS, ZODIAC_DETAILS, MOON_PHASE_DETAILS } from '../constants';

interface AstrologicalEventEntryProps {
  entry: AstrologicalEventEntryType;
}

const PlanetPill: React.FC<{ planet: Planet }> = ({ planet }) => {
  const details = PLANET_DETAILS[planet];
  if (!details) return null;
  return (
    <div className="flex items-center space-x-2 bg-gray-900/60 rounded-full px-4 py-1.5 text-sm shadow-md border border-purple-900">
      <span className={`${details.color} font-bold flex items-center`}>
        <span className="mr-2 text-lg">{details.emoji}</span>
        {planet}
      </span>
    </div>
  );
};

const ChangePill: React.FC<{ from: string; to: string; fromEmoji?: string; toEmoji?: string; }> = ({ from, to, fromEmoji, toEmoji }) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-900/60 rounded-full px-4 py-1.5 text-sm shadow-md border border-purple-900">
            <span className="font-semibold flex items-center">{fromEmoji && <span className="mr-2 text-lg">{fromEmoji}</span>}{from}</span>
            <span className="text-purple-400 font-bold">&rarr;</span>
            <span className="font-semibold flex items-center">{toEmoji && <span className="mr-2 text-lg">{toEmoji}</span>}{to}</span>
        </div>
    );
};


export const AstrologicalEventEntry: React.FC<AstrologicalEventEntryProps> = ({ entry }) => {
    const formattedDate = new Date(entry.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
    });

    const getEventDetails = () => {
        let icon: React.ReactNode;
        let detailsContent: React.ReactNode;

        const cosmicShiftIcon = (
            <div className="text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v4m0 8v4m-8-8h4m8 0h4m-4.95-4.95l2.122-2.122m-10.244 0l2.122 2.122m0 6.002l-2.122 2.122m10.244 0l-2.122-2.122" />
                </svg>
            </div>
        );

        switch (entry.type) {
            case AstrologicalEventType.Retrograde:
                icon = cosmicShiftIcon;
                detailsContent = (
                    <div className="flex flex-wrap gap-3">
                        {entry.planets.map(planet => <PlanetPill key={planet} planet={planet} />)}
                    </div>
                );
                break;
            case AstrologicalEventType.SunSignChange:
                icon = <span className="text-3xl">☀️</span>;
                detailsContent = <ChangePill from={entry.fromSign} to={entry.toSign} fromEmoji={ZODIAC_DETAILS[entry.fromSign]?.emoji} toEmoji={ZODIAC_DETAILS[entry.toSign]?.emoji} />;
                break;
            case AstrologicalEventType.MoonSignChange:
                icon = <span className="text-3xl">🌙</span>;
                detailsContent = <ChangePill from={entry.fromSign} to={entry.toSign} fromEmoji={ZODIAC_DETAILS[entry.fromSign]?.emoji} toEmoji={ZODIAC_DETAILS[entry.toSign]?.emoji} />;
                break;
            case AstrologicalEventType.MoonPhaseChange:
                icon = <span className="text-3xl">{MOON_PHASE_DETAILS[entry.toPhase]?.emoji ?? '🌗'}</span>;
                detailsContent = <ChangePill from={entry.fromPhase} to={entry.toPhase} />;
                break;
            case AstrologicalEventType.PlanetaryDayChange:
                icon = <span className="text-3xl">🗓️</span>;
                detailsContent = <ChangePill from={entry.fromPlanet} to={entry.toPlanet} fromEmoji={PLANET_DETAILS[entry.fromPlanet]?.emoji} toEmoji={PLANET_DETAILS[entry.toPlanet]?.emoji}/>;
                break;
            case AstrologicalEventType.PlanetaryHourChange:
                icon = <span className="text-3xl">🕰️</span>;
                detailsContent = <ChangePill from={entry.fromPlanet} to={entry.toPlanet} fromEmoji={PLANET_DETAILS[entry.fromPlanet]?.emoji} toEmoji={PLANET_DETAILS[entry.toPlanet]?.emoji}/>;
                break;
            default:
                icon = cosmicShiftIcon;
                detailsContent = null;
        }
        return { icon, detailsContent };
    };

    const { icon, detailsContent } = getEventDetails();

    return (
        <div className="bg-gradient-to-br from-[#2f264d] to-[#1f1a33] backdrop-blur-sm border border-purple-800/50 rounded-xl shadow-lg p-5 flex items-start gap-5 animate-fade-in-up">
            <div className="mt-1 shrink-0">{icon}</div>
            <div>
                <p className="text-xs text-purple-300 mb-1">{formattedDate}</p>
                <h3 className="text-xl font-bold text-white mb-2">{entry.title}</h3>
                <p className="text-gray-300 mb-4 max-w-prose">{entry.description}</p>
                {detailsContent}
            </div>
        </div>
    );
};