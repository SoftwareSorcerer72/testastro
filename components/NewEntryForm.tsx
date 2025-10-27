import React, { useState, useCallback, useRef, useEffect } from 'react';
import { JournalEntryType, Mood } from '../types';
import { MOODS } from '../constants';
import { MediaGallery } from './ImageGallery';
import { getLocationSuggestions } from '../services/astrologyService';

interface EntryFormData {
    text: string;
    mood: Mood;
    images: string[];
    videos: string[];
    date: Date;
    hashtags: string[];
    location: string;
    isManual: boolean;
}

interface EntryFormProps {
    onSave: (data: EntryFormData) => void;
    onCancel: () => void;
    initialData?: JournalEntryType;
    isSaving: boolean;
}

const VideoRecorder: React.FC<{ onSave: (dataUrl: string) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                console.error("Error accessing media devices.", err);
                setError("Camera and microphone access was denied. Please enable it in your browser settings.");
            }
        };

        getMedia();

        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleStartRecording = () => {
        if (!streamRef.current) return;
        setIsRecording(true);
        recordedChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };
        mediaRecorderRef.current.start();
    };

    const handleStopRecording = () => {
        if (!mediaRecorderRef.current) return;
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                onSave(reader.result as string);
            };
            reader.readAsDataURL(blob);
            setIsRecording(false);
        };
        mediaRecorderRef.current.stop();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in-up">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4">
                <h2 className="text-xl font-bold mb-4 text-white">Record Video</h2>
                {error ? (
                    <div className="text-center p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">{error}</div>
                ) : (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video bg-black rounded-lg mb-4"></video>
                )}
                <div className="flex justify-between items-center mt-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold bg-gray-600 hover:bg-gray-500 rounded-lg">Cancel</button>
                    {!error && (
                        isRecording ? (
                            <button onClick={handleStopRecording} className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2">
                                <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span> Stop
                            </button>
                        ) : (
                            <button onClick={handleStartRecording} disabled={!hasPermission} className="px-4 py-2 font-semibold bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span> Record
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};


export const EntryForm: React.FC<EntryFormProps> = ({ onSave, onCancel, initialData, isSaving }) => {
    const [entryText, setEntryText] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>('Content');
    const [entryImages, setEntryImages] = useState<string[]>([]);
    const [entryVideos, setEntryVideos] = useState<string[]>([]);
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [hashtagInput, setHashtagInput] = useState('');
    const [isManualDateTime, setIsManualDateTime] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    
    // Location state
    const [location, setLocation] = useState<string>('');
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    
    // Video recording state
    const [isRecording, setIsRecording] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);

    useEffect(() => {
        if (initialData) {
            const entryDate = new Date(initialData.createdAt);
            setEntryText(initialData.text);
            setSelectedMood(initialData.mood);
            setEntryImages(initialData.images ?? []);
            setEntryVideos(initialData.videos ?? []);
            setHashtags(initialData.hashtags ?? []);
            setLocation(initialData.location ?? '');
            setSelectedDate(entryDate.toISOString().split('T')[0]);
            setSelectedTime(entryDate.toTimeString().slice(0, 5));
            setIsManualDateTime(true); // Always start in manual for editing
        } else {
            // Default for new entry
            const now = new Date();
            setSelectedDate(now.toISOString().split('T')[0]);
            setSelectedTime(now.toTimeString().slice(0, 5));
        }
    }, [initialData]);

    const handleToggleDateTimeMode = useCallback(() => {
        if (initialData) return; // Disallow toggling for existing entries to avoid confusion
        const newModeIsManual = !isManualDateTime;
        setIsManualDateTime(newModeIsManual);
        const now = new Date();
        setSelectedDate(now.toISOString().split('T')[0]);
        setSelectedTime(now.toTimeString().slice(0, 5));
    }, [isManualDateTime, initialData]);
    
    // --- Location Autocomplete Logic ---
    const fetchSuggestions = useCallback(async (query: string) => {
        setIsFetchingSuggestions(true);
        setActiveSuggestionIndex(-1);
        const suggestions = await getLocationSuggestions(query);
        setLocationSuggestions(suggestions);
        setIsFetchingSuggestions(false);
    }, []);

    useEffect(() => {
        if (location.trim().length < 2) {
            setLocationSuggestions([]);
            return;
        }
        const handler = setTimeout(() => {
            fetchSuggestions(location);
        }, 300); // 300ms debounce
        return () => clearTimeout(handler);
    }, [location, fetchSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setLocationSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectSuggestion = (suggestion: string) => {
        setLocation(suggestion);
        setLocationSuggestions([]);
    };
    
    const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (locationSuggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev + 1) % locationSuggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev - 1 + locationSuggestions.length) % locationSuggestions.length);
        } else if (e.key === 'Enter' && activeSuggestionIndex > -1) {
            e.preventDefault();
            handleSelectSuggestion(locationSuggestions[activeSuggestionIndex]);
        } else if (e.key === 'Escape') {
            setLocationSuggestions([]);
        }
    };
    // --- End Location Logic ---


    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = 10 - (entryImages.length + entryVideos.length);
        if (files.length > remainingSlots) {
            alert(`You can only upload ${remainingSlots} more media items.`);
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEntryImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file as Blob);
        });
        e.target.value = '';
    }, [entryImages, entryVideos]);

    const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = 10 - (entryImages.length + entryVideos.length);
        if (files.length > remainingSlots) {
            alert(`You can only upload ${remainingSlots} more media items.`);
        }

        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEntryVideos(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file as Blob);
        });
        e.target.value = '';
    }, [entryImages, entryVideos]);
    
    const handleRemoveImage = useCallback((indexToRemove: number) => {
        setEntryImages(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleRemoveVideo = useCallback((indexToRemove: number) => {
        setEntryVideos(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const allMedia = [
        ...entryImages.map(src => ({ type: 'image' as const, src })),
        ...entryVideos.map(src => ({ type: 'video' as const, src }))
    ];

    const handleRemoveMedia = useCallback((index: number) => {
        if (index < entryImages.length) {
            handleRemoveImage(index);
        } else {
            handleRemoveVideo(index - entryImages.length);
        }
    }, [entryImages.length, handleRemoveImage, handleRemoveVideo]);


    const handleOpenGallery = (index: number) => {
        setGalleryStartIndex(index);
        setIsGalleryOpen(true);
    };

    const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', ' ', ','].includes(e.key) && hashtagInput.trim() !== '') {
            e.preventDefault();
            const newTag = hashtagInput.trim().replace(/#/g, '').toLowerCase();
            if (newTag && !hashtags.includes(newTag) && hashtags.length < 10) {
                setHashtags([...hashtags, newTag]);
            }
            setHashtagInput('');
        } else if (e.key === 'Backspace' && hashtagInput === '' && hashtags.length > 0) {
            e.preventDefault();
            setHashtags(hashtags.slice(0, -1));
        }
    };

    const removeHashtag = (tagToRemove: string) => {
        setHashtags(hashtags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = useCallback(() => {
        if (isSaving || (entryText.trim() === '' && allMedia.length === 0)) return;

        const entryDate = isManualDateTime 
            ? new Date(`${selectedDate}T${selectedTime}`)
            : new Date();

        onSave({
            text: entryText.trim(),
            mood: selectedMood,
            images: entryImages,
            videos: entryVideos,
            date: entryDate,
            hashtags: hashtags,
            location: location.trim(),
            isManual: isManualDateTime,
        });
    }, [isSaving, entryText, selectedMood, entryImages, entryVideos, hashtags, isManualDateTime, selectedDate, selectedTime, location, onSave, allMedia.length]);
    
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
        }
    }, [handleSave]);

    const moodCategories = {
        Positive: MOODS.filter(m => m.category === 'Positive'),
        Neutral: MOODS.filter(m => m.category === 'Neutral'),
        Negative: MOODS.filter(m => m.category === 'Negative'),
    };

    return (
        <>
            {isRecording && (
                <VideoRecorder
                    onSave={(videoDataUrl) => {
                        if (allMedia.length < 10) {
                            setEntryVideos(prev => [...prev, videoDataUrl]);
                        } else {
                            alert("You have reached the maximum of 10 media items.");
                        }
                        setIsRecording(false);
                    }}
                    onCancel={() => setIsRecording(false)}
                />
            )}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6 mb-8 animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-400">
                                Entry Date & Time
                            </label>
                             {!initialData && (
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={handleToggleDateTimeMode}>
                                    <span className={`text-sm font-semibold transition-colors ${!isManualDateTime ? 'text-purple-400' : 'text-gray-500'}`}>Now</span>
                                    <div
                                        role="switch"
                                        aria-checked={isManualDateTime}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isManualDateTime ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isManualDateTime ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </div>
                                    <span className={`text-sm font-semibold transition-colors ${isManualDateTime ? 'text-purple-400' : 'text-gray-500'}`}>Manual</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="date"
                                id="entry-date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                disabled={!isManualDateTime}
                                className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Entry date"
                            />
                            <input
                                type="time"
                                id="entry-time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                disabled={!isManualDateTime}
                                className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Entry time"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="mood-select" className="block text-sm font-medium text-gray-400 mb-2">
                            Current Mood
                        </label>
                        <select
                            id="mood-select"
                            value={selectedMood}
                            onChange={(e) => setSelectedMood(e.target.value as Mood)}
                            className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 text-gray-200"
                            aria-label="Select mood"
                        >
                            <optgroup label="Positive">
                                {moodCategories.Positive.map(mood => (
                                    <option key={mood.name} value={mood.name}>{mood.emoji} {mood.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Neutral">
                                {moodCategories.Neutral.map(mood => (
                                    <option key={mood.name} value={mood.name}>{mood.emoji} {mood.name}</option>
                                ))}
                            </optgroup>
                                <optgroup label="Negative">
                                {moodCategories.Negative.map(mood => (
                                    <option key={mood.name} value={mood.name}>{mood.emoji} {mood.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                </div>
                {isManualDateTime && (
                    <div className="mb-4" ref={suggestionsRef}>
                        <label htmlFor="location-input" className="block text-sm font-medium text-gray-400 mb-2">
                            Location (Optional)
                        </label>
                         <div className="relative">
                            <input
                                type="text"
                                id="location-input"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={handleLocationKeyDown}
                                placeholder="e.g., London, UK"
                                autoComplete="off"
                                className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 text-gray-200"
                                aria-label="Entry location"
                            />
                             {isFetchingSuggestions && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-gray-500 border-t-purple-400 rounded-full animate-spin"></div>
                                </div>
                            )}
                         </div>
                        {locationSuggestions.length > 0 && (
                            <ul className="absolute z-20 w-full bg-gray-900 border border-gray-600 rounded-lg mt-1 shadow-2xl max-h-60 overflow-y-auto">
                                {locationSuggestions.map((suggestion, index) => (
                                    <li
                                        key={suggestion}
                                        className={`px-4 py-3 cursor-pointer text-gray-200 transition-colors ${activeSuggestionIndex === index ? 'bg-purple-800/60' : 'hover:bg-purple-800/40'}`}
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <textarea
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What's on your mind? The planets are listening..."
                    className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 resize-none"
                    aria-label="Journal entry text"
                />
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Hashtags ({hashtags.length}/10)</label>
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-colors">
                        {hashtags.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 bg-purple-800/50 text-purple-300 text-sm font-medium pl-2.5 pr-1 py-1 rounded-full animate-fade-in-up">
                                #{tag}
                                <button onClick={() => removeHashtag(tag)} className="text-purple-300 hover:text-white bg-black/20 rounded-full w-4 h-4 flex items-center justify-center text-xs">&times;</button>
                            </span>
                        ))}
                        {hashtags.length < 10 && (
                            <input
                                type="text"
                                value={hashtagInput}
                                onChange={(e) => setHashtagInput(e.target.value)}
                                onKeyDown={handleHashtagKeyDown}
                                placeholder="Add a tag..."
                                className="bg-transparent focus:outline-none flex-1 min-w-[100px] text-gray-200 p-1"
                                aria-label="Add a hashtag"
                            />
                        )}
                    </div>
                </div>
                {allMedia.length > 0 && (
                    <div className="mt-4 relative h-24 flex items-center">
                        {allMedia.map((media, index) => (
                            <div
                                key={index}
                                className="absolute group transition-transform duration-300 ease-out cursor-pointer"
                                style={{
                                    transform: `translateX(${index * 20}px) rotate(${index * 2 - (allMedia.length > 1 ? allMedia.length-1 : 0)}deg)`,
                                    zIndex: index,
                                    transformOrigin: 'bottom left'
                                }}
                                onClick={() => handleOpenGallery(index)}
                            >
                                {media.type === 'image' ? (
                                    <img
                                        src={media.src}
                                        alt={`Preview ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-md border-2 border-gray-600 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-20 h-20 object-cover rounded-md border-2 border-gray-600 shadow-lg bg-black overflow-hidden">
                                        <video src={media.src} className="w-full h-full object-cover" muted playsInline />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30"><svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg></div>
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveMedia(index); }}
                                    className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove media"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                         <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            multiple
                            accept="image/*"
                            className="hidden"
                            disabled={allMedia.length >= 10}
                        />
                        <input
                            type="file"
                            ref={videoInputRef}
                            onChange={handleVideoUpload}
                            multiple
                            accept="video/*"
                            className="hidden"
                            disabled={allMedia.length >= 10}
                        />
                        <button
                            onClick={() => imageInputRef.current?.click()}
                            disabled={allMedia.length >= 10}
                            className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50"
                        >
                           Add Image
                        </button>
                         <button
                            onClick={() => videoInputRef.current?.click()}
                            disabled={allMedia.length >= 10}
                            className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50"
                        >
                           Add Video
                        </button>
                        <button
                            onClick={() => setIsRecording(true)}
                            disabled={allMedia.length >= 10}
                            className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50"
                        >
                           Record
                        </button>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={onCancel}
                            className="w-full sm:w-auto px-6 py-2 font-semibold text-white bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || (entryText.trim() === '' && allMedia.length === 0)}
                            className="w-full sm:w-auto px-6 py-2 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isSaving ? 'Consulting...' : (initialData ? 'Update Entry' : 'Save Entry')}
                        </button>
                    </div>
                </div>
                 <div className="text-xs text-gray-500 mt-2 text-right">
                    Total Media: {allMedia.length}/10. {!initialData && "Press Ctrl+Enter to save."}
                </div>
            </div>
            {isGalleryOpen && (
                <MediaGallery
                    media={allMedia}
                    startIndex={galleryStartIndex}
                    onClose={() => setIsGalleryOpen(false)}
                    onDelete={handleRemoveMedia}
                />
            )}
        </>
    );
};