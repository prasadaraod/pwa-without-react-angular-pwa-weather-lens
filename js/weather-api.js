const API_KEY = '5658d0ddd5ad71ff55291d64ba911b41'; // Replace with a valid API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeatherData(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    
    const data = await response.json();
    return data;
  } catch (error) {
    // If network fails (offline), try accessing the fallback from Cache Storage manually
    // or let the service worker handle the API caching intercept
    console.warn('Network request failed. Relying on Service Worker caching intercept...', error);
    
    // Manual fallback detection if needed:
    if ('caches' in window) {
      const cachedResponse = await caches.match(url);
      if (cachedResponse) {
        return await cachedResponse.json();
      }
    }
    throw error;
  }
}