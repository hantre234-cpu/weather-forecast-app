
// script.js - modern ES6+, local storage, geolocation, temperature toggle, dark mode, history dropdown
(function(){
// ---------- DOM Elements ----------
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const unitToggleBtn = document.getElementById('unitToggleBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const geolocationBtn = document.getElementById('geolocationBtn');
const historyBtn = document.getElementById('historyBtn');
const historyList = document.getElementById('historyList');
const errorContainer = document.getElementById('errorContainer');

const cityNameElem = document.getElementById('cityName');
const currentTempElem = document.getElementById('currentTemp');
const feelsLikeElem = document.getElementById('feelsLike');
const conditionTextElem = document.getElementById('conditionText');
const humidityElem = document.getElementById('humidity');
const windSpeedElem = document.getElementById('windSpeed');
const pressureElem = document.getElementById('pressure');
const mainWeatherIcon = document.getElementById('mainWeatherIcon');
const forecastContainer = document.getElementById('forecastContainer');
const tempUnitSpan = document.getElementById('tempUnit');

// App state
let currentWeatherData = null;      // holds current weather object
let currentForecastData = null;     // holds daily array (5+ days)
let currentCity = "Algiers";
let currentLat = null;
let currentLon = null;
let isCelsius = true;               // default °C
let darkModeEnabled = false;        // default light/glass style (but we manage background class style)
let recentCities = [];

// ---------- Helper: Load local storage ----------
function loadRecentFromStorage() {
    const stored = localStorage.getItem('nimbus_recent');
    if(stored) {
    try{
        recentCities = JSON.parse(stored);
        if(!Array.isArray(recentCities)) recentCities = [];
    } catch(e){ recentCities = [];}
    }
    if(recentCities.length === 0) recentCities = ["Algiers", "Tokyo", "New York"];
    updateHistoryDropdown();
}
function saveRecentToStorage() {
    localStorage.setItem('nimbus_recent', JSON.stringify(recentCities.slice(0, 6)));
}
function addCityToRecent(city) {
    if(!city) return;
    city = city.trim();
    if(city === "") return;
    recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
    recentCities.unshift(city);
    if(recentCities.length > 6) recentCities.pop();
    saveRecentToStorage();
    updateHistoryDropdown();
}
function updateHistoryDropdown() {
    historyList.innerHTML = '';
    recentCities.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => {
        cityInput.value = city;
        searchCityWeather(city);
        historyList.classList.remove('show');
    });
    historyList.appendChild(li);
    });
    if(recentCities.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No recent searches';
    historyList.appendChild(li);
    }
}
// toggle dropdown
historyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    historyList.classList.toggle('show');
});
document.addEventListener('click', (e) => {
    if(!historyBtn.contains(e.target) && !historyList.contains(e.target)) {
    historyList.classList.remove('show');
    }
});

// ---------- Weather Icon mapping (WMO codes -> Fontawesome) ----------
function getWeatherIconClass(code, isNight = false) {
    if(isNight && (code === 0 || code === 1)) return "fas fa-moon";
    const iconMap = {
    0: "fas fa-sun", 1: "fas fa-cloud-sun", 2: "fas fa-cloud", 3: "fas fa-cloud",
    45: "fas fa-smog", 48: "fas fa-smog", 51: "fas fa-cloud-rain", 53: "fas fa-cloud-rain",
    55: "fas fa-cloud-showers-heavy", 56: "fas fa-cloud-sleet", 57: "fas fa-cloud-sleet",
    61: "fas fa-cloud-rain", 63: "fas fa-cloud-showers-heavy", 65: "fas fa-cloud-showers-heavy",
    66: "fas fa-cloud-sleet", 67: "fas fa-cloud-sleet", 71: "fas fa-snowflake", 73: "fas fa-snowflake",
    75: "fas fa-snowflake", 77: "fas fa-snowflake", 80: "fas fa-cloud-rain", 81: "fas fa-cloud-showers-heavy",
    82: "fas fa-cloud-showers-heavy", 85: "fas fa-snowflake", 86: "fas fa-snowflake", 95: "fas fa-bolt",
    96: "fas fa-bolt", 99: "fas fa-bolt"
    };
    return iconMap[code] || "fas fa-cloud-sun";
}

// Background update based on weather condition & night detection
async function updateBackground(weatherCode, isNightTime) {
    const body = document.body;
    if(isNightTime) {
    body.className = 'night-bg';
    return;
    }
    if(weatherCode === 0) body.className = 'sunny-bg';
    else if(weatherCode === 1 || weatherCode === 2 || weatherCode === 3) body.className = 'cloudy-bg';
    else if((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || weatherCode === 95) body.className = 'rainy-bg';
    else if((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) body.className = 'snowy-bg';
    else body.className = 'cloudy-bg';
}

// determine night based on sunrise/sunset from daily data (first day)
function isNightTimeFromSunrise(sunriseStr, sunsetStr) {
    if(!sunriseStr || !sunsetStr) return false;
    const now = new Date();
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);
    return (now < sunrise || now > sunset);
}

// Show/hide loading
function setLoading(isLoading) {
    if(isLoading) {
    const loaderDiv = document.createElement('div');
    loaderDiv.id = 'globalLoader';
    loaderDiv.className = 'loading-spinner';
    loaderDiv.innerHTML = '<div class="spinner"></div>';
    if(!document.getElementById('globalLoader')) {
        document.querySelector('.weather-card').before(loaderDiv);
    }
    } else {
    const loader = document.getElementById('globalLoader');
    if(loader) loader.remove();
    }
}
function showError(msg) {
    errorContainer.innerText = msg;
    errorContainer.classList.remove('hidden');
    setTimeout(() => errorContainer.classList.add('hidden'), 4000);
}

// fetch city lat/lon
async function getCoordinates(city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const resp = await fetch(geoUrl);
    const data = await resp.json();
    if(!data.results || data.results.length === 0) throw new Error(`City "${city}" not found.`);
    const result = data.results[0];
    return { lat: result.latitude, lon: result.longitude, name: result.name };
}

// fetch weather + forecast
async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
    const resp = await fetch(url);
    if(!resp.ok) throw new Error('Weather API error');
    const data = await resp.json();
    return data;
}

// refresh UI using stored data / unit toggling
function applyTemperatureConversion(tempC) {
    if(isCelsius) return Math.round(tempC);
    return Math.round((tempC * 9/5) + 32);
}
function updateUIWithData(weatherData, forecastData, cityName) {
    if(!weatherData || !forecastData) return;
    const current = weatherData.current;
    const daily = forecastData.daily;
    const weatherCode = current.weather_code;
    const sunriseToday = daily.sunrise[0];
    const sunsetToday = daily.sunset[0];
    const isNight = isNightTimeFromSunrise(sunriseToday, sunsetToday);
    
    updateBackground(weatherCode, isNight);
    const iconClass = getWeatherIconClass(weatherCode, isNight);
    mainWeatherIcon.className = `${iconClass} weather-icon`;
    
    cityNameElem.innerText = cityName;
    const tempC = current.temperature_2m;
    currentTempElem.innerText = applyTemperatureConversion(tempC);
    tempUnitSpan.innerText = isCelsius ? '°C' : '°F';
    
    const feelsC = current.apparent_temperature;
    feelsLikeElem.innerText = `Feels like: ${applyTemperatureConversion(feelsC)}°${isCelsius ? 'C' : 'F'}`;
    
    conditionTextElem.innerText = getWeatherDescription(weatherCode);
    humidityElem.innerText = `${current.relative_humidity_2m}%`;
    windSpeedElem.innerText = `${current.wind_speed_10m} km/h`;
    pressureElem.innerText = `${current.pressure_msl} hPa`;
    
    // Render forecast (5 days)
    forecastContainer.innerHTML = '';
    const daysToShow = Math.min(5, daily.time.length);
    for(let i = 1; i <= daysToShow; i++) {
    const date = new Date(daily.time[i]);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month:'short', day:'numeric' });
    const maxC = daily.temperature_2m_max[i];
    const minC = daily.temperature_2m_min[i];
    const code = daily.weather_code[i];
    const iconFore = getWeatherIconClass(code, false);
    const maxVal = applyTemperatureConversion(maxC);
    const minVal = applyTemperatureConversion(minC);
    const card = document.createElement('div');
    card.className = 'forecast-day';
    card.innerHTML = `
        <div class="forecast-date">${dayName}</div>
        <i class="${iconFore} forecast-icon"></i>
        <div class="forecast-temp">${maxVal}° / ${minVal}°</div>
        <div style="font-size:0.75rem; color:#ddd;">${getWeatherDescription(code)}</div>
    `;
    forecastContainer.appendChild(card);
    }
}

function getWeatherDescription(code) {
    const desc = {
    0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast", 45: "Fog", 48: "Rime Fog",
    51: "Drizzle", 53: "Drizzle", 55: "Drizzle", 61: "Rain", 63: "Rain", 65: "Heavy Rain",
    71: "Snow", 73: "Snow", 75: "Heavy Snow", 77: "Snow Grains", 80: "Rain Showers",
    95: "Thunderstorm", 96: "Thunderstorm"
    };
    return desc[code] || "Cloudy";
}

// Main search & fetch pipeline
async function searchCityWeather(city) {
    if(!city.trim()) return;
    setLoading(true);
    errorContainer.classList.add('hidden');
    try {
    const { lat, lon, name } = await getCoordinates(city);
    currentLat = lat; currentLon = lon;
    const weatherFull = await fetchWeatherData(lat, lon);
    currentWeatherData = weatherFull;
    currentForecastData = weatherFull;
    currentCity = name;
    updateUIWithData(currentWeatherData, currentForecastData, name);
    addCityToRecent(name);
    cityInput.value = name;
    } catch (err) {
    showError(err.message || "Could not fetch weather. Check city name.");
    console.error(err);
    } finally {
    setLoading(false);
    }
}

// Refresh current location (last known coords)
async function refreshWeather() {
    if(currentLat && currentLon) {
    setLoading(true);
    try{
        const weatherFull = await fetchWeatherData(currentLat, currentLon);
        currentWeatherData = weatherFull;
        currentForecastData = weatherFull;
        updateUIWithData(currentWeatherData, currentForecastData, currentCity);
    } catch(e){
        showError("Refresh failed");
    } finally { setLoading(false);}
    } else {
    if(currentCity) searchCityWeather(currentCity);
    else searchCityWeather("London");
    }
}

// toggle unit
function toggleUnit() {
    isCelsius = !isCelsius;
    if(currentWeatherData && currentForecastData) {
    updateUIWithData(currentWeatherData, currentForecastData, currentCity);
    }
    unitToggleBtn.innerHTML = isCelsius ? '<i class="fas fa-temperature-high"></i>' : '<i class="fas fa-temperature-low"></i>';
}

// dark/light mode (preserve dynamic background but invert overlay)
function toggleDarkMode() {
    darkModeEnabled = !darkModeEnabled;
    const root = document.body;
    if(darkModeEnabled) {
    root.style.filter = 'invert(0.05) brightness(0.92)';
    root.style.background = '#0a0f1f';
    } else {
    root.style.filter = '';
    // reapply weather background class
    if(currentWeatherData) {
        const weatherCode = currentWeatherData.current.weather_code;
        const daily = currentForecastData.daily;
        const isNight = isNightTimeFromSunrise(daily.sunrise[0], daily.sunset[0]);
        updateBackground(weatherCode, isNight);
    } else updateBackground(0, false);
    }
    darkModeBtn.innerHTML = darkModeEnabled ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Geolocation + reverse geocoding (Nominatim)
async function getUserLocationWeather() {
    setLoading(true);
    if(!navigator.geolocation) {
    showError("Geolocation not supported");
    setLoading(false);
    return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
        // reverse geocoding to get city name
        const revGeo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
        const revData = await revGeo.json();
        let cityGuess = revData.address?.city || revData.address?.town || revData.address?.village || "Current Location";
        const weatherFull = await fetchWeatherData(latitude, longitude);
        currentLat = latitude; currentLon = longitude;
        currentWeatherData = weatherFull;
        currentForecastData = weatherFull;
        currentCity = cityGuess;
        updateUIWithData(currentWeatherData, currentForecastData, cityGuess);
        addCityToRecent(cityGuess);
        cityInput.value = cityGuess;
    } catch(err) {
        showError("Failed to get weather for your location");
    } finally { setLoading(false); }
    }, (err) => {
    showError("Location access denied or error");
    setLoading(false);
    });
}

// Event binding
searchBtn.addEventListener('click', () => searchCityWeather(cityInput.value));
refreshBtn.addEventListener('click', refreshWeather);
unitToggleBtn.addEventListener('click', toggleUnit);
darkModeBtn.addEventListener('click', toggleDarkMode);
geolocationBtn.addEventListener('click', getUserLocationWeather);
cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchCityWeather(cityInput.value); });

// Initial load: recent, default city (London)
loadRecentFromStorage();
searchCityWeather("London");
})();
