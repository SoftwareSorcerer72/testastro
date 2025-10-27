import { Planet, ZodiacSign, MoonPhase, Mood } from './types';

export const PLANET_DAYS: Planet[] = [
  Planet.Sun,     // Sunday
  Planet.Moon,    // Monday
  Planet.Mars,    // Tuesday
  Planet.Mercury, // Wednesday
  Planet.Jupiter, // Thursday
  Planet.Venus,   // Friday
  Planet.Saturn   // Saturday
];

export const CHALDEAN_ORDER: Planet[] = [
  Planet.Saturn,
  Planet.Jupiter,
  Planet.Mars,
  Planet.Sun,
  Planet.Venus,
  Planet.Mercury,
  Planet.Moon
];

export const PLANET_DETAILS: Record<Planet, { emoji: string; color: string }> = {
  [Planet.Sun]: { emoji: '☀️', color: 'text-yellow-400' },
  [Planet.Moon]: { emoji: '🌙', color: 'text-gray-300' },
  [Planet.Mars]: { emoji: '♂️', color: 'text-red-500' },
  [Planet.Mercury]: { emoji: '☿️', color: 'text-blue-400' },
  [Planet.Jupiter]: { emoji: '♃', color: 'text-purple-400' },
  [Planet.Venus]: { emoji: '♀️', color: 'text-pink-400' },
  [Planet.Saturn]: { emoji: '♄', color: 'text-indigo-400' },
};

export const ZODIAC_DETAILS: Record<ZodiacSign, { emoji: string; color: string }> = {
  [ZodiacSign.Aries]: { emoji: '♈️', color: 'text-red-400' },
  [ZodiacSign.Taurus]: { emoji: '♉️', color: 'text-green-400' },
  [ZodiacSign.Gemini]: { emoji: '♊️', color: 'text-yellow-300' },
  [ZodiacSign.Cancer]: { emoji: '♋️', color: 'text-gray-300' },
  [ZodiacSign.Leo]: { emoji: '♌️', color: 'text-orange-400' },
  [ZodiacSign.Virgo]: { emoji: '♍️', color: 'text-amber-600' },
  [ZodiacSign.Libra]: { emoji: '♎️', color: 'text-pink-400' },
  [ZodiacSign.Scorpio]: { emoji: '♏️', color: 'text-red-600' },
  [ZodiacSign.Sagittarius]: { emoji: '♐️', color: 'text-purple-400' },
  [ZodiacSign.Capricorn]: { emoji: '♑️', color: 'text-gray-500' },
  [ZodiacSign.Aquarius]: { emoji: '♒️', color: 'text-blue-400' },
  [ZodiacSign.Pisces]: { emoji: '♓️', color: 'text-teal-400' },
};

export const MOON_PHASE_DETAILS: Record<MoonPhase, { color: string; emoji: string }> = {
  [MoonPhase.NewMoon]: { color: 'text-gray-400', emoji: '🌑' },
  [MoonPhase.WaxingCrescent]: { color: 'text-sky-300', emoji: '🌒' },
  [MoonPhase.FirstQuarter]: { color: 'text-sky-300', emoji: '🌓' },
  [MoonPhase.WaxingGibbous]: { color: 'text-sky-300', emoji: '🌔' },
  [MoonPhase.FullMoon]: { color: 'text-yellow-200', emoji: '🌕' },
  [MoonPhase.WaningGibbous]: { color: 'text-indigo-300', emoji: '🌖' },
  [MoonPhase.ThirdQuarter]: { color: 'text-indigo-300', emoji: '🌗' },
  [MoonPhase.WaningCrescent]: { color: 'text-indigo-300', emoji: '🌘' },
  [MoonPhase.Waxing]: { color: 'text-sky-300', emoji: '🌒' }, // Fallback icon
  [MoonPhase.Waning]: { color: 'text-indigo-300', emoji: '🌘' }, // Fallback icon
};


export const MOODS: { name: Mood; emoji: string; category: 'Positive' | 'Neutral' | 'Negative' }[] = [
    // Positive
    { name: 'Joyful', emoji: '😄', category: 'Positive' },
    { name: 'Grateful', emoji: '🙏', category: 'Positive' },
    { name: 'Excited', emoji: '🤩', category: 'Positive' },
    { name: 'Proud', emoji: '😌', category: 'Positive' },
    { name: 'Hopeful', emoji: '✨', category: 'Positive' },
    { name: 'Creative', emoji: '🎨', category: 'Positive' },
    { name: 'Peaceful', emoji: '🧘', category: 'Positive' },
    // Neutral
    { name: 'Content', emoji: '🙂', category: 'Neutral' },
    { name: 'Calm', emoji: '😊', category: 'Neutral' },
    { name: 'Thoughtful', emoji: '🤔', category: 'Neutral' },
    { name: 'Focused', emoji: '🎯', category: 'Neutral' },
    { name: 'Indifferent', emoji: '😐', category: 'Neutral' },
    { name: 'Observant', emoji: '🧐', category: 'Neutral' },
    // Negative
    { name: 'Sad', emoji: '😢', category: 'Negative' },
    { name: 'Anxious', emoji: '😟', category: 'Negative' },
    { name: 'Angry', emoji: '😠', category: 'Negative' },
    { name: 'Stressed', emoji: '😩', category: 'Negative' },
    { name: 'Tired', emoji: '😴', category: 'Negative' },
    { name: 'Frustrated', emoji: '😤', category: 'Negative' },
    { name: 'Lonely', emoji: '😔', category: 'Negative' },
];

export const MOOD_DETAILS: Record<Mood, { emoji: string; color: string }> = {
    'Joyful': { emoji: '😄', color: 'text-green-400' },
    'Grateful': { emoji: '🙏', color: 'text-green-400' },
    'Excited': { emoji: '🤩', color: 'text-green-400' },
    'Proud': { emoji: '😌', color: 'text-green-400' },
    'Hopeful': { emoji: '✨', color: 'text-green-400' },
    'Creative': { emoji: '🎨', color: 'text-green-400' },
    'Peaceful': { emoji: '🧘', color: 'text-green-400' },
    'Content': { emoji: '🙂', color: 'text-sky-400' },
    'Calm': { emoji: '😊', color: 'text-sky-400' },
    'Thoughtful': { emoji: '🤔', color: 'text-sky-400' },
    'Focused': { emoji: '🎯', color: 'text-sky-400' },
    'Indifferent': { emoji: '😐', color: 'text-sky-400' },
    'Observant': { emoji: '🧐', color: 'text-sky-400' },
    'Sad': { emoji: '😢', color: 'text-yellow-500' },
    'Anxious': { emoji: '😟', color: 'text-yellow-500' },
    'Angry': { emoji: '😠', color: 'text-yellow-500' },
    'Stressed': { emoji: '😩', color: 'text-yellow-500' },
    'Tired': { emoji: '😴', color: 'text-yellow-500' },
    'Frustrated': { emoji: '😤', color: 'text-yellow-500' },
    'Lonely': { emoji: '😔', color: 'text-yellow-500' },
};


export const ZODIAC_SIGNS: ZodiacSign[] = [
  ZodiacSign.Aries, ZodiacSign.Taurus, ZodiacSign.Gemini, ZodiacSign.Cancer,
  ZodiacSign.Leo, ZodiacSign.Virgo, ZodiacSign.Libra, ZodiacSign.Scorpio,
  ZodiacSign.Sagittarius, ZodiacSign.Capricorn, ZodiacSign.Aquarius, ZodiacSign.Pisces
];