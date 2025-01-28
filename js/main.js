// Time and Date Widget
function updateTime() {
  const now = new Date();
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");

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
}

setInterval(updateTime, 1000);
updateTime();

// Search Functionality
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();

    if (query.startsWith("/")) {
      // Handle developer shortcuts
      handleShortcut(query);
    } else {
      // Default to Google search
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;
    }
  }
});

function handleShortcut(query) {
  const shortcuts = {
    "/mdn": "https://developer.mozilla.org/en-US/search?q=",
    "/gh": "https://github.com/search?q=",
    "/so": "https://stackoverflow.com/search?q=",
    "/npm": "https://www.npmjs.com/search?q=",
  };

  for (const [shortcut, url] of Object.entries(shortcuts)) {
    if (query.startsWith(shortcut + " ")) {
      const searchTerm = query.slice(shortcut.length + 1);
      window.location.href = url + encodeURIComponent(searchTerm);
      return;
    }
  }
}

// GitHub Activity Widget
async function fetchGitHubActivity() {
  const githubContent = document.getElementById("githubContent");
  // Note: This would need to be configured with the user's GitHub username
  // and a personal access token for authentication
  githubContent.innerHTML = `
        <div class="github-activity">
            <p>Configure GitHub integration by adding your username and token in the extension settings.</p>
        </div>
    `;
}

// Code Snippet Widget
async function fetchCodeSnippet() {
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

  const snippet = snippets[Math.floor(Math.random() * snippets.length)];
  const codeElement = document.getElementById("codeSnippet");
  codeElement.textContent = snippet.code;
  codeElement.className = `language-${snippet.language}`;
}

// Dev News Widget
async function fetchDevNews() {
  const newsContent = document.getElementById("newsContent");
  // This would need to be connected to a news API
  newsContent.innerHTML = `
        <div class="news-item">
            <h4>Connect your preferred dev news API</h4>
            <p>Configure news sources in the extension settings.</p>
        </div>
    `;
}

// System Resources Widget
function updateSystemResources() {
  // Note: Chrome extensions have limited access to system resources
  // This is a mock implementation
  const memoryUsage = document.getElementById("memoryUsage");
  const cpuUsage = document.getElementById("cpuUsage");

  // Mock data
  const memory = Math.random() * 100;
  const cpu = Math.random() * 100;

  memoryUsage.style.width = `${memory}%`;
  cpuUsage.style.width = `${cpu}%`;
}

// Initialize all widgets
function initializeWidgets() {
  fetchGitHubActivity();
  fetchCodeSnippet();
  fetchDevNews();
  setInterval(updateSystemResources, 2000);
  updateSystemResources();
}

// Start the app
document.addEventListener("DOMContentLoaded", initializeWidgets);
