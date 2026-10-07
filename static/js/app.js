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

function renderWeather(w) {
  const title = document.createElement("h2");
  title.textContent = [w.city, w.country].filter(Boolean).join(", ");

  const temp = document.createElement("p");
  temp.className = "temp";
  temp.textContent = `${Math.round(w.temperature)}°C`;

  const desc = document.createElement("p");
  desc.textContent = w.description;

  const details = document.createElement("ul");
  details.className = "details";
  for (const text of [
    `Feels like: ${Math.round(w.feels_like)}°C`,
    `Humidity: ${w.humidity}%`,
    `Wind: ${w.wind_speed} km/h`,
  ]) {
    const li = document.createElement("li");
    li.textContent = text;
    details.append(li);
  }

  resultsEl.replaceChildren(title, temp, desc, details);
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
