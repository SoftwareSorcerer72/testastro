import React, { useState } from 'react';
import { JournalEntryType, Planet, ZodiacSign, MoonPhase } from '../types';
import { JournalEntry } from './JournalEntry';
import { PLANET_DAYS, ZODIAC_SIGNS } from '../constants';

interface SearchPageProps {
    allEntries: JournalEntryType[];
    onSelectEntry: (id: string) => void;
    onDeleteEntry: (id: string) => void;
}

interface SearchFilters {
    keyword: string;
    hashtag: string;
    planetaryDay: Planet | '';
    planetaryHour: Planet | '';
    sunSign: ZodiacSign | '';
    moonSign: ZodiacSign | '';
    moonPhase: MoonPhase | '';
}

const SearchInput: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; label: string; name: string; }> = ({ value, onChange, placeholder, label, name }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 text-gray-200"
        />
    </div>
);

const SearchSelect: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; label: string; name: string; children: React.ReactNode }> = ({ value, onChange, label, name, children }) => (
     <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 text-gray-200"
        >
            {children}
        </select>
    </div>
);


export const SearchPage: React.FC<SearchPageProps> = ({ allEntries, onSelectEntry, onDeleteEntry }) => {
    const [filters, setFilters] = useState<SearchFilters>({
        keyword: '',
        hashtag: '',
        planetaryDay: '',
        planetaryHour: '',
        sunSign: '',
        moonSign: '',
        moonPhase: '',
    });
    const [searchResults, setSearchResults] = useState<JournalEntryType[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
        const results = allEntries.filter(entry => {
            const keywordMatch = !filters.keyword || entry.text.toLowerCase().includes(filters.keyword.toLowerCase());
            const hashtagMatch = !filters.hashtag || (entry.hashtags || []).map(h => h.toLowerCase()).includes(filters.hashtag.toLowerCase().replace(/#/g, ''));
            const dayMatch = !filters.planetaryDay || entry.planetaryDay === filters.planetaryDay;
            const hourMatch = !filters.planetaryHour || entry.planetaryHour === filters.planetaryHour;
            const sunSignMatch = !filters.sunSign || entry.sunSign === filters.sunSign;
            const moonSignMatch = !filters.moonSign || entry.moonSign === filters.moonSign;
            const moonPhaseMatch = !filters.moonPhase || entry.moonPhase === filters.moonPhase;
            
            return keywordMatch && hashtagMatch && dayMatch && hourMatch && sunSignMatch && moonSignMatch && moonPhaseMatch;
        });
        setSearchResults(results);
    };

    const handleReset = () => {
        setFilters({
            keyword: '',
            hashtag: '',
            planetaryDay: '',
            planetaryHour: '',
            sunSign: '',
            moonSign: '',
            moonPhase: '',
        });
        setSearchResults([]);
        setHasSearched(false);
    };

    return (
        <div className="animate-fade-in-up">
            <form onSubmit={handleSearch} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Search Journal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <SearchInput label="Keyword" placeholder="e.g., dream, project, peaceful..." name="keyword" value={filters.keyword} onChange={handleInputChange} />
                    <SearchInput label="Hashtag" placeholder="e.g., #creativity, #reflection..." name="hashtag" value={filters.hashtag} onChange={handleInputChange} />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <SearchSelect label="Planetary Day" name="planetaryDay" value={filters.planetaryDay} onChange={handleInputChange}>
                        <option value="">Any Day</option>
                        {PLANET_DAYS.map(p => <option key={p} value={p}>{p}</option>)}
                    </SearchSelect>
                    <SearchSelect label="Planetary Hour" name="planetaryHour" value={filters.planetaryHour} onChange={handleInputChange}>
                        <option value="">Any Hour</option>
                        {Object.values(Planet).map(p => <option key={p} value={p}>{p}</option>)}
                    </SearchSelect>
                     <SearchSelect label="Sun Sign" name="sunSign" value={filters.sunSign} onChange={handleInputChange}>
                        <option value="">Any Sign</option>
                        {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </SearchSelect>
                    <SearchSelect label="Moon Sign" name="moonSign" value={filters.moonSign} onChange={handleInputChange}>
                        <option value="">Any Sign</option>
                        {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </SearchSelect>
                    <SearchSelect label="Moon Phase" name="moonPhase" value={filters.moonPhase} onChange={handleInputChange}>
                        <option value="">Any Phase</option>
                        {Object.values(MoonPhase).map(p => <option key={p} value={p}>{p}</option>)}
                    </SearchSelect>
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={handleReset} className="px-6 py-2 font-semibold text-white bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                        Reset
                    </button>
                    <button type="submit" className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all duration-300">
                        Search
                    </button>
                </div>
            </form>

            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-300">
                    {hasSearched ? `Found ${searchResults.length} entries` : 'Search Results'}
                </h3>
                <div className="space-y-6">
                {hasSearched ? (
                    searchResults.length > 0 ? (
                        searchResults.map(entry => (
                            <JournalEntry key={entry.id} entry={entry} onDelete={onDeleteEntry} onSelect={onSelectEntry} />
                        ))
                    ) : (
                        <div className="text-center py-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-dashed border-gray-700 rounded-xl">
                            <p className="text-gray-400">No entries matched your search criteria.</p>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters.</p>
                        </div>
                    )
                ) : (
                     <div className="text-center py-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-dashed border-gray-700 rounded-xl">
                        <p className="text-gray-400">Use the form above to find specific entries.</p>
                     </div>
                )}
                </div>
            </div>
        </div>
    );
};