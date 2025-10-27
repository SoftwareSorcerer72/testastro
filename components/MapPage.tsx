import React, { useEffect, useRef, useState } from 'react';
import { JournalEntryType } from '../types';
import { geocodeLocation } from '../services/astrologyService';

// Since Leaflet and MarkerCluster are loaded from a CDN, we declare them on the window object
declare const L: any;

interface MapPageProps {
    entries: JournalEntryType[];
    onSelectEntry: (id: string) => void;
    onUpdateCoords: (entryId: string, coords: { lat: number, lng: number }) => void;
}

type GeocodedEntry = JournalEntryType & { coords: { lat: number; lng: number } };

export const MapPage: React.FC<MapPageProps> = ({ entries, onSelectEntry, onUpdateCoords }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any>(null);
    const [geocodedEntries, setGeocodedEntries] = useState<GeocodedEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isProcessingRef = useRef(false);

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                center: [20, 0],
                zoom: 2,
                maxBounds: [[-90, -180], [90, 180]],
                worldCopyJump: true
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                minZoom: 2,
            }).addTo(mapRef.current);
        }
    }, []);
    
    // Geocode entries that need it
    useEffect(() => {
        const processEntries = async () => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;
            setIsLoading(true);

            const entriesToGeocode = entries.filter(e => e.location && e.location.trim() !== '' && !e.coords);
            const alreadyGeocoded = entries.filter(e => e.location && e.location.trim() !== '' && e.coords) as GeocodedEntry[];

            if (entriesToGeocode.length === 0) {
                setGeocodedEntries(alreadyGeocoded);
                setIsLoading(false);
                isProcessingRef.current = false;
                return;
            }

            const geocodingPromises = entriesToGeocode.map(async (entry) => {
                const coords = await geocodeLocation(entry.location!);
                if (coords) {
                    return { ...entry, coords };
                }
                return null;
            });

            const newlyGeocodedResults = (await Promise.all(geocodingPromises)).filter(Boolean) as GeocodedEntry[];
            
            // Batch update parent state after all geocoding is done
            newlyGeocodedResults.forEach(entry => {
                onUpdateCoords(entry.id, entry.coords);
            });

            setGeocodedEntries([...alreadyGeocoded, ...newlyGeocodedResults]);
            setIsLoading(false);
            isProcessingRef.current = false;
        };
        processEntries();
    }, [entries, onUpdateCoords]);

    // Update map with markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear previous markers first
        if (markersRef.current) {
            map.removeLayer(markersRef.current);
        }
        
        if (geocodedEntries.length === 0) return;

        markersRef.current = L.markerClusterGroup({
            maxClusterRadius: 60,
            iconCreateFunction: (cluster: any) => {
                const childMarkers = cluster.getAllChildMarkers();
                const count = childMarkers.length;

                // Find the most recent entry with an image in the cluster
                let coverImage = '';
                let latestDate = 0;
                childMarkers.forEach((marker: any) => {
                    const entry = marker.options.entry as GeocodedEntry;
                    const entryDate = new Date(entry.createdAt).getTime();
                    if (entry.images && entry.images.length > 0 && entryDate > latestDate) {
                        coverImage = entry.images[0];
                        latestDate = entryDate;
                    }
                });
                
                const size = 40 + count / (geocodedEntries.length || 1) * 40;
                const style = coverImage ? `background-image: url(${coverImage})` : `background-color: #4f46e5;`;
                
                return L.divIcon({
                    html: `<div class="custom-cluster-icon" style="${style}"><span>${count}</span></div>`,
                    className: 'marker-cluster', // IMPORTANT: Use default class for library JS to function correctly
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2]
                });
            }
        });

        geocodedEntries.forEach(entry => {
            const marker = L.marker([entry.coords.lat, entry.coords.lng], { entry });
            marker.on('click', () => onSelectEntry(entry.id));
            markersRef.current.addLayer(marker);
        });

        map.addLayer(markersRef.current);
        
        // Fit map to markers if there are any
        const bounds = markersRef.current.getBounds();
        if (bounds.isValid()) {
             map.fitBounds(bounds, { padding: [50, 50] });
        }

    }, [geocodedEntries, onSelectEntry]);

    return (
        <div className="relative h-full w-full animate-fade-in-up flex-grow">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-30">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-400 rounded-full animate-spin"></div>
                        <p className="text-gray-300 font-semibold">Locating your cosmic memories...</p>
                    </div>
                </div>
            )}
            <div ref={mapContainerRef} className="h-full w-full" />
        </div>
    );
};