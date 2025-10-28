import './style.css';
import iconSunny from './images/icon-sunny.webp';
import iconRain from './images/icon-rain.webp';
import iconOvercast from './images/icon-overcast.webp';
import iconDrizzle from './images/icon-drizzle.webp';
import iconStorm from './images/icon-storm.webp';
import iconSnow from './images/icon-snow.webp';
import iconFog from './images/icon-fog.webp';

const weatherIcons = {
  Clear: iconSunny,
  Rain: iconRain,
  Clouds: iconOvercast,
  Drizzle: iconDrizzle,
  Thunderstorm: iconStorm,
  Snow: iconSnow,
  Mist: iconFog,
  Fog: iconFog,
  Haze: iconFog,
};

const GEOAPIFY_API_KEY = "0d51bcf7eeea4d90a5f4d5dda30a6c94";
const WEATHER_API_KEY = "1a812f858c2b1888f6b7d7a628500d56";

// DOM elements
const loader = document.getElementById("loadingScreen");
const weatherContent = document.getElementById("weatherContent");
const errorMessage = document.getElementById("errorMessage");
const searchForm = document.querySelector(".searchbar form");
const locationInput = document.getElementById("location");
const unitsButton = document.getElementById("unitsButton");
const unitsDropdown = document.getElementById("unitsDropdown");
const dropdownOptions = document.querySelectorAll(".dropdown-option");
const suggestionsDropdown = document.getElementById("suggestions");
const daySelect = document.querySelector(".hourly-forecast select");
// Units state
const unitsState = {
  temperature: "celsius",
  windSpeed: "kmh",
  precipitation: "mm",
};

function showLoader() {
  const loader = document.getElementById("loadingScreen");
  const weatherContent = document.getElementById("weatherContent");
  const errorMessage = document.getElementById("errorMessage");

  if (loader) {
    loader.classList.remove("hidden");
    loader.style.display = "flex";
    loader.style.opacity = "1";
  }
  
  // Hide weather content and error
  if (weatherContent) {
    weatherContent.classList.add("hidden");
    weatherContent.classList.remove("visible");
  }
  
  if (errorMessage) {
    errorMessage.style.display = "none";
    errorMessage.setAttribute("aria-hidden", "true");
  }
}

function hideLoader() {
  const loader = document.getElementById("loadingScreen");
  const weatherContent = document.getElementById("weatherContent");
  const errorMessage = document.getElementById("errorMessage");

  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.add("hidden");
      loader.style.display = "none";
    }, 300);
  }
  
  if (errorMessage) {
    errorMessage.style.display = "none";
    errorMessage.style.opacity = "0";
    errorMessage.setAttribute("aria-hidden", "true");
  }
  
  if (weatherContent) {
    weatherContent.classList.remove("hidden");
    weatherContent.classList.add("visible");
    weatherContent.style.display = "grid"; // Force display
  }
}

function showError() {
  const errorMessage = document.getElementById("errorMessage");
  const weatherContent = document.getElementById("weatherContent");
  
  if (weatherContent) {
    weatherContent.classList.add("hidden");
    weatherContent.classList.remove("visible");
  }
  
  if (errorMessage) {
    errorMessage.style.display = "flex";
    errorMessage.setAttribute("aria-hidden", "false");
  }
}

// Weather data storage
let currentWeatherData = null;
let dailyForecastData = null;
let hourlyForecastData = null;

// Conversion functions
function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

function mpsToKmh(mps) {
  return Math.round(mps * 3.6);
}

function mpsToMph(mps) {
  return Math.round(mps * 2.237);
}

function mmToInches(mm) {
  return (mm / 25.4).toFixed(2);
}

// Update display functions
function updateTemperatureDisplay() {
  const tempElements = document.querySelectorAll(".degree[data-celsius]");
  tempElements.forEach((el) => {
    const celsius = parseFloat(el.dataset.celsius);
    if (!isNaN(celsius)) {
      el.textContent = unitsState.temperature === "fahrenheit"
        ? `${celsiusToFahrenheit(celsius)}°F`
        : `${Math.round(celsius)}°C`;
    }
  });

  const feelsLikeEl = document.getElementById("feelsLike");
  if (feelsLikeEl && feelsLikeEl.dataset.celsius) {
    const celsius = parseFloat(feelsLikeEl.dataset.celsius);
    feelsLikeEl.textContent = unitsState.temperature === "fahrenheit"
      ? `${celsiusToFahrenheit(celsius)}°F`
      : `${Math.round(celsius)}°C`;
  }
}

function updateWindSpeedDisplay() {
  const windEl = document.getElementById("wind");
  if (windEl && windEl.dataset.mps) {
    const mps = parseFloat(windEl.dataset.mps);
    windEl.textContent = unitsState.windSpeed === "mph"
      ? `${mpsToMph(mps)} mph`
      : `${mpsToKmh(mps)} km/h`;
  }
}

function updatePrecipitationDisplay() {
  const precipEl = document.getElementById("precipitation");
  if (precipEl && precipEl.dataset.mm) {
    const mm = parseFloat(precipEl.dataset.mm);
    precipEl.textContent = unitsState.precipitation === "mm"
      ? `${mm} mm`
      : `${mmToInches(mm)} in`;
  }
}

function updateAllDisplays() {
  updateTemperatureDisplay();
  updateWindSpeedDisplay();
  updatePrecipitationDisplay();
}

// Toggle dropdown
unitsButton.addEventListener("click", (e) => {
  e.stopPropagation();
  unitsButton.classList.toggle("active");
  unitsDropdown.classList.toggle("show");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!unitsButton.contains(e.target) && !unitsDropdown.contains(e.target)) {
    unitsButton.classList.remove("active");
    unitsDropdown.classList.remove("show");
  }
});

// Handle option selection
dropdownOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const type = option.dataset.type;
    const value = option.dataset.value;
    
    // Remove selected class from siblings
    const siblings = option.parentElement.querySelectorAll(".dropdown-option");
    siblings.forEach((sib) => sib.classList.remove("selected"));
    
    // Add selected class to clicked option
    option.classList.add("selected");
    
    // Update state
    if (type === "temp") {
      unitsState.temperature = value;
      updateTemperatureDisplay();
    } else if (type === "wind") {
      unitsState.windSpeed = value;
      updateWindSpeedDisplay();
    } else if (type === "precip") {
      unitsState.precipitation = value;
      updatePrecipitationDisplay();
    }
  });
  
  // Add touch support for dropdown options
  option.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent default touch behavior
    option.classList.add("touch-active"); // Visual feedback
  });
  
  option.addEventListener("touchend", (e) => {
    e.preventDefault();
    option.classList.remove("touch-active");
    const type = option.dataset.type;
    const value = option.dataset.value;
    
    const siblings = option.parentElement.querySelectorAll(".dropdown-option");
    siblings.forEach((sib) => sib.classList.remove("selected"));
    
    option.classList.add("selected");
    
    if (type === "temp") {
      unitsState.temperature = value;
      updateTemperatureDisplay();
    } else if (type === "wind") {
      unitsState.windSpeed = value;
      updateWindSpeedDisplay();
    } else if (type === "precip") {
      unitsState.precipitation = value;
      updatePrecipitationDisplay();
    }
  });
});

// Debounce utility for API calls
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Fetch location suggestions from Geoapify
async function fetchSuggestions(query) {
  if (query.length < 1) {
    // Only search after 1 characters
    hideSuggestions();
    return;
  }

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    query
  )}&type=city&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch suggestions");
    const data = await response.json();
    displaySuggestions(data.features || []);
  } catch (error) {
    console.error("Suggestions error:", error);
    hideSuggestions();
  }
}

// Display suggestions in dropdown
function displaySuggestions(features) {
  const dropdown = document.getElementById("suggestions");
  dropdown.innerHTML = "";
  dropdown.classList.add("show");

  if (features.length === 0) {
    hideSuggestions();
    return;
  }
  
  features.forEach((feature, index) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = feature.properties.formatted; // e.g., "Berlin, Germany"
    item.setAttribute("role", "option");
    item.addEventListener("click", () => selectSuggestion(feature.properties));
    dropdown.appendChild(item);
  });
}

// Hide suggestions dropdown
function hideSuggestions() {
  const dropdown = document.getElementById("suggestions");
  if (dropdown) dropdown.classList.remove("show");
}

// Handle suggestion selection
function selectSuggestion(properties) {
  const input = document.getElementById("location");
  if (input) {
    input.value = properties.city || properties.formatted; // Prefer city name, fallback to full
    hideSuggestions();
    searchWeather(input.value);
  }
}

// Setup input event listeners for autocomplete
const input = document.getElementById("location");
if (input) {
  const debouncedFetch = debounce((query) => fetchSuggestions(query), 300);
  input.addEventListener("input", (e) => debouncedFetch(e.target.value));

  // Handle keyboard navigation
  let selectedIndex = -1;
  input.addEventListener("keydown", (e) => {
    const dropdown = document.getElementById("suggestions");
    const items = dropdown?.querySelectorAll(".suggestion-item");
    
    if (!items) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection(items);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex].click();
    } else if (e.key === "Escape") {
      hideSuggestions();
      selectedIndex = -1;
    }
  });

  function updateSelection(items) {
    items.forEach((item, index) => {
      item.classList.toggle("selected", index === selectedIndex);
    });
  }

  // Hide on blur (with delay for clicks)
  input.addEventListener("blur", () => {
    setTimeout(hideSuggestions, 150);
  });
}

// Function to create and append an image element
function createWeatherIcon(container, condition) {
  if (!container) return;
  container.innerHTML = "";
  const img = document.createElement("img");
  img.src = weatherIcons[condition] || "images/icon-sunny.webp";
  img.alt = condition;
  img.style.width = container.classList.contains("weather-icon") ? "84px" : "30px";
  img.style.height = container.classList.contains("weather-icon") ? "84px" : "30px";
  img.style.objectFit = "contain";
  img.style.display = "block";
  container.appendChild(img);
}


// Function to fetch current weather data based on location or city
async function searchWeather(location = null) {
  const cityInput = document.getElementById("location");
  let lat, lon;
  
  console.log("Starting searchWeather for:", location || "geolocation");
  
  try {
    showLoader(); // Load starts here
    
    // If location is null, attempt to use geolocation
    if (!location) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log("Geolocation success - Lat:", lat, "Lon:", lon);
    } else {
      // Use Geoapify to convert city name to coordinates
      const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        location
      )}&apiKey=${GEOAPIFY_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) throw new Error(`Geocode error! status: ${geoResponse.status}`);
      const geoData = await geoResponse.json();
      if (!geoData.features || geoData.features.length === 0) {
        throw new Error("Invalid location");
      }
      
      let selectedFeature = geoData.features[0]; // default fallback
      
      if (location.toLowerCase().includes("berlin")) {
        const berlinGermany = geoData.features.find(f => 
          f.properties.city?.toLowerCase() === "berlin" &&
          f.properties.country?.toLowerCase() === "germany"
        );
        if (berlinGermany) {
          selectedFeature = berlinGermany;
        }
      }
      
      ({ lat, lon } = selectedFeature.properties);
      console.log("Geocoded location - Lat:", lat, "Lon:", lon);
      
    }
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Timeout triggered for:", lat, lon);
      controller.abort();
    }, 15000);
    const response = await fetch(currentWeatherUrl, {
      signal: controller.signal,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    
    clearTimeout(timeoutId);
    console.log("Weather API response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Weather data received:", data);
    currentWeatherData = data;    
    
    
    // Extract current weather data
    const locationName = data.name || "Unknown";
    const temperature = Math.round(data.main.temp);
    const condition = data.weather[0].main;
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const precipitation = data.rain ? data.rain["1h"] || 0 : 0;
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    // Update current weather DOM
    const locationNameEl = document.getElementById("locationName");
    const dateEl = document.getElementById("date");
    const temperatureEl = document.getElementById("temperature");
    const weatherIconEl = document.getElementById("weatherIcon");
    const feelsLikeEl = document.getElementById("feelsLike");
    const humidityEl = document.getElementById("humidity");
    const windEl = document.getElementById("wind");
    const precipitationEl = document.getElementById("precipitation");

    if (locationNameEl) locationNameEl.textContent = locationName;
    if (dateEl) dateEl.textContent = date;

    if (temperatureEl) {
      const degreeEl = temperatureEl.querySelector(".degree");
      const conditionEl = temperatureEl.querySelector("p");
      if (degreeEl) {
        degreeEl.dataset.celsius = temperature;
        degreeEl.textContent = unitsState.temperature === "fahrenheit"
          ? `${celsiusToFahrenheit(temperature)}°F`
          : `${temperature}°C`;
      }
      if (conditionEl) conditionEl.textContent = condition;
    }
    
    if (weatherIconEl) createWeatherIcon(weatherIconEl, condition);
    
    if (feelsLikeEl) {
      feelsLikeEl.dataset.celsius = feelsLike;
      feelsLikeEl.textContent = unitsState.temperature === "fahrenheit"
        ? `${celsiusToFahrenheit(feelsLike)}°F`
        : `${feelsLike}°C`;
    }
    if (humidityEl) humidityEl.textContent = `${humidity}%`;
    if (windEl) {
      windEl.dataset.mps = wind;
      windEl.textContent = unitsState.windSpeed === "mph"
        ? `${mpsToMph(wind)} mph`
        : `${mpsToKmh(wind)} km/h`;
    }
    if (precipitationEl) {
      precipitationEl.dataset.mm = precipitation;
      precipitationEl.textContent = unitsState.precipitation === "mm"
        ? `${precipitation} mm`
        : `${mmToInches(precipitation)} in`;
    }
    
    // Fetch forecast
    console.log("Fetching forecast for lat:", lat, "lon:", lon);
    await fetchForecast(lat, lon, WEATHER_API_KEY);
    hideLoader(); // Ends here
    
  } catch (error) {
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    // ERROR_CODE_INSERTION_POINT
    if (error.name === "AbortError") {
      errorMessage.textContent = "Request timeout. Please check your internet connection and try again.";
    } else if (error.message.includes("Geocode error") || error.message.includes("Invalid location")) {
      errorMessage.textContent = "Could not determine your location. Defaulting to London.";
      await searchWeather("London"); // Fallback to Berlin
    } else if (error.message.includes("HTTP error")) {
      errorMessage.textContent = `API Error: ${error.message}. Please check if the city name is correct.`;
    } else {
      errorMessage.textContent = `Failed to fetch weather data.\n\nError: ${error.message}\n\nPlease try again.`;
      await searchWeather("London"); //Fsllback to Berlin
    }
    showError();
    hideLoader();
  }
}

// Function to fetch daily and hourly forecast
async function fetchForecast(lat, lon, apiKey) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  console.log("Fetching forecast...");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(forecastUrl, {
      signal: controller.signal,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    
    clearTimeout(timeoutId);
    console.log("Forecast API response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Forecast data received:", data);
    dailyForecastData = data.list;
    
    // Update daily forecast
    const dailyForecast = document.querySelector(".daily-forecast");
    if (dailyForecast) {
      const dailyItems = dailyForecast.querySelectorAll("div:not(:first-child)");
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      // Group forecasts by day
      const dailyData = {};
      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            temps: [],
            conditions: [],
            dt: item.dt,
          };
        }
        dailyData[dayKey].temps.push(item.main.temp);
        dailyData[dayKey].conditions.push(item.weather[0].main);
      });
      
      const dailyArray = Object.values(dailyData);
      
      console.log(`Found ${dailyArray.length} days of forecast data`);
      
      dailyItems.forEach((item, index) => {
        const dayNameEl = item.querySelector("p");
        const iconEl = item.querySelector(".icon");
        const tempEl = item.querySelector(".degree");
        if (dailyArray[index]) {
          // We have data for this day
          const date = new Date(dailyArray[index].dt * 1000);
          const dayName = days[date.getDay()];
          const avgTemp = Math.round(
            dailyArray[index].temps.reduce((a, b) => a + b, 0) /
              dailyArray[index].temps.length
          );
          const condition = dailyArray[index].conditions[0];
          
          if (dayNameEl) dayNameEl.textContent = dayName;
          if (iconEl) createWeatherIcon(iconEl, condition);
          if (tempEl) {
            tempEl.dataset.celsius = avgTemp;
            tempEl.textContent = unitsState.temperature === "fahrenheit"
              ? `${celsiusToFahrenheit(avgTemp)}°F`
              : `${avgTemp}°C`;
          }
          
          // Show the item
          item.style.display = "";
          item.style.opacity = "1";
        } else {
          // No data available for this day - hide it
          item.style.display = "none";
        }
      });
    }
    
    // Update hourly forecast
    const hourlyForecast = document.querySelector(".hours");
    if (hourlyForecast) {
      const hourlyItems = hourlyForecast.querySelectorAll("div");
      
      console.log(`Available hourly slots: ${hourlyItems.length}`);
      console.log(`Available forecast data: ${data.list.length} intervals`);
      
      // Get today's date to filter today's data
      const today = new Date();
      const todayStr = today.toDateString();
      
      // Filter for today and tomorrow's data
      const relevantData = data.list.slice(0, Math.min(hourlyItems.length, data.list.length));
      
      hourlyItems.forEach((item, index) => {
        const timeEl = item.querySelector(".time");
        const iconEl = item.querySelector(".icon");
        const degreeEl = item.querySelector(".degree");
        
        if (relevantData[index]) {
          // We have data for this slot
          const hourDate = new Date(relevantData[index].dt * 1000);
          const time = hourDate.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
          const temp = Math.round(relevantData[index].main.temp);
          const condition = relevantData[index].weather[0].main;
          
          if (timeEl) timeEl.textContent = time;
          if (iconEl) createWeatherIcon(iconEl, condition);
          if (degreeEl) {
            degreeEl.dataset.celsius = temp;
            degreeEl.textContent = unitsState.temperature === "fahrenheit"
              ? `${celsiusToFahrenheit(temp)}°F`
              : `${temp}°C`;
          }
          
          // Show the item
          item.style.display = "";
          item.style.opacity = "1";
        } else {
          // No data available - hide this slot
          item.style.display = "none";
        }
      });
    }
  } catch (error) {
    console.error("Forecast error:", error.message);
    console.warn("Forecast failed - current weather stays visible.");
  }
}

// Event listeners
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityInput = document.getElementById("location");
    if (cityInput && cityInput.value.trim()) {
      searchWeather(cityInput.value.trim());
    }
  });
}

if (daySelect) {
  daySelect.addEventListener("change", () => {
    const cityInput = document.getElementById("location");
    searchWeather(cityInput && cityInput.value.trim());
  });
}

// Initial load with geolocation
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    errorMessage?.setAttribute("aria-hidden", "true"); // Explicitly hide on load
    searchWeather();
  });
} else {
  errorMessage?.setAttribute("aria-hidden", "true"); // Explicitly hide on load
  searchWeather();
} 

/* ---SEARCH-BAR “GO INSIDE / COME OUT” LOGIC---*/
const searchBar   = document.querySelector('.searchbar');
const searchBtn   = document.querySelector('.search-btn');
const searchInput = document.getElementById('location');


searchBtn.addEventListener('click', (e) => {
  e.preventDefault();                 
  searchBar.classList.add('active');
  searchInput.focus();                
});

document.addEventListener('click', (e) => {
  if (searchBar.classList.contains('active') &&
      !searchBar.contains(e.target)) {
    searchBar.classList.remove('active');
    // optional: keep the entered text
    // searchInput.value stays, you can clear it if you want
  }
});

/* Keep the bar open when the user is typing */
searchInput.addEventListener('focus', () => {
  searchBar.classList.add('active');
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city) searchWeather(city);
});

