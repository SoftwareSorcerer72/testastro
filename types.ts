export enum Planet {
  Sun = 'Sun',
  Moon = 'Moon',
  Mars = 'Mars',
  Mercury = 'Mercury',
  Jupiter = 'Jupiter',
  Venus = 'Venus',
  Saturn = 'Saturn'
}

export enum ZodiacSign {
  Aries = 'Aries',
  Taurus = 'Taurus',
  Gemini = 'Gemini',
  Cancer = 'Cancer',
  Leo = 'Leo',
  Virgo = 'Virgo',
  Libra = 'Libra',
  Scorpio = 'Scorpio',
  Sagittarius = 'Sagittarius',
  Capricorn = 'Capricorn',
  Aquarius = 'Aquarius',
  Pisces = 'Pisces'
}

export enum MoonPhase {
  NewMoon = 'New Moon',
  WaxingCrescent = 'Waxing Crescent',
  FirstQuarter = 'First Quarter',
  WaxingGibbous = 'Waxing Gibbous',
  FullMoon = 'Full Moon',
  WaningGibbous = 'Waning Gibbous',
  ThirdQuarter = 'Third Quarter',
  WaningCrescent = 'Waning Crescent',
  // Simple fallbacks
  Waxing = 'Waxing',
  Waning = 'Waning'
}

export type Mood = 
  // Positive
  | 'Joyful' | 'Grateful' | 'Excited' | 'Proud' | 'Hopeful' | 'Creative' | 'Peaceful'
  // Neutral
  | 'Calm' | 'Thoughtful' | 'Focused' | 'Content' | 'Indifferent' | 'Observant'
  // Negative
  | 'Sad' | 'Anxious' | 'Angry' | 'Stressed' | 'Tired' | 'Frustrated' | 'Lonely';

export interface JournalEntryType {
  id: string;
  text: string;
  createdAt: string;
  planetaryDay: Planet;
  planetaryHour: Planet;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  moonPhase: MoonPhase;
  mood: Mood;
  images?: string[];
  videos?: string[];
  retrogrades?: Planet[];
  hashtags?: string[];
  location?: string;
  coords?: { lat: number; lng: number; };
}

export enum AstrologicalEventType {
  Retrograde = 'Retrograde',
  SunSignChange = 'SunSignChange',
  MoonSignChange = 'MoonSignChange',
  MoonPhaseChange = 'MoonPhaseChange',
  PlanetaryDayChange = 'PlanetaryDayChange',
  PlanetaryHourChange = 'PlanetaryHourChange',
}

export interface RetrogradeEventEntry {
  id: string;
  type: AstrologicalEventType.Retrograde;
  createdAt: string;
  title: string;
  description: string;
  planets: Planet[];
}

export interface SunSignChangeEventEntry {
  id: string;
  type: AstrologicalEventType.SunSignChange;
  createdAt: string;
  title: string;
  description: string;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
}

export interface MoonSignChangeEventEntry {
  id: string;
  type: AstrologicalEventType.MoonSignChange;
  createdAt: string;
  title: string;
  description: string;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
}

export interface MoonPhaseChangeEventEntry {
  id: string;
  type: AstrologicalEventType.MoonPhaseChange;
  createdAt: string;
  title: string;
  description: string;
  fromPhase: MoonPhase;
  toPhase: MoonPhase;
}

export interface PlanetaryDayChangeEventEntry {
  id: string;
  type: AstrologicalEventType.PlanetaryDayChange;
  createdAt: string;
  title: string;
  description: string;
  fromPlanet: Planet;
  toPlanet: Planet;
}

export interface PlanetaryHourChangeEventEntry {
  id: string;
  type: AstrologicalEventType.PlanetaryHourChange;
  createdAt: string;
  title: string;
  description: string;
  fromPlanet: Planet;
  toPlanet: Planet;
}

export type AstrologicalEventEntry = 
  | RetrogradeEventEntry
  | SunSignChangeEventEntry
  | MoonSignChangeEventEntry
  | MoonPhaseChangeEventEntry
  | PlanetaryDayChangeEventEntry
  | PlanetaryHourChangeEventEntry;

export type AppEntry = JournalEntryType | AstrologicalEventEntry;

export interface PlanetaryInfo {
  planetaryDay: Planet;
  planetaryHour: Planet;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  moonPhase: MoonPhase;
  retrogrades: Planet[];
  locationName?: string;
}

export interface UserData {
  password: string;
  email: string;
}