# 🌤️ Nimbus Forecast – Professional Weather App

A modern, fully responsive weather forecast web application that provides real-time weather data and a 5‑day forecast for any city worldwide. Built with pure HTML5, CSS3, and JavaScript (ES6+), it features a beautiful glassmorphism UI, dynamic backgrounds based on weather conditions, unit toggling (°C/°F), dark mode, geolocation support, and search history with local storage.

![Weather App Demo](https://via.placeholder.com/800x400?text=Nimbus+Forecast+Screenshot)
> *Replace with actual screenshot of your live project*

---

## ✨ Features

### Core Weather Information
- 🌍 Search any city worldwide
- 🌡️ Current temperature & "feels like" temperature
- ☁️ Weather condition with dynamic icon
- 💧 Humidity, 💨 Wind speed, 🧭 Atmospheric pressure
- 📅 5‑day forecast (daily max/min temperatures, conditions, icons)

### Advanced UI/UX
- 🎨 **Dynamic backgrounds** – changes based on weather (Sunny, Cloudy, Rainy, Snowy, Night)
- 🌓 **Dark / Light mode** toggle
- 🌡️ **Toggle between Celsius and Fahrenheit**
- 📍 **Geolocation API** – detect and show weather for your current location
- 🕒 **Search history** – last 6 cities saved in Local Storage, accessible via dropdown
- 🔄 **Refresh button** – fetch latest data without re‑searching
- 💫 Smooth animations, hover effects, and glassmorphism cards

### Technical Highlights
- ✅ Pure HTML5, CSS3, JavaScript (no external frameworks)
- ✅ Fetch API with async/await & proper error handling
- ✅ Mobile‑first responsive design (works on desktop, tablet, mobile)
- ✅ Loading spinner while fetching data
- ✅ Production‑ready code with meaningful comments

---

## 🛠️ Technologies Used

| Technology       | Purpose                                      |<br>
|------------------|----------------------------------------------|<br>
| HTML5<span></span>            | Semantic structure                          |<br>
| CSS3             | Glassmorphism design, animations, responsive layout |<br>
| JavaScript (ES6+)| All logic, DOM manipulation, async operations |<br>
| Fetch API        | HTTP requests to weather APIs                |<br>
| Open‑Meteo API   | Free weather & geocoding data (no API key required) |<br>
| Local Storage    | Persist search history                       |<br>
| Geolocation API  | Get user's current position                  |<br>
| Font Awesome 6   | Weather and UI icons                         |<br>

---

## 🚀 Live Demo

> *Deploy the project on GitHub Pages, Netlify, or Vercel and insert the link here.*  
[🔗 View Live Demo](#) *(add your link)*

---

## 📦 Installation & Usage

You can run this project locally in 3 simple steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nimbus-forecast.git
   cd nimbus-forecast
---
2. Open the project
   · Just open index.html in your favourite browser (Chrome, Firefox, Edge, etc.)
   · No build steps, no dependencies – it works out of the box.
3. Start using the app
   · Type a city name (e.g., "Paris", "Tokyo") and click Search.
   · Click 📍 My Location to get weather for your current location.
   · Toggle between °C/°F using the thermometer button.
   · Switch dark/light mode with the moon/sun button.
   · View your recent searches in the Recent dropdown.

---

📁 Project Structure

nimbus-forecast/<br>
│<br>
├── index.html          # Main HTML structure<br>
├── style.css           # All styles (embedded in <style> for simplicity, but can be separate)<br>
├── script.js           # All JavaScript code (ES6+)<br>
├── README.md           # Project documentation<br>
└── assets/             # (Optional) folder for screenshots or custom icons<br>
Note: The code provided in the final answer includes CSS and JS inside the same HTML file for convenience. For a cleaner portfolio project, you can split them into separate files as shown above.

---

🌐 API Reference

This project uses two free endpoints from Open‑Meteo – no API key required.

Endpoint Description
https://geocoding-api.open-meteo.com/v1/search Converts city name to geographic coordinates (latitude/longitude).
https://api.open-meteo.com/v1/forecast Returns current weather + 5‑day forecast (temperature, humidity, wind, pressure, weather codes, sunrise/sunset).

Example request:

https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
