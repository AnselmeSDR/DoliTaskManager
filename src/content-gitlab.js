/* global dtm */
// GitLab integration: DoliTaskManager panel in the merge request right sidebar
(() => {
    const mergeRequestPath = /\/-\/merge_requests\/\d+/;
    // Ticket key carried by the source branch, else by the MR title (after an optional "Draft:")
    // Uppercase keys first: "fix-bug-12" must not win over a real "PHP-491" in the title
    const ticketKeyPatterns = [/[A-Z][A-Z0-9]+-\d+/, /[A-Z][A-Z0-9]+-\d+/i];
    const selectors = {
        sidebar: "aside.right-sidebar",
        firstBlock: ".block.assignee, .block:not(.issuable-sidebar-header)",
        sourceBranch: '[data-testid="source-branch-link"], .js-source-branch',
        title: '[data-testid="title-content"], h1.title',
    };

    const settings = {
        apiKey: "",
        apiUrl: "",
        gitlabPanel: true,
    };

    let cachedKey = { path: null, key: null, didScanScripts: false };

    function getSourceBranch() {
        const branch = document.querySelector(selectors.sourceBranch)?.textContent.trim();
        if (branch) return branch;

        // Fallback: window.gl.mrWidgetData is set by an inline script (scanned once per page)
        if (cachedKey.didScanScripts) return "";
        cachedKey.didScanScripts = true;

        for (const script of document.scripts) {
            const match = script.textContent.match(/"source_branch":"([^"]+)"/);
            if (match) return match[1];
        }
        return "";
    }

    const getTitle = () => document.querySelector(selectors.title)?.textContent.trim() || document.title;

    function getTicketKey() {
        if (!mergeRequestPath.test(location.pathname)) return null;

        if (cachedKey.path !== location.pathname)
            cachedKey = { path: location.pathname, key: null, didScanScripts: false };
        if (cachedKey.key) return cachedKey.key;

        const candidates = [getSourceBranch(), getTitle()];
        const match = ticketKeyPatterns
            .flatMap((pattern) => candidates.map((candidate) => candidate.match(pattern)))
            .find(Boolean);
        cachedKey.key = match ? match[0].toUpperCase() : null;
        return cachedKey.key;
    }

    // First block of the sidebar (above assignees)
    function findInsertionPoint() {
        const firstBlock = document.querySelector(selectors.sidebar)?.querySelector(selectors.firstBlock);
        return firstBlock ? { parent: firstBlock.parentElement, before: firstBlock } : null;
    }

    function syncPanel() {
        const isEnabled = settings.gitlabPanel && settings.apiKey && settings.apiUrl;
        dtm.syncPanel(isEnabled ? getTicketKey() : null, "gitlab", findInsertionPoint);
    }

    // Computed style of a throwaway element: GitLab colors without depending on its CSS variable names
    function probeStyle(tagName, className) {
        const element = document.createElement(tagName);
        element.className = className;
        element.style.cssText = "position: absolute; visibility: hidden; pointer-events: none;";
        document.body.append(element);

        const { color, backgroundColor } = getComputedStyle(element);
        element.remove();
        return { color, backgroundColor };
    }

    const isTransparent = (color) => color === "transparent" || /,\s*0\)$/.test(color);
    const mix = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

    // Maps GitLab look (light/dark) to the --ds-* tokens used by the embedded view
    function getTheme() {
        const sidebar = document.querySelector(selectors.sidebar) ?? document.body;
        const text = getComputedStyle(sidebar).color;
        const background = getComputedStyle(document.body).backgroundColor;
        const link = probeStyle("a", "gl-link").color;
        const confirm = probeStyle("button", "btn btn-confirm gl-button");
        const confirmBackground = isTransparent(confirm.backgroundColor) ? link : confirm.backgroundColor;
        const danger = probeStyle("span", "gl-text-danger").color;

        const tokens = {
            "--ds-text": text,
            "--ds-text-subtle": mix(text, 75),
            "--ds-text-subtlest": mix(text, 60),
            "--ds-icon-subtle": mix(text, 75),
            "--ds-text-inverse": isTransparent(confirm.backgroundColor) ? "#ffffff" : confirm.color,
            "--ds-text-selected": link,
            "--ds-text-danger": danger === text ? "#dd2b0e" : danger,
            "--ds-link": link,
            "--ds-border": mix(text, 15),
            "--ds-border-input": mix(text, 45),
            "--ds-border-focused": link,
            "--ds-border-selected": link,
            "--ds-background-input": background,
            "--ds-background-neutral": mix(text, 8),
            "--ds-background-neutral-hovered": mix(text, 14),
            "--ds-background-neutral-subtle-hovered": mix(text, 6),
            "--ds-background-selected": mix(link, 15),
            "--ds-background-brand-bold": confirmBackground,
            "--ds-background-brand-bold-hovered": confirmBackground,
        };

        return { tokens, fontFamily: getComputedStyle(document.body).fontFamily };
    }

    dtm.watchPanel(getTheme);
    dtm.watchSettings(settings, syncPanel);
    // The sidebar is rendered by Vue and may drop the panel
    dtm.poll(syncPanel);
})();
