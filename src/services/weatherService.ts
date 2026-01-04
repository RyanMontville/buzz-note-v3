import { TempAndCondition } from "../models";
import { loadData } from "../modules/utils";

interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_weather: {
        temperature: number;
        windspeed: number;
        winddirection: number;
        weathercode: number;
        time: string;
    };
}

const apiUrl = 'https://api.open-meteo.com/v1/forecast';
const latitude = 41.44;
const longitude = -81.39;
const temperatureUnit = 'fahrenheit';
const timezone = 'America/New_York';

function parseWeatherCode(weatherCode: number): string {
    switch (weatherCode) {
      case 0:
      case 1:
        return "Clear Sky"
      case 2: return "Partly Cloudy";
      case 3: return "Overcast";
      case 45:
      case 48:
        return "Fog";
      case 51:
      case 53:
      case 55:
        return "Drizzle";
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return "Rain";
      case 66:
      case 67:
        return "Freezing Rain";
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return "Snow";
      case 95:
      case 96:
      case 99:
        return "Thunderstorm";
      default: return "Unknown";
    }
  }

export async function getCurrentWeather() {
    const data: WeatherData = await loadData(`${apiUrl}?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${temperatureUnit}&timezone=${timezone}`);
    return new TempAndCondition(data['current_weather']['temperature'], parseWeatherCode(data['current_weather']['weathercode']));
}

export const WeatherConditionsArray: string[] = [
  "Clear Sky", 
  "Drizzle",
  "Freezing Rain",
  "Fog",
  "Partly Cloudy", 
  "Overcast",
  "Rain",
  "Snow",
  "Thunderstorm",
  "Unknown"
];