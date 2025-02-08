// Selecting Elements
const searchBtn = document.querySelector(".search-btn");
const cityField = document.querySelector(".city-input");
const weatherContainer = document.querySelector(".weather-cards");
const todayWeather = document.querySelector(".current-weather");
const locationBtn = document.querySelector(".location-btn");
const recentCitiesBox = document.getElementById("recent-cities");

const API_KEY = "b3ec7413bf391dbd37efad7484ef30cb";

// Fetch Weather Data
const fetchWeather = async (city) => {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`);
        const data = await res.json();

        if (!data.list) {
            alert("City not found!");
            return;
        }

        const { name } = data.city;
        const forecastDays = [];

        const filteredForecast = data.list.reduce((acc, entry) => {
            const day = new Date(entry.dt_txt).getDate();
            if (!forecastDays.includes(day)) {
                forecastDays.push(day);
                acc.push(entry);
            }
            return acc;
        }, []);

        renderWeather(name, filteredForecast);
        storeRecentCity(name);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

// Render Weather Data
const renderWeather = (city, forecast) => {
    cityField.value = "";
    todayWeather.innerHTML = "";
    weatherContainer.innerHTML = "";

    forecast.forEach((day, index) => {
        const weatherHTML = `
            <div class="bg-white p-4 rounded-lg shadow-md text-center">
                <span class="font-bold">${index === 0 ? city : day.dt_txt.split(" ")[0]}</span>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather-icon">
                <p>🌡️ Temp: ${(day.main.temp - 273.15).toFixed(1)}°C</p>
                <p>💨 Wind: ${day.wind.speed} m/s</p>
                <p>💧 Humidity: ${day.main.humidity}%</p>
            </div>
        `;
        index === 0 ? todayWeather.insertAdjacentHTML("beforeend", weatherHTML) : weatherContainer.insertAdjacentHTML("beforeend", weatherHTML);
    });
};

// Store and Retrieve Recent Cities
const storeRecentCity = (city) => {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
        cities = [city, ...cities].slice(0, 5); // Keep only last 5 searches
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    displayRecentCities();
};

const displayRecentCities = () => {
    recentCitiesBox.innerHTML = "";
    const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    
    cities.forEach((city) => {
        const cityDiv = document.createElement("div");
        cityDiv.textContent = city;
        cityDiv.className = "p-2 cursor-pointer hover:bg-gray-400";
        cityDiv.onclick = () => fetchWeather(city);
        recentCitiesBox.appendChild(cityDiv);
    });
};

// Get User Location
const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
        const locationData = await res.json();
        if (locationData[0]) fetchWeather(locationData[0].name);
    }, () => alert("Location access denied!"));
};

// Event Listeners
searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const city = cityField.value.trim();
    if (city) fetchWeather(city);
});

locationBtn.addEventListener("click", fetchUserLocation);

displayRecentCities(); // Load stored cities on page load
