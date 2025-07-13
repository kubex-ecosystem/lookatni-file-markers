/* LookAtni Custom JavaScript */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize custom features
  initAnimations();
  initCodeCopyButtons();
  initStatsCounters();
  initCommandExamples();
});

/**
 * Initialize scroll animations
 */
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, { threshold: 0.1 });

  // Observe all feature cards
  document.querySelectorAll('.grid.cards > div').forEach(card => {
    observer.observe(card);
  });
}

/**
 * Add copy buttons to code blocks
 */
function initCodeCopyButtons() {
  document.querySelectorAll('pre > code').forEach(code => {
    const pre = code.parentElement;
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '📋';
    button.title = 'Copy to clipboard';
    
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(code.textContent).then(() => {
        button.innerHTML = '✅';
        button.title = 'Copied!';
        setTimeout(() => {
          button.innerHTML = '📋';
          button.title = 'Copy to clipboard';
        }, 2000);
      });
    });
    
    pre.style.position = 'relative';
    pre.appendChild(button);
  });
}

/**
 * Animate statistics counters
 */
function initStatsCounters() {
  const counters = document.querySelectorAll('[data-count]');
  
  const animateCounter = (counter) => {
    const target = parseInt(counter.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current).toLocaleString();
    }, 16);
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });
  
  counters.forEach(counter => observer.observe(counter));
}

/**
 * Interactive command examples
 */
function initCommandExamples() {
  const commands = [
    'LookAtni: Generate Markers',
    'LookAtni: Extract Files',
    'LookAtni: Validate Markers',
    'LookAtni: Quick Demo',
    'LookAtni: Visual Markers',
    'LookAtni: Show Statistics'
  ];
  
  document.querySelectorAll('.command-demo').forEach(demo => {
    let index = 0;
    const span = demo.querySelector('.command-text') || demo;
    
    const updateCommand = () => {
      span.style.opacity = '0';
      setTimeout(() => {
        span.textContent = commands[index];
        span.style.opacity = '1';
        index = (index + 1) % commands.length;
      }, 300);
    };
    
    // Start animation
    setInterval(updateCommand, 3000);
  });
}

/**
 * Enhanced search functionality
 */
function enhanceSearch() {
  const searchInput = document.querySelector('[data-md-component="search-query"]');
  if (!searchInput) return;
  
  // Add search suggestions
  const suggestions = [
    'generate markers',
    'extract files',
    'CLI tools',
    'installation',
    'configuration',
    'examples',
    'best practices'
  ];
  
  const suggestionsList = document.createElement('div');
  suggestionsList.className = 'search-suggestions';
  suggestionsList.style.display = 'none';
  
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = suggestion;
    item.addEventListener('click', () => {
      searchInput.value = suggestion;
      searchInput.dispatchEvent(new Event('input'));
      suggestionsList.style.display = 'none';
    });
    suggestionsList.appendChild(item);
  });
  
  searchInput.parentElement.appendChild(suggestionsList);
  
  searchInput.addEventListener('focus', () => {
    if (!searchInput.value) {
      suggestionsList.style.display = 'block';
    }
  });
  
  searchInput.addEventListener('blur', () => {
    setTimeout(() => suggestionsList.style.display = 'none', 200);
  });
}

/**
 * Add version information
 */
function addVersionInfo() {
  const footer = document.querySelector('.md-footer');
  if (footer) {
    const versionInfo = document.createElement('div');
    versionInfo.className = 'version-info';
    versionInfo.innerHTML = `
      <p>📦 LookAtni File Markers v1.0.6 | 
      Built with ❤️ by <a href="https://github.com/rafa-mori">Rafa Mori</a> | 
      <a href="https://github.com/rafa-mori/lookatni-file-markers">View Source</a></p>
    `;
    footer.appendChild(versionInfo);
  }
}

/**
 * Add keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('[data-md-component="search-query"]');
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    // G + H for home
    if (e.key === 'g') {
      const nextKey = new Promise(resolve => {
        document.addEventListener('keydown', (e2) => {
          resolve(e2.key);
        }, { once: true });
      });
      
      nextKey.then(key => {
        if (key === 'h') {
          window.location.href = '/';
        }
      });
    }
  });
}

/**
 * Initialize all features
 */
function init() {
  enhanceSearch();
  addVersionInfo();
  initKeyboardShortcuts();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add CSS for custom elements
const style = document.createElement('style');
style.textContent = `
  .copy-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0,0,0,0.1);
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }
  
  .copy-button:hover {
    background: rgba(0,0,0,0.2);
    transform: scale(1.1);
  }
  
  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--md-default-bg-color);
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: 4px;
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .suggestion-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .suggestion-item:hover {
    background: var(--md-accent-fg-color--transparent);
  }
  
  .version-info {
    text-align: center;
    padding: 1rem;
    font-size: 0.9rem;
    color: var(--md-default-fg-color--light);
    border-top: 1px solid var(--md-default-fg-color--lightest);
  }
  
  .version-info a {
    color: var(--md-accent-fg-color);
    text-decoration: none;
  }
  
  .command-demo {
    transition: opacity 0.3s ease;
  }
`;
document.head.appendChild(style);
