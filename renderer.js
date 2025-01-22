
const { ipcRenderer } = require('electron');

const urlBar = document.getElementById('url-bar');
const goButton = document.getElementById('go');
const tabContent = document.getElementById('tab-content');
const homepage = document.querySelector('.homepage');
const loadingIndicator = document.getElementById('loading-indicator');
const themeToggle = document.getElementById('theme-toggle');

let currentTabIndex = 0;
const tabs = [];
const tabHistory = [];

const loadPage = (url) => {
  if (url) {
    loadingIndicator.style.display = 'block';
    const iframe = tabs[currentTabIndex];
    iframe.src = url;
    tabHistory[currentTabIndex].push(url);
    homepage.style.display = 'none';
    tabContent.style.display = 'block';

    iframe.addEventListener('load', () => {
      loadingIndicator.style.display = 'none';
      urlBar.value = url;
    });

    iframe.addEventListener('error', () => {
      loadingIndicator.style.display = 'none';
      alert('Failed to load the page. Please check the URL and try again.');
    });
  }
};

const handleUrlInput = () => {
  const query = urlBar.value.trim();
  if (query) {
    let url;
    if (query.startsWith('http://') || query.startsWith('https://')) {
      url = query;
    } else if (query.includes('.') && !query.includes(' ')) {
      url = `https://${query}`;
    } else {
      const searchEngine = localStorage.getItem('searchEngine') || 'bing';
      url = `https://www.${searchEngine}.com/search?q=${encodeURIComponent(query)}`;
    }
    loadPage(url);
  }
};

goButton.addEventListener('click', handleUrlInput);
urlBar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUrlInput();
});

document.getElementById('back').addEventListener('click', () => {
  const history = tabHistory[currentTabIndex];
  if (history.length > 1) {
    history.pop();
    const previousUrl = history[history.length - 1];
    tabs[currentTabIndex].src = previousUrl;
  } else {
    alert('No more pages to go back to!');
  }
});

document.getElementById('forward').addEventListener('click', () => {
  alert('Forward button is not supported in this version.');
});

document.getElementById('reload').addEventListener('click', () => {
  const iframe = tabs[currentTabIndex];
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.location.reload();
  }
});

document.getElementById('home').addEventListener('click', () => {
  homepage.style.display = 'block';
  tabContent.style.display = 'none';
  urlBar.value = '';
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerHTML = document.body.classList.contains('dark-mode')
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
  document.body.classList.remove('dark-mode');
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

const addTab = () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'about:blank';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  tabContent.innerHTML = '';
  tabContent.appendChild(iframe);
  tabContent.style.display = 'none';
  homepage.style.display = 'block';
  tabs.push(iframe);
  tabHistory.push([]);
  currentTabIndex = tabs.length - 1;
};

addTab();


document.getElementById('settings').addEventListener('click', () => {
  loadPage('settings.html');
});

document.getElementById('clear-history')?.addEventListener('click', () => {
  tabHistory[currentTabIndex] = [];
  alert('History cleared!');
});

document.getElementById('clear-downloads')?.addEventListener('click', () => {
  alert('Downloads cleared!');
});

document.getElementById('reset-settings')?.addEventListener('click', () => {
  localStorage.clear();
  alert('Settings reset to default!');
});

document.getElementById('search-engine')?.addEventListener('change', (e) => {
  localStorage.setItem('searchEngine', e.target.value);
  alert(`Search engine set to ${e.target.value}`);
});

document.getElementById('minimize').addEventListener('click', () => {
  ipcRenderer.send('minimize-window');
});

document.getElementById('maximize').addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
});

document.getElementById('close').addEventListener('click', () => {
  ipcRenderer.send('close-window');
});