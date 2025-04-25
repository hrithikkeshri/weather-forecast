const API_KEY = '699f99f53a64d6ae9a2b692c9da9f921';

function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    fetchWeather(lat, lon);
    
    
  }, () => {
    alert("Location access denied.");
  });
}

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Enter a valid city name");

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
     
      
    })
    .then(data => {
      const { lat, lon } = data.coord;
      fetchWeather(lat, lon, city);
      addRecentCity(city);
    })
    .catch(() => alert("City not found!"));
}

function fetchWeather(lat, lon, cityName = '') {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      displayCurrentWeather(data, cityName || data.name);
    });

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      displayForecast(data.list);
    });
}

function displayCurrentWeather(data, city) {
  const html = `
    <div class="weather-card">
      <h2>${city}</h2>
      <p>🌡️ Temp: ${data.main.temp}°C</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬️ Wind: ${data.wind.speed} m/s</p>
      <p>⛅ Condition: ${data.weather[0].main}</p>
    </div>
  `;
  document.getElementById("weatherDisplay").innerHTML = html;
}

function displayForecast(list) {
  let days = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date] && Object.keys(days).length <= 5) {
      days[date] = item;
    }
  });

  const cards = Object.entries(days).map(([date, info]) => `
    <div class="forecast-card">
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png" />
      <p>${info.main.temp}°C</p>
      <p>${info.weather[0].main}</p>
      <p>💧 ${info.main.humidity}%</p>
    </div>
  `).join("");

  document.getElementById("forecast").innerHTML = `<div class="forecast-grid">${cards}</div>`;
}

function addRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
    loadRecentCities();
  }
}

function loadRecentCities() {
  const select = document.getElementById("recentCities");
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  select.innerHTML = '<option value="">Recent Searches</option>';
  cities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

function selectRecentCity() {
  const city = document.getElementById("recentCities").value;
  if (city) {
    document.getElementById("cityInput").value = city;
    getWeatherByCity();
  }
}

// Auto-load weather for current location on page load
window.onload = () => {
  getWeatherByLocation();
  loadRecentCities();
};
