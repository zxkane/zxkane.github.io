/**
 * Markdown Export Module with Dropdown Menu
 * Copy page or open in AI tools (ChatGPT, Claude)
 */

(function() {
  'use strict';

  const CONFIG = {
    includeFrontMatter: true,
    includeAttribution: true,
    formatStyle: 'llm'
  };

  // AI Tool URL templates
  const AI_TOOLS = {
    claude: {
      base: 'https://claude.ai/new',
      template: (url) => `Read from ${url} so I can ask questions about it.`
    },
    chatgpt: {
      base: 'https://chatgpt.com/',
      template: (url) => `Read from ${url} so I can ask questions about it.`
    }
  };

  /**
   * Track event with Google Analytics
   */
  function trackEvent(action, label) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: 'Copy Page',
        event_label: label || action,
        page_title: document.title,
        page_url: window.location.href
      });
    }
    console.log('[GA Event]', action, label);
  }

  /**
   * Process markdown - convert Hugo shortcodes to actual URLs
   */
  function processMarkdown(markdown) {
    const baseUrl = window.location.origin;

    // Convert relref shortcodes to actual URLs
    // Format: {{< relref "/posts/path/index.md" >}}
    markdown = markdown.replace(/\{\{<\s*relref\s+"([^"]+)"\s*>\}\}/g, function(match, path) {
      // Remove index.md and .md extensions, remove leading slash
      let cleanPath = path.replace(/\/index\.md$/, '').replace(/\.md$/, '').replace(/^\//, '');
      return baseUrl + '/' + cleanPath + '/';
    });

    // Convert ref shortcodes to actual URLs
    // Format: {{< ref "path" >}}
    markdown = markdown.replace(/\{\{<\s*ref\s+"([^"]+)"\s*>\}\}/g, function(match, path) {
      let cleanPath = path.replace(/\/index\.md$/, '').replace(/\.md$/, '').replace(/^\//, '');
      return baseUrl + '/' + cleanPath + '/';
    });

    // Convert figure shortcodes to markdown image syntax
    // Format: {{< figure src="image.png" alt="description" >}}
    markdown = markdown.replace(/\{\{<\s*figure\s+src="([^"]+)"(?:\s+alt="([^"]*)")?\s*>\}\}/g, function(match, src, alt) {
      return '![' + (alt || '') + '](' + src + ')';
    });

    // Remove other common shortcodes that don't translate well
    markdown = markdown.replace(/\{\{<[^>]+>\}\}/g, '');

    return markdown;
  }

  /**
   * Try to fetch original markdown file
   */
  async function fetchOriginalMarkdown(mdUrl) {
    try {
      // Try to fetch the .md file directly
      const response = await fetch(mdUrl);
      if (response.ok) {
        let markdown = await response.text();
        console.log('Successfully fetched original markdown');

        // Process shortcodes to actual URLs
        markdown = processMarkdown(markdown);

        return markdown;
      }
    } catch (error) {
      console.log('Could not fetch original markdown, will convert from HTML');
    }
    return null;
  }

  /**
   * Create Turndown converter (fallback)
   */
  function createMarkdownConverter() {
    if (typeof TurndownService === 'undefined') {
      console.error('Turndown library not loaded');
      return null;
    }

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '_',
      strongDelimiter: '**',
      linkStyle: 'inlined'
    });

    // Custom rule for code blocks
    turndownService.addRule('fencedCodeBlock', {
      filter: function(node, options) {
        return (
          options.codeBlockStyle === 'fenced' &&
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        );
      },
      replacement: function(content, node, options) {
        const className = node.firstChild.className || '';
        const language = className.match(/language-(\w+)/);
        const langStr = language ? language[1] : '';
        const code = node.firstChild.textContent;
        return '\n\n```' + langStr + '\n' + code.replace(/\n$/, '') + '\n```\n\n';
      }
    });

    // Custom rule for tables
    turndownService.addRule('tables', {
      filter: 'table',
      replacement: function(content) {
        return '\n\n' + content + '\n\n';
      }
    });

    return turndownService;
  }

  /**
   * Extract metadata
   */
  function extractMetadata(button) {
    const title = button.dataset.postTitle || document.title;
    const date = button.dataset.postDate || '';
    const url = button.dataset.postUrl || window.location.href;
    const tags = Array.from(document.querySelectorAll('.post_tag, .tag, [rel="tag"]'))
      .map(tag => tag.textContent.trim())
      .filter(tag => tag.length > 0);
    return { title, date, url, tags: tags.length > 0 ? tags : null };
  }

  /**
   * Generate front matter
   */
  function generateFrontMatter(metadata) {
    let fm = '---\n';
    fm += 'SOURCE: ' + metadata.url + '\n';
    fm += 'TITLE: ' + metadata.title + '\n';
    if (metadata.date) fm += 'DATE: ' + metadata.date + '\n';
    if (metadata.tags) fm += 'TAGS: ' + metadata.tags.join(', ') + '\n';
    fm += '---\n\n';
    return fm;
  }

  /**
   * Extract main content from HTML (fallback)
   */
  function extractMainContent() {
    const selectors = ['article.post_content', '.post_body', 'article', 'main'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const cloned = el.cloneNode(true);
        const remove = ['.post_nav', '.share', '.post_copy_markdown', '.post_copy_desktop', '.post_copy_mobile', 'nav', 'footer', 'script', 'style', 'iframe'];
        remove.forEach(s => cloned.querySelectorAll(s).forEach(e => e.remove()));
        return cloned;
      }
    }
    return null;
  }

  /**
   * Format markdown for LLM
   */
  function formatForLLM(markdown, metadata) {
    let result = '';
    if (CONFIG.includeFrontMatter) result += generateFrontMatter(metadata);
    result += '# ' + metadata.title + '\n\n';
    if (CONFIG.includeAttribution) {
      result += '*Original: [' + metadata.url + '](' + metadata.url + ')*\n\n---\n\n';
    }
    result += markdown;
    return result;
  }

  /**
   * Get markdown content - try original file first, fallback to HTML conversion
   */
  async function getMarkdownContent(button) {
    const metadata = extractMetadata(button);
    const mdUrl = button.dataset.postMdUrl || metadata.url;

    // Try to fetch original markdown file first
    const originalMd = await fetchOriginalMarkdown(mdUrl);
    if (originalMd) {
      return formatForLLM(originalMd, metadata);
    }

    // Fallback: convert from HTML
    const content = extractMainContent();
    if (!content) throw new Error('Content not found');

    const converter = createMarkdownConverter();
    if (!converter) throw new Error('Converter unavailable');

    const markdown = converter.turndown(content.innerHTML);
    return formatForLLM(markdown, metadata);
  }

  /**
   * Copy to clipboard
   */
  async function copyToClipboard(text) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-999999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  /**
   * Handle copy markdown action
   */
  async function handleCopyMarkdown(button) {
    try {
      const btnText = button.querySelector('.btn_text');
      const original = btnText.textContent;
      button.disabled = true;

      const markdown = await getMarkdownContent(button);
      await copyToClipboard(markdown);

      button.classList.add('copied');
      btnText.textContent = 'Copied!';

      trackEvent('copy_markdown', 'Copy as Markdown');

      setTimeout(() => {
        button.classList.remove('copied');
        btnText.textContent = original;
        button.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Copy failed:', error);
      const btnText = button.querySelector('.btn_text');
      btnText.textContent = 'Failed';
      setTimeout(() => {
        btnText.textContent = 'Copy Page';
        button.disabled = false;
      }, 2000);
    }
  }

  /**
   * Handle open in AI tool
   */
  async function handleOpenInAI(tool, button) {
    try {
      const mdUrl = button.dataset.postMdUrl || button.dataset.postUrl || window.location.href;

      // Build AI tool URL with page reference
      const toolConfig = AI_TOOLS[tool];
      const prompt = toolConfig.template(mdUrl);
      const separator = toolConfig.base.includes('?') ? '&' : '?';
      const url = toolConfig.base + separator + 'q=' + encodeURIComponent(prompt);

      // Track event
      trackEvent('open_in_' + tool, 'Open in ' + tool.charAt(0).toUpperCase() + tool.slice(1));

      // Open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error('Open in ' + tool + ' failed:', error);
    }
  }

  /**
   * Toggle dropdown
   */
  function toggleDropdown(dropdown) {
    const isOpen = dropdown.classList.contains('open');

    // Close all dropdowns
    document.querySelectorAll('.copy_dropdown').forEach(d => {
      d.classList.remove('open');
      const btn = d.querySelector('.btn_copy_toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });

    // Toggle current dropdown
    if (!isOpen) {
      dropdown.classList.add('open');
      const btn = dropdown.querySelector('.btn_copy_toggle');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      trackEvent('dropdown_opened', 'Open dropdown menu');
    }
  }

  /**
   * Close dropdown when clicking outside
   */
  function setupClickOutside() {
    document.addEventListener('click', function(e) {
      const dropdown = e.target.closest('.copy_dropdown');
      if (!dropdown) {
        document.querySelectorAll('.copy_dropdown.open').forEach(d => {
          d.classList.remove('open');
          const btn = d.querySelector('.btn_copy_toggle');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /**
   * Initialize
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Setup main copy button (direct copy)
    document.querySelectorAll('.btn_copy_action').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        await handleCopyMarkdown(this);
      });
    });

    // Setup dropdown toggle button (open menu)
    document.querySelectorAll('.btn_copy_toggle').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = this.closest('.copy_dropdown');
        toggleDropdown(dropdown);
      });
    });

    // Setup dropdown menu items
    document.querySelectorAll('.copy_dropdown_item').forEach(item => {
      item.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();

        const action = this.dataset.action;
        const dropdown = this.closest('.copy_dropdown');
        const copyButton = dropdown.querySelector('.btn_copy_action');
        const toggleButton = dropdown.querySelector('.btn_copy_toggle');

        // Close dropdown
        dropdown.classList.remove('open');
        if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');

        // Handle action
        if (action === 'copy-markdown') {
          await handleCopyMarkdown(copyButton);
        } else if (action === 'open-claude' || action === 'open-chatgpt') {
          await handleOpenInAI(action.replace('open-', ''), copyButton);
        }
      });
    });

    // Setup click outside handler
    setupClickOutside();

    // Setup keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.copy_dropdown.open').forEach(d => {
          d.classList.remove('open');
          const btn = d.querySelector('.btn_copy_toggle');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    console.log('Markdown export with dropdown initialized');
  }

  init();
})();
