import { Planet, PlanetaryInfo, ZodiacSign, MoonPhase } from '../types';
import { PLANET_DAYS, CHALDEAN_ORDER, ZODIAC_SIGNS } from '../constants';
import { GoogleGenAI } from "@google/genai";


// --- Local Calculation (Fallback) ---

const EPOCH = new Date('2000-01-01T12:00:00Z').getTime();
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SUN_ECLIPTIC_LONGITUDE_EPOCH = 280.46;
const MOON_ECLIPTIC_LONGITUDE_EPOCH = 218.32;
const SUN_MEAN_MOTION = 360 / 365.2422;
const MOON_MEAN_MOTION = 13.176396;

function getZodiacSignFromLongitude(longitude: number): ZodiacSign {
    const signIndex = Math.floor(longitude / 30);
    return ZODIAC_SIGNS[signIndex % 12];
}

function getAstroPositions(date: Date): { sunLongitude: number, moonLongitude: number } {
    const daysSinceEpoch = (date.getTime() - EPOCH) / MS_PER_DAY;
    const sunLongitude = (SUN_ECLIPTIC_LONGITUDE_EPOCH + daysSinceEpoch * SUN_MEAN_MOTION) % 360;
    const moonLongitude = (MOON_ECLIPTIC_LONGITUDE_EPOCH + daysSinceEpoch * MOON_MEAN_MOTION) % 360;
    return { sunLongitude, moonLongitude };
}

/**
 * Calculates planetary information locally. Used as a fallback.
 * NOTE: This uses a simplified model.
 */
function calculatePlanetaryInfoLocally(date: Date): PlanetaryInfo {
  const dayOfWeek = date.getDay();
  const planetaryDay = PLANET_DAYS[dayOfWeek];

  const sunrise = new Date(date);
  sunrise.setHours(6, 0, 0, 0);
  const sunset = new Date(date);
  sunset.setHours(18, 0, 0, 0);
  
  let hourIndex: number;

  if (date >= sunrise && date < sunset) {
    const dayHourLength = (sunset.getTime() - sunrise.getTime()) / 12;
    const timeSinceSunrise = date.getTime() - sunrise.getTime();
    hourIndex = Math.floor(timeSinceSunrise / dayHourLength);
  } else {
    let periodStart: Date, periodEnd: Date;
    if (date < sunrise) {
      periodEnd = sunrise;
      periodStart = new Date(sunset);
      periodStart.setDate(sunset.getDate() - 1);
    } else {
      periodStart = sunset;
      periodEnd = new Date(sunrise);
      periodEnd.setDate(sunrise.getDate() + 1);
    }
    const nightHourLength = (periodEnd.getTime() - periodStart.getTime()) / 12;
    const timeSincePeriodStart = date.getTime() - periodStart.getTime();
    hourIndex = Math.floor(timeSincePeriodStart / nightHourLength);
  }
  
  const dayPlanetIndex = CHALDEAN_ORDER.indexOf(planetaryDay);
  if (dayPlanetIndex === -1) throw new Error("Could not determine planetary day index.");

  const planetaryHourIndex = (dayPlanetIndex + hourIndex) % 7;
  const planetaryHour = CHALDEAN_ORDER[planetaryHourIndex];

  const { sunLongitude, moonLongitude } = getAstroPositions(date);
  const sunSign = getZodiacSignFromLongitude(sunLongitude);
  const moonSign = getZodiacSignFromLongitude(moonLongitude);

  let separation = moonLongitude - sunLongitude;
  if (separation < 0) separation += 360;
  const moonPhase = (separation > 0 && separation < 180) ? MoonPhase.Waxing : MoonPhase.Waning;

  return { planetaryDay, planetaryHour, sunSign, moonSign, moonPhase, retrogrades: [], locationName: '' };
}

// --- API Integration Layer ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getPlanetaryInfoFromGemini(date: Date, location: GeolocationPosition | null, manualLocation?: string): Promise<PlanetaryInfo> {
    const model = 'gemini-2.5-flash';

    let locationContext = 'using a geocentric perspective';
    if (manualLocation && manualLocation.trim() !== '') {
        locationContext = `at the location "${manualLocation}"`;
    } else if (location) {
        locationContext = `at latitude ${location.coords.latitude} and longitude ${location.coords.longitude}`;
    }

    const prompt = `Act as an expert astrologer with access to precise ephemeris data. For the exact date and time of "${date.toISOString()}" ${locationContext}, provide the following astrological information.
Your entire response must be a single, raw JSON object and nothing else. Do not use markdown, conversational language, or any text outside of the JSON object.
The JSON object must contain these keys: "planetaryDay", "planetaryHour", "sunSign", "moonSign", "moonPhase", "retrogrades", and "locationName".
The "moonPhase" value must be one of the following eight strings: "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Third Quarter", "Waning Crescent".
The "retrogrades" value must be an array of strings containing the names of any planets in retrograde from this list: Mars, Mercury, Jupiter, Venus, Saturn. If no planets are in retrograde, provide an empty array.
The "locationName" should be a user-friendly string (e.g., "City, State/Country") for the location context provided. If the context is geocentric, return an empty string.

Example of the required JSON format:
{"planetaryDay": "Mercury", "planetaryHour": "Saturn", "sunSign": "Capricorn", "moonSign": "Leo", "moonPhase": "Waning Gibbous", "retrogrades": ["Mercury"], "locationName": "Mountain View, CA"}`;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    const rawText = response.text.trim();
    console.log("Raw response from Gemini:", rawText); // For debugging

    try {
        // Attempt to parse the raw text directly, as it should just be JSON.
        return JSON.parse(rawText) as PlanetaryInfo;
    } catch (e) {
        console.warn("Direct JSON.parse failed, attempting to extract from response.", { rawText, error: e });
        try {
            // Fallback for responses wrapped in markdown like ```json ... ```
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1]) as PlanetaryInfo;
            }
            // Fallback for responses that have text before/after the JSON object
            const firstBrace = rawText.indexOf('{');
            const lastBrace = rawText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                const jsonString = rawText.substring(firstBrace, lastBrace + 1);
                return JSON.parse(jsonString) as PlanetaryInfo;
            }
            throw new Error("No valid JSON found in the API response.");
        } catch(parseError) {
            console.error("Failed to parse JSON from Gemini response after multiple attempts.", { rawText, error: parseError });
            throw new Error("API returned unparsable astrological data.");
        }
    }
}

function getCurrentLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => {
                console.warn("Could not get user location.", error);
                resolve(null);
            },
            { timeout: 5000 } // Set a 5-second timeout
        );
    });
}

/**
 * Gets location suggestions from the Gemini API.
 */
export async function getLocationSuggestions(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide up to 5 location autocomplete suggestions for the user typing "${query}". The locations should be real cities, regions, or countries. Your entire response must be a single, raw JSON array of strings and nothing else. Do not use markdown or conversational language.

Example for input "new y":
["New York, NY, USA", "New York City, NY, USA"]

Example for input "lond":
["London, UK", "London, Ontario, Canada"]`;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    const rawText = response.text.trim();
    
    try {
        const suggestions = JSON.parse(rawText);
        if (Array.isArray(suggestions)) {
          return suggestions.filter(s => typeof s === 'string');
        }
        console.warn("Location suggestions response was not an array.", rawText);
        return [];
    } catch (e) {
        console.error("Failed to parse location suggestions from Gemini.", { rawText, error: e });
        return [];
    }
  } catch (error) {
    console.error("API call for location suggestions failed:", error);
    return [];
  }
}


/**
 * Gets latitude and longitude for a location string.
 */
export async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
    if (!locationName || locationName.trim() === '') {
        return null;
    }
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `Provide the geographic coordinates (latitude and longitude) for the location "${locationName}". Your entire response must be a single, raw JSON object with "lat" and "lng" keys. Do not use markdown or any other text.
Example response for "Eiffel Tower, Paris":
{"lat": 48.8584, "lng": 2.2945}`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const rawText = response.text.trim();
        const parsed = JSON.parse(rawText);

        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
            return parsed;
        }
        console.warn("Geocoding response was missing lat/lng.", rawText);
        return null;

    } catch (error) {
        console.error(`Geocoding failed for "${locationName}":`, error);
        return null;
    }
}


/**
 * Gets planetary information for a given date.
 * It first tries to fetch from a real-time API and falls back to local calculations on failure.
 */
export async function getPlanetaryInfo(date: Date, manualLocation?: string): Promise<PlanetaryInfo> {
  try {
    console.log("Attempting to fetch real-time astrological data with Gemini...");
    const location = !manualLocation ? await getCurrentLocation() : null;
    const apiData = await getPlanetaryInfoFromGemini(date, location, manualLocation);
    console.log("Successfully fetched data from Gemini.", apiData);
    return apiData;
  } catch (error) {
    console.warn("API for astrological data failed. Falling back to local calculations.", error);
    return calculatePlanetaryInfoLocally(date);
  }
}