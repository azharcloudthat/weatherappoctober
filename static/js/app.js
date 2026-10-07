const form = document.getElementById("search-form");
const cityInput = document.getElementById("city");
const button = document.getElementById("get-weather");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

// Expects: { city, country, temperature, feels_like, humidity, wind_speed, description }
async function getWeather(city) {
  setStatus("Loading weather...");
  button.disabled = true;
  resultsEl.hidden = true;

  try {
    const res = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

    renderWeather(data);
    setStatus("");
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    button.disabled = false;
  }
}

function themeFor(code, isDay) {
  if (code >= 95) return { theme: "storm", icon: "⛈️" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { theme: "snow", icon: "❄️" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { theme: "rain", icon: "🌧️" };
  if (code === 45 || code === 48) return { theme: "fog", icon: "🌫️" };
  if (code === 3) return { theme: "cloudy", icon: "☁️" };
  if (code === 1 || code === 2) return { theme: isDay ? "partly" : "night", icon: isDay ? "⛅" : "☁️" };
  return isDay ? { theme: "sunny", icon: "☀️" } : { theme: "night", icon: "🌙" };
}

function renderWeather(w) {
  const { theme, icon } = themeFor(w.weather_code, w.is_day);
  resultsEl.dataset.theme = theme;
  document.body.dataset.theme = theme;

  const mainIcon = document.createElement("span");
  mainIcon.className = "main-icon";
  mainIcon.setAttribute("aria-hidden", "true");
  mainIcon.textContent = icon;

  const title = document.createElement("h2");
  title.textContent = [w.city, w.country].filter(Boolean).join(", ");

  const temp = document.createElement("p");
  temp.className = "temp";
  temp.textContent = `${Math.round(w.temperature)}°C`;

  const desc = document.createElement("p");
  desc.textContent = w.description;

  const details = document.createElement("ul");
  details.className = "details";
  for (const [glyph, text] of [
    ["🌡️", `Feels like: ${Math.round(w.feels_like)}°C`],
    ["💧", `Humidity: ${w.humidity}%`],
    ["💨", `Wind: ${w.wind_speed} km/h`],
  ]) {
    const li = document.createElement("li");
    li.tabIndex = 0;
    const g = document.createElement("span");
    g.className = "detail-icon";
    g.setAttribute("aria-hidden", "true");
    g.textContent = glyph;
    li.append(g, text);
    details.append(li);
  }

  resultsEl.replaceChildren(mainIcon, title, temp, desc, details);
  resultsEl.hidden = false;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});
