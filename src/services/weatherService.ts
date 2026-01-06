import { TempAndCondition, type UserLocation } from "../models";
import { getFormattedDate, getStartTime, loadData, storeMessage } from "../modules/utils";
import { db } from './db';

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

const getCoordinates = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error)
    );
  });
};

export async function setCurrentLocation() {
  const coords = await getCoordinates();
  try {
     await db.locations.add({
      id: 1,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp: getFormattedDate() + " " + getStartTime()
    });
    storeMessage("Location updated successfully", "main-message", "check_circle")

  } catch (error: any) {
    console.error('Failed to save location to IndexedDB:', error);
  }
}

export async function getUserLocationFromDB() {
  return await db.locations.get(1);
}

export async function getLocalWeather() {
  try {
    // 1. Get user location
    const usersLocation: UserLocation | undefined = await db.locations.get(1);
    let url: string = "";
    if (usersLocation) {
          url = `${apiUrl}?latitude=${usersLocation['latitude']}&longitude=${usersLocation['longitude']}&current_weather=true&temperature_unit=${temperatureUnit}&timezone=auto`;
    } else {
      url = `${apiUrl}?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${temperatureUnit}&timezone=auto`;
    }
    // 3. Fetch data
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather data fetch failed");

    const data: WeatherData = await response.json();

    // 4. Use the data
    return new TempAndCondition(data['current_weather']['temperature'], parseWeatherCode(data['current_weather']['weathercode']));
    
  } catch (error) {
    console.error("Error:", error);
  }
}