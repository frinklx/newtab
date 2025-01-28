// Settings and State Management
let settings = {
  theme: "dark",
  githubUsername: "",
  githubToken: "",
  enabledWidgets: [
    "time",
    "github",
    "snippet",
    "news",
    "quickLinks",
    "system",
    "todo",
    "terminal",
  ],
  customLinks: [],
};

// Load settings from storage
chrome.storage.sync.get("settings", (data) => {
  if (data.settings) {
    settings = { ...settings, ...data.settings };
    applySettings();
  }
});

function applySettings() {
  // Apply theme
  document.body.setAttribute("data-theme", settings.theme);

  // Update GitHub credentials
  if (settings.githubUsername && settings.githubToken) {
    fetchGitHubActivity();
  }

  // Show/hide widgets
  settings.enabledWidgets.forEach((widgetId) => {
    const widget = document.getElementById(`${widgetId}Widget`);
    if (widget) {
      widget.style.display = "block";
    }
  });
}

// Time and Date Widget
function updateTime() {
  const now = new Date();
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const timezoneElement = document.getElementById("timezone");

  timeElement.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  dateElement.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  timezoneElement.textContent =
    Intl.DateTimeFormat().resolvedOptions().timeZone;
}

setInterval(updateTime, 1000);
updateTime();

// Weather Widget
async function updateWeather() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=YOUR_API_KEY`
    );
    const data = await response.json();

    const weatherElement = document.getElementById("weather");
    weatherElement.textContent = `${Math.round(data.main.temp)}°C ${
      data.weather[0].main
    }`;
  } catch (error) {
    console.error("Weather error:", error);
  }
}

// GitHub Activity Widget
async function fetchGitHubActivity() {
  if (!settings.githubUsername || !settings.githubToken) {
    return;
  }

  const headers = {
    Authorization: `token ${settings.githubToken}`,
  };

  try {
    // Fetch user data
    const userResponse = await fetch(
      `https://api.github.com/users/${settings.githubUsername}`,
      { headers }
    );
    const userData = await userResponse.json();

    // Update stats
    document.getElementById("repositories").textContent = userData.public_repos;

    // Fetch recent activity
    const eventsResponse = await fetch(
      `https://api.github.com/users/${settings.githubUsername}/events/public`,
      { headers }
    );
    const events = await eventsResponse.json();

    // Update activity feed
    const activityHtml = events
      .slice(0, 5)
      .map((event) => {
        const time = new Date(event.created_at).toLocaleDateString();
        let text = "";

        switch (event.type) {
          case "PushEvent":
            text = `Pushed to ${event.repo.name}`;
            break;
          case "CreateEvent":
            text = `Created ${event.payload.ref_type} in ${event.repo.name}`;
            break;
          case "IssuesEvent":
            text = `${event.payload.action} issue in ${event.repo.name}`;
            break;
          default:
            text = `${event.type} in ${event.repo.name}`;
        }

        return `
                    <div class="activity-item">
                        <span class="activity-time">${time}</span>
                        <span class="activity-text">${text}</span>
                    </div>
                `;
      })
      .join("");

    document.getElementById("recentActivity").innerHTML = activityHtml;
  } catch (error) {
    console.error("GitHub error:", error);
  }
}

function refreshGitHub() {
  fetchGitHubActivity();
}

// Code Snippet Widget
const snippets = [
  {
    code: `// JavaScript Promise Example
const fetchData = async () => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};`,
    language: "javascript",
  },
  {
    code: `# Python List Comprehension
numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers if n % 2 == 0]
print(squares)  # Output: [4, 16]`,
    language: "python",
  },
  {
    code: `// React Functional Component
const Welcome = ({ name }) => {
    return (
        <div className="welcome">
            <h1>Hello, {name}!</h1>
        </div>
    );
};`,
    language: "jsx",
  },
];

async function fetchCodeSnippet() {
  const snippet = snippets[Math.floor(Math.random() * snippets.length)];
  const codeElement = document.getElementById("codeSnippet");
  const languageElement = document.getElementById("snippetLanguage");

  codeElement.textContent = snippet.code;
  codeElement.className = `language-${snippet.language}`;
  languageElement.textContent = snippet.language;
}

function refreshSnippet() {
  fetchCodeSnippet();
}

function copySnippet() {
  const code = document.getElementById("codeSnippet").textContent;
  navigator.clipboard.writeText(code);

  // Show feedback
  const button = document.querySelector(".snippet-controls button");
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> Copied!';
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 2000);
}

function shareSnippet() {
  const code = document.getElementById("codeSnippet").textContent;
  const language = document.getElementById("snippetLanguage").textContent;

  // Create share URL (e.g., to CodePen or GitHub Gist)
  // This is a simplified example
  const url = `https://codepen.io/pen?html=&css=&js=${encodeURIComponent(
    code
  )}`;
  window.open(url, "_blank");
}

// Dev News Widget
let currentNewsSource = "all";

async function fetchDevNews() {
  const newsContent = document.getElementById("newsContent");

  try {
    // This would need to be connected to a news API
    // For example: NewsAPI, Dev.to API, or GitHub Trending API
    const mockNews = [
      {
        title: "New Features in ECMAScript 2024",
        source: "dev",
        url: "#",
      },
      {
        title: "GitHub Introduces New AI Features",
        source: "github",
        url: "#",
      },
      {
        title: "The Future of Web Development",
        source: "dev",
        url: "#",
      },
    ];

    const filteredNews =
      currentNewsSource === "all"
        ? mockNews
        : mockNews.filter((item) => item.source === currentNewsSource);

    const newsHtml = filteredNews
      .map(
        (item) => `
                <div class="news-item">
                    <a href="${item.url}" target="_blank">
                        <h4>${item.title}</h4>
                        <span class="news-source">${item.source}</span>
                    </a>
                </div>
            `
      )
      .join("");

    newsContent.innerHTML = newsHtml;
  } catch (error) {
    console.error("News error:", error);
  }
}

function changeNewsSource(source) {
  currentNewsSource = source;

  // Update active state
  document.querySelectorAll(".news-sources span").forEach((span) => {
    span.classList.toggle("active", span.textContent.toLowerCase() === source);
  });

  fetchDevNews();
}

// System Resources Widget
function updateSystemResources() {
  // Note: Chrome extensions have limited access to system resources
  // This is a mock implementation
  const memoryUsage = document.getElementById("memoryUsage");
  const cpuUsage = document.getElementById("cpuUsage");
  const memoryText = document.getElementById("memoryText");
  const cpuText = document.getElementById("cpuText");
  const networkSpeed = document.getElementById("networkSpeed");

  // Mock data
  const memory = Math.random() * 100;
  const cpu = Math.random() * 100;
  const download = (Math.random() * 100).toFixed(1);
  const upload = (Math.random() * 50).toFixed(1);

  memoryUsage.style.width = `${memory}%`;
  cpuUsage.style.width = `${cpu}%`;
  memoryText.textContent = `${Math.round(memory)}%`;
  cpuText.textContent = `${Math.round(cpu)}%`;
  networkSpeed.textContent = `${download} Mbps ↓ / ${upload} Mbps ↑`;
}

// Todo List Widget
let todos = [];

function addTodo() {
  const input = document.getElementById("todoInput");
  const text = input.value.trim();

  if (text) {
    todos.push({
      id: Date.now(),
      text,
      completed: false,
    });

    input.value = "";
    renderTodos();
    saveTodos();
  }
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );

  renderTodos();
  saveTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  renderTodos();
  saveTodos();
}

function renderTodos() {
  const todoList = document.getElementById("todoList");

  todoList.innerHTML = todos
    .map(
      (todo) => `
            <div class="todo-item ${todo.completed ? "completed" : ""}">
                <input
                    type="checkbox"
                    ${todo.completed ? "checked" : ""}
                    onchange="toggleTodo(${todo.id})"
                />
                <span>${todo.text}</span>
                <button onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
    )
    .join("");
}

function saveTodos() {
  chrome.storage.sync.set({ todos });
}

// Load todos from storage
chrome.storage.sync.get("todos", (data) => {
  if (data.todos) {
    todos = data.todos;
    renderTodos();
  }
});

// Terminal Widget
const terminal = {
  history: [],
  currentIndex: -1,
};

document.getElementById("terminalInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = e.target.value.trim();

    if (input) {
      executeCommand(input);
      terminal.history.push(input);
      terminal.currentIndex = terminal.history.length;
      e.target.value = "";
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (terminal.currentIndex > 0) {
      terminal.currentIndex--;
      e.target.value = terminal.history[terminal.currentIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (terminal.currentIndex < terminal.history.length - 1) {
      terminal.currentIndex++;
      e.target.value = terminal.history[terminal.currentIndex];
    } else {
      terminal.currentIndex = terminal.history.length;
      e.target.value = "";
    }
  }
});

function executeCommand(command) {
  const output = document.getElementById("terminalOutput");
  const response = `$ ${command}\n> Command not found: ${command}\n`;

  output.textContent += response;
  output.scrollTop = output.scrollHeight;
}

// Settings Modal
document.querySelector(".settings-button").addEventListener("click", () => {
  document.getElementById("settingsModal").classList.add("active");
});

document.querySelector(".save-settings").addEventListener("click", () => {
  // Save settings
  settings.githubUsername = document.getElementById("githubUsername").value;
  settings.githubToken = document.getElementById("githubToken").value;

  chrome.storage.sync.set({ settings });
  document.getElementById("settingsModal").classList.remove("active");

  applySettings();
});

// Initialize all widgets
function initializeWidgets() {
  updateWeather();
  fetchGitHubActivity();
  fetchCodeSnippet();
  fetchDevNews();
  setInterval(updateSystemResources, 2000);
  updateSystemResources();
}

// Start the app
document.addEventListener("DOMContentLoaded", initializeWidgets);
