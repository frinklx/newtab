// Configuration
const config = {
  weatherApiKey: "757591bfc4ab3cd2972613b49c0e615d", // Replace with your OpenWeatherMap API key
  githubToken: "ghp_1234567890",
  githubUsername: "frinklx", // Replace with your GitHub username
  newsApiKey: "80db9ff7e3f3448a925031e358148178", // Replace with your NewsAPI key
  refreshInterval: 300000, // 5 minutes
};

// Initialize the extension
async function initializeExtension() {
  updateDateTime();
  await updateWeather();
  await updateGitHubActivity();
  await updateDevNews();
  initializeTerminal();
  initializeTodoList();
  setupEventListeners();

  // Set up refresh intervals
  setInterval(updateDateTime, 1000);
  setInterval(updateWeather, config.refreshInterval);
  setInterval(updateGitHubActivity, config.refreshInterval);
  setInterval(updateDevNews, config.refreshInterval);
}

// Set up event listeners
function setupEventListeners() {
  // Settings button
  const settingsButton = document.querySelector(".settings-button");
  if (settingsButton) {
    settingsButton.addEventListener("click", toggleSettings);
  }

  // News source buttons
  const newsSourcesContainer = document.querySelector(".news-sources");
  if (newsSourcesContainer) {
    newsSourcesContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("source-btn")) {
        changeNewsSource(e.target.dataset.source);
      }
    });
  }

  // Todo list container for event delegation
  const todoContainer = document.querySelector(".todo-widget");
  if (todoContainer) {
    todoContainer.addEventListener("click", handleTodoEvents);
  }

  // Todo input
  const todoInput = document.querySelector(".todo-input");
  if (todoInput) {
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addTodo(e.target.value.trim());
      }
    });
  }
}

// Time and Date
function updateDateTime() {
  const now = new Date();
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const timezoneElement = document.getElementById("timezone");

  timeElement.textContent = now.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
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

// Weather
async function updateWeather() {
  try {
    // Get user's location
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${config.weatherApiKey}&units=metric`
    );

    if (!response.ok) throw new Error("Weather API request failed");

    const data = await response.json();
    const weatherElement = document.querySelector(".weather-widget");

    weatherElement.innerHTML = `
            <i class="fas fa-${getWeatherIcon(data.weather[0].main)}"></i>
            <span>${Math.round(data.main.temp)}°C</span>
            <span>${data.weather[0].main}</span>
        `;
  } catch (error) {
    console.error("Error updating weather:", error);
  }
}

function getWeatherIcon(condition) {
  const icons = {
    Clear: "sun",
    Clouds: "cloud",
    Rain: "cloud-rain",
    Snow: "snowflake",
    Thunderstorm: "bolt",
    Drizzle: "cloud-rain",
    Mist: "smog",
    Smoke: "smog",
    Haze: "smog",
    Dust: "smog",
    Fog: "smog",
    Sand: "smog",
    Ash: "smog",
    Squall: "wind",
    Tornado: "tornado",
  };
  return icons[condition] || "cloud";
}

// GitHub Activity
async function updateGitHubActivity() {
  try {
    const headers = {
      Authorization: `token ${config.githubToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    const [userData, activityData] = await Promise.all([
      fetch(`https://api.github.com/users/${config.githubUsername}`, {
        headers,
      }).then((res) => res.json()),
      fetch(`https://api.github.com/users/${config.githubUsername}/events`, {
        headers,
      }).then((res) => res.json()),
    ]);

    updateGitHubStats(userData);
    updateGitHubActivity(activityData);
  } catch (error) {
    console.error("Error updating GitHub activity:", error);
  }
}

function updateGitHubStats(userData) {
  const statsContainer = document.querySelector(".github-stats");
  if (!statsContainer) return;

  statsContainer.innerHTML = `
            <div class="stat">
                <div class="stat-label">Repositories</div>
                <div class="stat-value">${userData.public_repos}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Followers</div>
                <div class="stat-value">${userData.followers}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Following</div>
                <div class="stat-value">${userData.following}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Gists</div>
                <div class="stat-value">${userData.public_gists}</div>
            </div>
        `;
}

function updateGitHubActivity(activityData) {
  const activityContainer = document.querySelector(".recent-activity");
  if (!activityContainer) return;

  const activityHtml = activityData
    .slice(0, 5)
    .map((event) => {
      const time = new Date(event.created_at).toLocaleString();
      return `
                    <div class="activity-item">
                        <span class="activity-time">${time}</span>
                        ${formatGitHubEvent(event)}
                    </div>
                `;
    })
    .join("");

  activityContainer.innerHTML = activityHtml;
}

function formatGitHubEvent(event) {
  switch (event.type) {
    case "PushEvent":
      return `Pushed to ${event.repo.name}`;
    case "CreateEvent":
      return `Created ${event.payload.ref_type} ${event.repo.name}`;
    case "IssuesEvent":
      return `${event.payload.action} issue in ${event.repo.name}`;
    case "PullRequestEvent":
      return `${event.payload.action} pull request in ${event.repo.name}`;
    default:
      return `Activity in ${event.repo.name}`;
  }
}

// Dev News
async function updateDevNews() {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=hacker-news,techcrunch&apiKey=${config.newsApiKey}`
    );

    if (!response.ok) throw new Error("News API request failed");

    const data = await response.json();
    const newsHtml = data.articles
      .slice(0, 5)
      .map(
        (article) => `
                <div class="news-item">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                    <span class="news-source">${article.source.name}</span>
                </div>
            `
      )
      .join("");

    document.querySelector(".news-grid").innerHTML = newsHtml;
  } catch (error) {
    console.error("Error updating dev news:", error);
  }
}

// Todo List
function initializeTodoList() {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  renderTodos(todos);
}

function handleTodoEvents(e) {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const todoItem = e.target.closest(".todo-item");

  if (!todoItem) return;

  const index = parseInt(todoItem.dataset.index);

  if (e.target.type === "checkbox") {
    todos[index].completed = e.target.checked;
    saveTodos(todos);
  } else if (e.target.closest(".action-btn")) {
    todos.splice(index, 1);
    saveTodos(todos);
  }
}

function addTodo(text) {
  if (!text) return;

  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  todos.push({ text, completed: false });
  saveTodos(todos);

  const todoInput = document.querySelector(".todo-input");
  if (todoInput) {
    todoInput.value = "";
  }
}

function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos(todos);
}

function renderTodos(todos) {
  const todoList = document.querySelector(".todo-list");
  if (!todoList) return;

  todoList.innerHTML = todos
    .map(
      (todo, index) => `
                <div class="todo-item ${
                  todo.completed ? "completed" : ""
                }" data-index="${index}">
                    <input type="checkbox" ${todo.completed ? "checked" : ""} 
                           onchange="toggleTodo(${index})">
                    <span>${todo.text}</span>
                    <button onclick="deleteTodo(${index})" class="action-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
    )
    .join("");
}

// Terminal
function initializeTerminal() {
  const terminal = document.querySelector(".terminal-output");
  const input = document.querySelector(".terminal-input input");

  function addToTerminal(text, isCommand = false) {
    const line = document.createElement("div");
    line.textContent = isCommand ? `$ ${text}` : text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  input.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const command = input.value;
      input.value = "";

      addToTerminal(command, true);

      // Add your command handling logic here
      // For example:
      switch (command.toLowerCase()) {
        case "clear":
          terminal.innerHTML = "";
          break;
        case "help":
          addToTerminal("Available commands: clear, help, time, date");
          break;
        case "time":
          addToTerminal(new Date().toLocaleTimeString());
          break;
        case "date":
          addToTerminal(new Date().toLocaleDateString());
          break;
        default:
          addToTerminal(`Command not found: ${command}`);
      }
    }
  });
}

// Initialize the extension when the page loads
document.addEventListener("DOMContentLoaded", initializeExtension);
