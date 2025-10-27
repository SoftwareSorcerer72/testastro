import React from 'react';
import { PlanetaryInfo, Planet } from '../types';
import { PLANET_DETAILS, ZODIAC_DETAILS } from '../constants';

const SunSignDisplay: React.FC<{ info: PlanetaryInfo }> = ({ info }) => {
    const sunDetails = PLANET_DETAILS[Planet.Sun];
    const signDetails = info.sunSign ? ZODIAC_DETAILS[info.sunSign] : null;
    if (!sunDetails || !signDetails) return null;
    
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center w-20 text-center">
            <span className={`text-3xl`}>☀️</span>
            <div className="text-xs text-gray-400">Sun Sign</div>
            <div className={`font-bold text-sm flex items-center ${signDetails.color}`}>
                <span className="mr-1 text-base">{signDetails.emoji}</span>
                {info.sunSign}
            </div>
        </div>
    );
};

const MoonSignDisplay: React.FC<{ info: PlanetaryInfo }> = ({ info }) => {
    const moonDetails = PLANET_DETAILS[Planet.Moon];
    const signDetails = info.moonSign ? ZODIAC_DETAILS[info.moonSign] : null;
    if (!moonDetails || !signDetails) return null;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center w-20 text-center">
             <div className={`font-bold text-sm flex items-center ${signDetails.color}`}>
                <span className="mr-1 text-base">{signDetails.emoji}</span>
                {info.moonSign}
            </div>
            <div className="text-xs text-gray-400">Moon Sign</div>
            <span className={`text-3xl`}>🌙</span>
        </div>
    );
};

const PlanetaryInfoDisplay: React.FC<{ info: PlanetaryInfo; type: 'Day' | 'Hour' }> = ({ info, type }) => {
    const planet = type === 'Day' ? info.planetaryDay : info.planetaryHour;
    const details = planet ? PLANET_DETAILS[planet] : null;
    if (!details) return null;
    
    const position = type === 'Day' ? 'top-20 left-12' : 'top-20 right-12';
    
    return (
        <div className={`absolute ${position} flex flex-col items-center w-20 text-center`}>
            <div className="text-xs text-gray-400">{`Planetary ${type}`}</div>
            <div className={`font-bold text-sm ${details.color}`}>{planet}</div>
        </div>
    );
};

const RetrogradeDisplay: React.FC<{ info: PlanetaryInfo }> = ({ info }) => {
    const retrogrades = info.retrogrades;
    if (!retrogrades) return null;

    return (
        <div className="absolute bottom-20 left-12 flex flex-col items-center w-20 text-center">
            <div className="text-xs text-gray-400">Retrogrades</div>
            <div className="font-bold text-sm h-5">
                {retrogrades.length > 0 ? (
                    <div className="flex justify-center items-center space-x-2">
                        {retrogrades.map(p => {
                           const details = PLANET_DETAILS[p];
                           if (!details) return null;
                           return <span key={p} className={`${details.color} text-base`} title={p}>{details.emoji}</span>
                        })}
                    </div>
                ) : (
                    <span className="text-gray-400 text-xs">None</span>
                )}
            </div>
        </div>
    );
};

interface StargazingPageProps {
    currentTime: Date;
    planetaryInfo: PlanetaryInfo | null;
    isLoading: boolean;
}

export const StargazingPage: React.FC<StargazingPageProps> = ({ currentTime, planetaryInfo, isLoading }) => {
    const timeParts = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).split(' ');
    const timeString = timeParts[0] || '';
    const ampmString = timeParts[1] || '';
    const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center p-4 animate-fade-in-up">
            <div 
                className="w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] bg-gray-900 border-4 border-purple-600 rounded-full flex flex-col items-center justify-center relative shadow-2xl shadow-purple-500/50 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=800&auto=format&fit=crop)' }}
            >
                {planetaryInfo ? (
                    <>
                        <SunSignDisplay info={planetaryInfo} />
                        <MoonSignDisplay info={planetaryInfo} />
                        <PlanetaryInfoDisplay info={planetaryInfo} type="Day" />
                        <PlanetaryInfoDisplay info={planetaryInfo} type="Hour" />
                        <RetrogradeDisplay info={planetaryInfo} />
                    </>
                ) : (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400">Awaiting cosmic data...</p>
                     </div>
                )}

                <div className="text-center z-10 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl">
                    <div className="flex items-baseline justify-center text-white font-mono tracking-wider">
                       <span className="text-5xl sm:text-6xl font-bold">{timeString}</span>
                       <span className="text-2xl sm:text-3xl font-semibold ml-2 w-10 text-left">{ampmString}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        {dateString}
                    </div>
                </div>
            </div>
        </div>
    );
};