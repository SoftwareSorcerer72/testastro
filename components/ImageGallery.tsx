import React, { useState, useEffect, useCallback } from 'react';

interface MediaItem {
    type: 'image' | 'video';
    src: string;
}

interface MediaGalleryProps {
    media: MediaItem[];
    startIndex: number;
    onClose: () => void;
    onDelete?: (index: number) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ media, startIndex, onClose, onDelete }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
    }, [media.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
    }, [media.length]);

    const handleDelete = () => {
        if (onDelete) {
            onDelete(currentIndex);
            // If it's the last image, close the gallery
            if (media.length === 1) {
                onClose();
            } else {
                // Otherwise, move to the previous image (or the new first if we deleted the first)
                setCurrentIndex(prev => Math.max(0, prev - 1));
            }
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleNext, handlePrev, onClose]);

    if (media.length === 0) {
        onClose();
        return null;
    }

    const currentMedia = media[currentIndex];

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in-up"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 rounded-full p-2"
                    aria-label="Close gallery"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Main Media */}
                <div className="relative flex items-center justify-center max-w-7xl w-full max-h-[90vh]">
                     {currentMedia.type === 'image' ? (
                        <img 
                            src={currentMedia.src} 
                            alt={`Entry content ${currentIndex + 1}`}
                            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />
                     ) : (
                        <video
                            src={currentMedia.src}
                            controls
                            autoPlay
                            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />
                     )}
                </div>

                {/* Navigation */}
                {media.length > 1 && (
                    <>
                        <button 
                            onClick={handlePrev} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                            aria-label="Previous content"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                           </svg>
                        </button>
                        <button 
                            onClick={handleNext} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                            aria-label="Next content"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
                 {/* Counter */}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm rounded-full px-4 py-1.5">
                    {currentIndex + 1} / {media.length}
                </div>
                 {/* Delete Button */}
                {onDelete && (
                    <button
                        onClick={handleDelete}
                        className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-colors"
                        aria-label="Delete content"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};