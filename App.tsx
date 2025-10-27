import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppEntry, JournalEntryType, AstrologicalEventEntry, Mood, PlanetaryInfo, AstrologicalEventType, RetrogradeEventEntry, UserData } from './types';
import { Navbar } from './components/Navbar';
import { EntryForm } from './components/NewEntryForm';
import { JournalEntry } from './components/JournalEntry';
import { AstrologicalEventEntry as AstrologicalEventEntryCard } from './components/AstrologicalEventEntry';
import { getPlanetaryInfo, geocodeLocation } from './services/astrologyService';
import { SearchPage } from './components/SearchPage';
import { MapPage } from './components/MapPage';
import { StargazingPage } from './components/StargazingPage';
import { EventFilters } from './components/EventFilters';
import { LoginPage } from './components/LoginPage';
import { CreateAccountPage } from './components/CreateAccountPage';
import { AdminPage } from './components/AdminPage';

type View = 'list' | 'new' | 'detail' | 'edit' | 'search' | 'map' | 'stargazing' | 'admin';
type AuthView = 'login' | 'createAccount';
type ViewMode = 'desktop' | 'mobile';

const USERS_KEY = 'astroJournalUsers';
const SESSION_KEY = 'astroJournalCurrentUser';

// FIX: Changed to a named export to resolve module resolution error.
export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY));
  const [authView, setAuthView] = useState<AuthView>('login');
  
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [entries, setEntries] = useState<AppEntry[]>([]);

  const [view, setView] = useState<View>('list');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [visibleEventTypes, setVisibleEventTypes] = useState<Record<AstrologicalEventType, boolean>>({});

  // Global state for time and current planetary info
  const [currentTime, setCurrentTime] = useState(new Date());
  const [planetaryInfo, setPlanetaryInfo] = useState<PlanetaryInfo | null>(null);
  const [isLoadingPlanetaryInfo, setIsLoadingPlanetaryInfo] = useState(true);
  const planetaryInfoRef = useRef<PlanetaryInfo | null>(null);
  
  // Initialize users and admin account
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      const defaultUsers: Record<string, UserData> = {
        test: { password: 'test', email: 'test@example.com' },
        admin: { password: 'admin', email: 'admin@example.com' },
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // Load entries and filters for the current user
  useEffect(() => {
    if (!currentUser) {
      setEntries([]); // Clear entries if logged out
      return;
    }
    const entriesKey = `astroJournalEntries_${currentUser}`;
    const savedEntries = localStorage.getItem(entriesKey);
    setEntries(savedEntries ? JSON.parse(savedEntries) : []);
    
    const filtersKey = `astroJournalVisibleEvents_${currentUser}`;
    const savedFilters = localStorage.getItem(filtersKey);
    if (savedFilters) {
      setVisibleEventTypes(JSON.parse(savedFilters));
    } else {
      // Default: all visible
      const defaultFilters = Object.values(AstrologicalEventType).reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as Record<AstrologicalEventType, boolean>);
      setVisibleEventTypes(defaultFilters);
    }
  }, [currentUser]);

  // Save entries for current user
  useEffect(() => {
    if (!currentUser) return;
    const entriesKey = `astroJournalEntries_${currentUser}`;
    localStorage.setItem(entriesKey, JSON.stringify(entries));
  }, [entries, currentUser]);

  // Save filters for current user
  useEffect(() => {
    if (!currentUser || Object.keys(visibleEventTypes).length === 0) return;
    const filtersKey = `astroJournalVisibleEvents_${currentUser}`;
    localStorage.setItem(filtersKey, JSON.stringify(visibleEventTypes));
  }, [visibleEventTypes, currentUser]);
  
  // Save users to localStorage whenever the state changes
  useEffect(() => {
    if (Object.keys(users).length > 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users]);


  // Effect for current time ticker
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Store previous planetary info in a ref to compare for changes
  useEffect(() => {
    planetaryInfoRef.current = planetaryInfo;
  }, [planetaryInfo]);
  
  // Effect for fetching astrological data and detecting events
  // This effect will only run if a non-admin user is logged in
  useEffect(() => {
    if (!currentUser || currentUser === 'admin') {
      setIsLoadingPlanetaryInfo(false);
      return;
    };
    
    setIsLoadingPlanetaryInfo(true);

    const fetchDataAndDetectEvents = async () => {
        try {
            const info = await getPlanetaryInfo(new Date());
            setPlanetaryInfo(info);
            const prevInfo = planetaryInfoRef.current;

            if (prevInfo) {
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                
                const newEvents: AstrologicalEventEntry[] = [];
                
                const hasEvent = (id: string) => entries.some(e => e.id === id);

                if (prevInfo.planetaryDay !== info.planetaryDay && !hasEvent(`event-daychange-${todayStr}`)) {
                    newEvents.push({
                        id: `event-daychange-${todayStr}`,
                        type: AstrologicalEventType.PlanetaryDayChange,
                        createdAt: now.toISOString(),
                        title: `Planetary Day: ${info.planetaryDay} Rules`,
                        description: `A new day dawns, ruled by the energies of ${info.planetaryDay}. This influences the general mood and focus of the day.`,
                        fromPlanet: prevInfo.planetaryDay,
                        toPlanet: info.planetaryDay,
                    });
                }
                
                if (prevInfo.planetaryHour !== info.planetaryHour && !hasEvent(`event-hourchange-${now.toISOString().substring(0, 13)}`)) {
                     newEvents.push({
                        id: `event-hourchange-${now.toISOString().substring(0, 13)}`, // YYYY-MM-DDTHH
                        type: AstrologicalEventType.PlanetaryHourChange,
                        createdAt: now.toISOString(),
                        title: `Planetary Hour: ${info.planetaryHour} Begins`,
                        description: `The cosmic influence shifts as the hour of ${info.planetaryHour} begins, lasting for approximately one hour.`,
                        fromPlanet: prevInfo.planetaryHour,
                        toPlanet: info.planetaryHour,
                    });
                }
                
                if (prevInfo.sunSign !== info.sunSign && !hasEvent(`event-sunsignchange-${todayStr}`)) {
                     newEvents.push({
                        id: `event-sunsignchange-${todayStr}`,
                        type: AstrologicalEventType.SunSignChange,
                        createdAt: now.toISOString(),
                        title: `Sun Sign Shift: Welcome ${info.sunSign}`,
                        description: `The Sun has moved from ${prevInfo.sunSign} to ${info.sunSign}, shifting the collective focus.`,
                        fromSign: prevInfo.sunSign,
                        toSign: info.sunSign,
                    });
                }
                
                const moonSignEventId = `event-moonsignchange-${prevInfo.moonSign}-to-${info.moonSign}-${todayStr}`;
                if (prevInfo.moonSign !== info.moonSign && !hasEvent(moonSignEventId)) {
                     newEvents.push({
                        id: moonSignEventId,
                        type: AstrologicalEventType.MoonSignChange,
                        createdAt: now.toISOString(),
                        title: `Lunar Shift: Moon in ${info.moonSign}`,
                        description: `The Moon enters ${info.moonSign} from ${prevInfo.moonSign}, influencing our emotional landscape and subconscious currents.`,
                        fromSign: prevInfo.moonSign,
                        toSign: info.moonSign,
                    });
                }
                
                const moonPhaseEventId = `event-moonphasechange-${prevInfo.moonPhase}-to-${info.moonPhase}-${todayStr}`;
                if (prevInfo.moonPhase !== info.moonPhase && !hasEvent(moonPhaseEventId)) {
                    newEvents.push({
                        id: moonPhaseEventId,
                        type: AstrologicalEventType.MoonPhaseChange,
                        createdAt: now.toISOString(),
                        title: `Lunar Phase: Now ${info.moonPhase}`,
                        description: `The lunar cycle transitions. The Moon is now in its ${info.moonPhase} phase, affecting our energy for initiation and reflection.`,
                        fromPhase: prevInfo.moonPhase,
                        toPhase: info.moonPhase,
                    });
                }

                if (newEvents.length > 0) {
                     setEntries(currentEntries => [...currentEntries, ...newEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                }
            }
        } catch (error) {
            console.error("Failed to fetch planetary info:", error);
            let errorMessage = "An unknown error occurred while fetching cosmic data.";
            if (error instanceof Error && error.message.toLowerCase().includes('quota')) {
                errorMessage = 'Failed to call the Gemini API: user has exceeded quota. Please try again later.';
            } else if (error instanceof Error) {
                errorMessage = `Failed to call the Gemini API: ${error.message}`;
            }
            setApiError(errorMessage);
        } finally {
            if (isLoadingPlanetaryInfo) {
                setIsLoadingPlanetaryInfo(false);
            }
        }
    };
    
    fetchDataAndDetectEvents(); // Initial fetch
    const intervalId = setInterval(fetchDataAndDetectEvents, 60000); // Refresh every minute
    return () => clearInterval(intervalId);
  }, [currentUser]); // Run this effect when user logs in/out

  // --- Auth Handlers ---
  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (storedUsers[username] && storedUsers[username].password === password) {
      sessionStorage.setItem(SESSION_KEY, username);
      setCurrentUser(username);
      setView(username === 'admin' ? 'admin' : 'list');
      return true;
    }
    return false;
  }, []);

  const handleCreateAccount = useCallback(async (username: string, password: string, email: string): Promise<{ success: boolean; message: string }> => {
    if (!username.trim() || !password.trim() || !email.trim()) {
        return { success: false, message: 'All fields are required.' };
    }
    const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (storedUsers[username]) {
      return { success: false, message: 'Username already exists.' };
    }
    const newUsers = { ...storedUsers, [username]: { password, email } };
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    setUsers(newUsers);
    sessionStorage.setItem(SESSION_KEY, username);
    setCurrentUser(username);
    setView('list');
    return { success: true, message: 'Account created!' };
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  // --- Admin Handlers ---
  const handleDeleteUser = useCallback((username: string) => {
    setUsers(currentUsers => {
      const newUsers = { ...currentUsers };
      delete newUsers[username];
      return newUsers;
    });
    // Clean up user's data
    localStorage.removeItem(`astroJournalEntries_${username}`);
    localStorage.removeItem(`astroJournalVisibleEvents_${username}`);
  }, []);

  const handleUpdateUser = useCallback((username: string, newEmail: string) => {
    setUsers(currentUsers => ({
      ...currentUsers,
      [username]: { ...currentUsers[username], email: newEmail }
    }));
  }, []);

  const handleResetPassword = useCallback((username: string, newPassword: string) => {
    setUsers(currentUsers => ({
      ...currentUsers,
      [username]: { ...currentUsers[username], password: newPassword }
    }));
  }, []);

  // --- Navigation and Entry Handlers ---
  const handleNavigate = useCallback((targetView: 'list' | 'new' | 'search' | 'map' | 'stargazing') => {
    setSelectedEntryId(null);
    setView(targetView);
  }, []);

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedEntryId(id);
    setView('detail');
  }, []);

  const handleRequestEdit = useCallback((id: string) => {
    setSelectedEntryId(id);
    setView('edit');
  }, []);
  
  const handleToggleEventType = useCallback((type: AstrologicalEventType | 'all-show' | 'all-hide') => {
    setVisibleEventTypes(prev => {
        if (type === 'all-show') {
            return Object.values(AstrologicalEventType).reduce((acc, eventType) => ({ ...acc, [eventType]: true }), {} as Record<AstrologicalEventType, boolean>);
        }
        if (type === 'all-hide') {
            return Object.values(AstrologicalEventType).reduce((acc, eventType) => ({ ...acc, [eventType]: false }), {} as Record<AstrologicalEventType, boolean>);
        }
        return { ...prev, [type as AstrologicalEventType]: !prev[type as AstrologicalEventType] };
    });
  }, []);

  const handleSaveNewEntry = useCallback(async (data: { text: string, mood: Mood, images: string[], videos: string[], date: Date, hashtags: string[], location: string, isManual: boolean }) => {
    setIsSaving(true);
    setApiError(null);
    try {
        const info = (!data.isManual && !data.location.trim() && planetaryInfo)
            ? planetaryInfo
            : await getPlanetaryInfo(data.date, data.location);

        const { planetaryDay, planetaryHour, sunSign, moonSign, moonPhase, retrogrades, locationName } = info;
        const finalLocation = data.location.trim() || locationName || '';
        const coords = await geocodeLocation(finalLocation);

        const newEntry: JournalEntryType = {
            id: data.date.toISOString() + Math.random(),
            text: data.text,
            createdAt: data.date.toISOString(),
            planetaryDay,
            planetaryHour,
            sunSign,
            moonSign,
            moonPhase,
            mood: data.mood,
            images: data.images,
            videos: data.videos,
            retrogrades: retrogrades,
            hashtags: data.hashtags,
            location: finalLocation,
            coords: coords || undefined,
        };
        
        const entriesToAdd: AppEntry[] = [newEntry];

        if (retrogrades && retrogrades.length > 0) {
            const eventId = `event-retrograde-${data.date.toISOString().split('T')[0]}`;
            if (!entries.some(e => e.id === eventId)) {
                const newEvent: RetrogradeEventEntry = {
                    id: eventId,
                    type: AstrologicalEventType.Retrograde,
                    createdAt: new Date(data.date.setHours(0,0,0,0)).toISOString(),
                    title: 'Cosmic Shift: Retrograde in Effect',
                    description: `On this day, the cosmos presents a period of reflection and review as the following planets are in retrograde. This can influence communication, energy, and internal processes.`,
                    planets: retrogrades,
                };
                entriesToAdd.push(newEvent);
            }
        }

        setEntries(prev => [...prev, ...entriesToAdd].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setView('list');

    } catch (e) {
        console.error("Failed to save new entry:", e);
        let errorMessage = "Failed to save entry. An unknown error occurred.";
        if (e instanceof Error && e.message.toLowerCase().includes('quota')) {
            errorMessage = 'Failed to save new entry: API quota exceeded. Please try again later.';
        } else if (e instanceof Error) {
            errorMessage = `Failed to save new entry: ${e.message}`;
        }
        setApiError(errorMessage);
    } finally {
        setIsSaving(false);
    }
  }, [entries, planetaryInfo]);

  const handleUpdateEntry = useCallback(async (data: { text: string, mood: Mood, images: string[], videos: string[], date: Date, hashtags: string[], location: string, isManual: boolean }) => {
    if (!selectedEntryId) return;
    setIsSaving(true);
    setApiError(null);
    try {
        const planetaryInfo = await getPlanetaryInfo(data.date, data.location);
        const coords = await geocodeLocation(data.location);
        
        const updatedEntry: JournalEntryType = {
            id: selectedEntryId,
            createdAt: data.date.toISOString(),
            text: data.text,
            mood: data.mood,
            images: data.images,
            videos: data.videos,
            hashtags: data.hashtags,
            location: data.location,
            coords: coords || undefined,
            ...planetaryInfo,
        };

        setEntries(prev => {
            const updatedEntries = prev.map(e => e.id === selectedEntryId ? updatedEntry : e);
            return updatedEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        
        setView('detail');

    } catch (e) {
        console.error("Failed to update entry:", e);
        let errorMessage = "Failed to update entry. An unknown error occurred.";
        if (e instanceof Error && e.message.toLowerCase().includes('quota')) {
            errorMessage = 'Failed to update entry: API quota exceeded. Please try again later.';
        } else if (e instanceof Error) {
            errorMessage = `Failed to update entry: ${e.message}`;
        }
        setApiError(errorMessage);
    } finally {
        setIsSaving(false);
    }
  }, [selectedEntryId]);
  
  const handleUpdateEntryCoords = useCallback((entryId: string, coords: { lat: number, lng: number }) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId && 'coords' in e) {
        return { ...e, coords };
      }
      return e;
    }));
  }, []);

  const requestDeleteEntry = useCallback((id: string) => {
    setEntryToDelete(id);
  }, []);

  const confirmDeleteEntry = useCallback(() => {
    if (!entryToDelete) return;
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryToDelete));
    setEntryToDelete(null);
    if(selectedEntryId === entryToDelete) {
        setView('list'); 
    }
  }, [entryToDelete, selectedEntryId]);

  const cancelDeleteEntry = useCallback(() => {
    setEntryToDelete(null);
  }, []);

  const renderContent = () => {
    if (currentUser === 'admin') {
      return <AdminPage
        users={users}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
        onResetPassword={handleResetPassword}
      />;
    }
    
    const journalEntriesOnly = entries.filter(e => 'text' in e) as JournalEntryType[];

    if (view === 'new') {
      return <EntryForm onSave={handleSaveNewEntry} onCancel={() => handleNavigate('list')} isSaving={isSaving} />;
    }
    
    if (view === 'stargazing') {
        return <StargazingPage currentTime={currentTime} planetaryInfo={planetaryInfo} isLoading={isLoadingPlanetaryInfo} />;
    }

    if (view === 'map') {
      return <MapPage 
        entries={journalEntriesOnly} 
        onSelectEntry={handleSelectEntry}
        onUpdateCoords={handleUpdateEntryCoords}
      />;
    }

    if (view === 'search') {
      return <SearchPage 
        allEntries={journalEntriesOnly} 
        onSelectEntry={handleSelectEntry} 
        onDeleteEntry={requestDeleteEntry} 
      />;
    }

    if (view === 'edit') {
        const entryToEdit = entries.find(e => e.id === selectedEntryId) as JournalEntryType | undefined;
        if (entryToEdit) {
            return <EntryForm initialData={entryToEdit} onSave={handleUpdateEntry} onCancel={() => setView('detail')} isSaving={isSaving} />;
        }
    }

    if (view === 'detail') {
      const selectedEntry = entries.find(e => e.id === selectedEntryId);
      if (!selectedEntry) {
        return (
          <div className="text-center py-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-dashed border-gray-700 rounded-xl">
              <p className="text-gray-400">Entry not found.</p>
              <p className="text-gray-500 text-sm mt-1">It may have been deleted.</p>
          </div>
        )
      }
      return (
        <div className="animate-fade-in-up">
           { 'text' in selectedEntry 
              ? <JournalEntry entry={selectedEntry} onDelete={requestDeleteEntry} onEdit={handleRequestEdit} isDetailView={true} />
              : <AstrologicalEventEntryCard entry={selectedEntry as AstrologicalEventEntry} />
           }
        </div>
      );
    }

    // Default 'list' view
    const filteredEntries = entries.filter(entry => {
        if ('text' in entry) return true; // Always show user journal entries
        return visibleEventTypes[(entry as AstrologicalEventEntry).type] ?? true; // Show event if its type is visible
    });

    return (
      <div className="space-y-6">
        {entries.length === 0 && !isLoadingPlanetaryInfo ? (
          <div className="text-center py-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-400">Your cosmic journal is empty.</p>
            <p className="text-gray-500 text-sm mt-1">Write your first entry to begin your journey.</p>
          </div>
        ) : filteredEntries.length === 0 && !isLoadingPlanetaryInfo ? (
             <div className="text-center py-10 px-4 bg-gray-800/50 backdrop-blur-sm border border-dashed border-gray-700 rounded-xl">
                <p className="text-gray-400">All events are hidden by your filters.</p>
                <p className="text-gray-500 text-sm mt-1">Adjust the toggles above to see cosmic shift cards.</p>
            </div>
        ) : (
          filteredEntries.map((entry) => {
            if ('text' in entry) {
              return <JournalEntry key={entry.id} entry={entry} onDelete={requestDeleteEntry} onSelect={handleSelectEntry} />;
            } else {
              return <AstrologicalEventEntryCard key={entry.id} entry={entry as AstrologicalEventEntry} />;
            }
          })
        )}
      </div>
    );
  };

  if (!currentUser) {
      return (
          <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-8 relative">
              <div
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 z-0"
                  style={{ backgroundImage: 'url(https://picsum.photos/seed/stars/1920/1080)' }}
              ></div>
              <div className="relative z-10">
                  {authView === 'login' ? (
                      <LoginPage
                          onLogin={handleLogin}
                          onNavigateToCreateAccount={() => setAuthView('createAccount')}
                      />
                  ) : (
                      <CreateAccountPage
                          onCreateAccount={handleCreateAccount}
                          onNavigateToLogin={() => setAuthView('login')}
                      />
                  )}
              </div>
          </div>
      );
  }

  // --- Main App Render when logged in ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-8 relative">
        {apiError && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-xl z-50 animate-fade-in-up">
                <div className="bg-red-800/90 backdrop-blur-sm border border-red-600 text-white p-4 rounded-lg shadow-2xl flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{apiError}</span>
                    <button onClick={() => setApiError(null)} className="ml-auto text-red-200 hover:text-white" aria-label="Dismiss error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        )}
       {view !== 'map' && (
        <div
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 z-0"
            style={{ backgroundImage: 'url(https://picsum.photos/seed/stars/1920/1080)' }}
        ></div>
       )}
      <div className={`${view === 'map' ? 'max-w-full h-screen p-0 sm:p-0' : viewMode === 'desktop' ? 'max-w-3xl' : 'w-full max-w-md'} mx-auto relative z-10 flex flex-col`}>
        <div className={view === 'map' ? 'contents' : ''}>
          {view !== 'map' && (
            <header className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">
                  AstroJournal
              </h1>
              <p className="text-gray-400 mt-2 mb-4">
                  Welcome, {currentUser}. {currentUser === 'admin' ? 'Oversee the cosmos.' : 'Align your thoughts with the cosmos.'}
              </p>
            </header>
          )}
          {currentUser !== 'admin' && <Navbar view={view} onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} viewMode={viewMode} setViewMode={setViewMode} />}
          {currentUser === 'admin' && (
             <div className="flex justify-end items-center h-14">
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-white bg-gray-700/80 rounded-lg hover:bg-gray-600 px-4 py-2 transition-colors" title="Logout">
                    <span>Logout</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
          )}
        </div>

        <main className={`${view === 'map' ? 'flex-grow' : 'mt-8'}`}>
          {view === 'list' && Object.keys(visibleEventTypes).length > 0 && (
            <EventFilters
              visibleTypes={visibleEventTypes}
              onToggleType={handleToggleEventType}
            />
          )}
          {renderContent()}
        </main>
      </div>
        
      {entryToDelete && (
          <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              aria-labelledby="delete-confirmation-title"
              role="dialog"
              aria-modal="true"
          >
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
                  <h2 id="delete-confirmation-title" className="text-xl font-bold mb-4 text-white">Confirm Deletion</h2>
                  <p className="text-gray-300 mb-6">Are you sure you want to permanently delete this journal entry? This action cannot be undone.</p>
                  <div className="flex justify-end gap-4">
                      <button
                          onClick={cancelDeleteEntry}
                          className="px-4 py-2 font-semibold bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={confirmDeleteEntry}
                          className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};