import { fetchWeatherData } from './weather-api.js';

// 1. Register Service Worker for Offline Capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// 2. DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const toast = document.getElementById('offline-toast');

// 3. Handle Network Status Changes
window.addEventListener('online', () => toast.classList.add('hidden'));
window.addEventListener('offline', () => toast.classList.remove('hidden'));

// 4. Trigger Weather Fetch
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) return;
  
  try {
    const data = await fetchWeatherData(city);
    updateUI(data);
  } catch (error) {
    console.error("Could not retrieve weather data:", error);
  }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

function updateUI(data) {
  if (!data) return;
  document.getElementById('weather-dashboard').classList.remove('hidden');
  document.getElementById('location-name').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('weather-desc').textContent = data.weather[0].description;
  document.getElementById('temperature').textContent = Math.round(data.main.temp);
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('wind').textContent = data.wind.speed;
}

// 5. Handle PWA "Add to Home Screen" Installation Prompt
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block'; // Show install button
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  }
  deferredPrompt = null;
  installBtn.style.display = 'none';
});