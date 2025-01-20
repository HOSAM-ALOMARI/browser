const { ipcRenderer } = require('electron');

// ======================
// Window Controls
// ======================
document.getElementById('minimize').addEventListener('click', () => {
  ipcRenderer.send('minimize-window');
});

document.getElementById('maximize').addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
});

document.getElementById('close').addEventListener('click', () => {
  ipcRenderer.send('close-window');
});

// ======================
// Search Bar and Go Button
// ======================
const urlBar = document.getElementById('url-bar');
const goButton = document.getElementById('go');
const searchResults = document.getElementById('search-results');
const suggestions = document.getElementById('suggestions');

const search = (query) => {
  if (query) {
    let url;
    if (query.startsWith('http://') || query.startsWith('https://')) {
      url = query;
    } else if (query.includes('.') && !query.includes(' ')) {
      url = `https://${query}`;
    } else {
      // Use Google search for queries
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    // Load the URL in an iframe
    loadUrlInIframe(url);
    addToHistory(url); // Add visited URL to history
  }
};

// Load URL in iframe
const loadUrlInIframe = (url) => {
  searchResults.innerHTML = `<iframe src="${url}" width="100%" height="100%" frameborder="0"></iframe>`;
};

// Handle Enter key in the URL bar
urlBar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = urlBar.value.trim();
    search(query);
  }
});

// Handle Go button click
goButton.addEventListener('click', () => {
  const query = urlBar.value.trim();
  search(query);
});

// Search Suggestions
urlBar.addEventListener('input', async () => {
  const query = urlBar.value.trim();
  if (query.length > 2) {
    const ddgSuggestionsEndpoint = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}`;
    try {
      const response = await fetch(ddgSuggestionsEndpoint);
      const data = await response.json();
      suggestions.innerHTML = data.map((suggestion) => `<div>${suggestion.phrase}</div>`).join('');
      suggestions.classList.add('show');
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestions.innerHTML = '';
      suggestions.classList.remove('show');
    }
  } else {
    suggestions.innerHTML = '';
    suggestions.classList.remove('show');
  }
});

// Handle suggestion click
suggestions.addEventListener('click', (e) => {
  if (e.target.tagName === 'DIV') {
    urlBar.value = e.target.textContent;
    search(urlBar.value);
    suggestions.classList.remove('show');
  }
});

// ======================
// Bookmark Button
// ======================
const bookmarkButton = document.getElementById('bookmark');
bookmarkButton.addEventListener('click', () => {
  const url = urlBar.value.trim();
  if (url) {
    addToBookmarks(url);
    alert('Bookmark added!');
  } else {
    alert('Please enter a valid URL.');
  }
});

// Add to Bookmarks
function addToBookmarks(url) {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
  bookmarks.push(url);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// Add to History
function addToHistory(url) {
  let history = JSON.parse(localStorage.getItem('history')) || [];
  history.push(url);
  localStorage.setItem('history', JSON.stringify(history));
}

// Display History
if (window.location.pathname.includes('history.html')) {
  const historyList = document.getElementById('history-list');
  let history = JSON.parse(localStorage.getItem('history')) || [];
  history.forEach((url) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
    historyList.appendChild(li);
  });
}

// ======================
// Theme Toggle
// ======================
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode')
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

// ======================
// Weather Widget
// ======================
const weatherInfo = document.getElementById('weather-info');
const weatherIcon = document.getElementById('weather').querySelector('i');

const fetchWeather = () => {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key
  const city = 'YOUR_CITY'; // Replace with your city
  const weatherEndpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(weatherEndpoint)
    .then((response) => response.json())
    .then((data) => {
      const temperature = data.main.temp;
      const description = data.weather[0].description;
      weatherInfo.textContent = `${temperature}°C, ${description}`;
    })
    .catch((error) => {
      console.error('Error fetching weather data:', error);
      weatherInfo.textContent = 'Weather unavailable';
    });
};

fetchWeather(); // Fetch weather on page load

// ======================
// Navigation Functions
// ======================
function navigateTo(page) {
  window.location.href = page;
}

function goBack() {
  window.history.back();
}