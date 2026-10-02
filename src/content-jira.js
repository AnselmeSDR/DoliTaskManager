/* global dtm */
// Jira integration: DoliTaskManager panel in the issue right column, dates badges, wider issue modal
(() => {
    const { panelId } = dtm;
    const issueKeyPattern = /^[A-Z][A-Z0-9_]+-\d+$/i;
    // Atlassian design tokens forwarded to the embedded view (see src/embed.css)
    const themeTokens = [
        "--ds-surface",
        "--ds-border",
        "--ds-text",
        "--ds-text-subtle",
        "--ds-text-subtlest",
        "--ds-text-inverse",
        "--ds-text-selected",
        "--ds-text-danger",
        "--ds-icon-subtle",
        "--ds-link",
        "--ds-border-selected",
        "--ds-border-input",
        "--ds-border-focused",
        "--ds-background-input",
        "--ds-background-neutral",
        "--ds-background-neutral-hovered",
        "--ds-background-neutral-subtle-hovered",
        "--ds-background-selected",
        "--ds-background-brand-bold",
        "--ds-background-brand-bold-hovered",
    ];
    // Jira issue view elements (data-testid)
    const testIds = {
        statusBlock: "ref-spotlight-target-status-and-approval-spotlight",
        statusField: "issue.views.issue-base.foundation.status.status-field-wrapper",
        footnote: "issue.views.issue-details.issue-layout.sections.footnote",
        createdDate: "created-date.ui.read.meta-date",
        updatedDate: "updated-date.ui.read.meta-date",
    };
    const datesId = "dtm-dates";
    const calendarIcon =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M5 1a.75.75 0 0 1 .75.75V2h4.5v-.25a.75.75 0 0 1 1.5 0V2h.5A2.25 2.25 0 0 1 14.5 4.25v8A2.25 2.25 0 0 1 12.25 14.5h-8.5A2.25 2.25 0 0 1 1.5 12.25v-8A2.25 2.25 0 0 1 3.75 2h.5v-.25A.75.75 0 0 1 5 1ZM3 6.5v5.75c0 .41.34.75.75.75h8.5c.41 0 .75-.34.75-.75V6.5H3Z"/></svg>';
    const clockIcon =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3Zm0 1.5a.75.75 0 0 1 .75.75v2.44l1.53 1.53a.75.75 0 1 1-1.06 1.06L7.47 8.53A.75.75 0 0 1 7.25 8V5.25A.75.75 0 0 1 8 4.5Z"/></svg>';

    const rightColumnSelectors = ['[data-testid="issue.views.issue-details.issue-layout.container-right"]'];

    const settings = {
        apiKey: "",
        apiUrl: "",
        jiraPanel: true,
        jiraDates: true,
        wideIssueModalWidth: 0, // % of the window, 0 = Jira default width
    };

    function getIssueKey() {
        const selectedIssue = new URLSearchParams(location.search).get("selectedIssue");
        if (selectedIssue && issueKeyPattern.test(selectedIssue)) return selectedIssue.toUpperCase();

        const match = location.pathname.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/i);
        return match ? match[1].toUpperCase() : null;
    }

    // Prefer the issue opened in modal over the page behind it
    function findRightColumn() {
        for (const selector of rightColumnSelectors) {
            const element =
                document.querySelector(`section[role="dialog"] ${selector}`) ?? document.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    // The right column container lays out its children in a row: descend to the actual vertical column
    function findColumnContent(container) {
        let element = container;

        while (element) {
            const style = getComputedStyle(element);
            const isRow =
                (style.display.includes("flex") && style.flexDirection.startsWith("row")) ||
                style.display.includes("grid");
            if (!isRow) return element;

            const children = [...element.children].filter((child) => child.id !== panelId);
            element = children.reduce(
                (widest, child) => (child.offsetWidth > (widest?.offsetWidth ?? -1) ? child : widest),
                null,
            );
        }

        return container;
    }

    const byTestId = (root, testId) => root.querySelector(`[data-testid="${testId}"]`);

    const nextSibling = (element) => {
        let next = element.nextElementSibling;
        while (next?.id === panelId) next = next.nextElementSibling;
        return next;
    };

    // Right after the status block (display order is then fixed in CSS, see content-jira.css)
    function findInsertionPoint(column) {
        const statusBlock = byTestId(column, testIds.statusBlock);
        if (statusBlock) return { parent: statusBlock.parentElement, before: nextSibling(statusBlock) };

        const content = findColumnContent(column);
        return { parent: content, before: [...content.children].find((child) => child.id !== panelId) ?? null };
    }

    function syncPanel() {
        const isEnabled = settings.jiraPanel && settings.apiKey && settings.apiUrl;

        dtm.syncPanel(isEnabled ? getIssueKey() : null, "jira", () => {
            const rightColumn = findRightColumn();
            return rightColumn ? findInsertionPoint(rightColumn) : null;
        });
    }

    function createDateBadge(icon, label, value, title) {
        const badge = document.createElement("span");
        badge.className = "dtm-date";
        badge.title = title;
        badge.innerHTML = icon;

        const text = document.createElement("span");
        const strong = document.createElement("strong");
        text.textContent = `${label} `;
        strong.textContent = value;
        text.append(strong);
        badge.append(text);
        return badge;
    }

    // Jira meta date: <small>Création <span>25 mars 2026 à 10:56</span></small>
    function readMetaDate(element) {
        const value = element?.querySelector("span")?.textContent.trim();
        if (!value) return null;

        const label = element.querySelector("small")?.firstChild?.nodeValue?.trim() ?? "";
        return { label, value, day: value.split(/ à | at /)[0] };
    }

    // Moves Jira created/updated dates (bottom footnote) under the status row, no extra API call
    function syncDates() {
        const column = getIssueKey() ? findRightColumn() : null;
        const footnote = column ? byTestId(column, testIds.footnote) : null;
        const statusField = column ? byTestId(column, testIds.statusField) : null;
        const dates = document.getElementById(datesId);

        const metaDates =
            footnote && statusField && settings.jiraDates
                ? [
                      [calendarIcon, testIds.createdDate],
                      [clockIcon, testIds.updatedDate],
                  ]
                      .map(([icon, testId]) => ({ icon, ...readMetaDate(byTestId(footnote, testId)) }))
                      .filter((metaDate) => metaDate.value)
                : [];

        if (!metaDates.length) {
            dates?.remove();
            footnote?.classList.remove("dtm-hidden");
            return;
        }

        footnote.classList.add("dtm-hidden");

        // Own line under the whole status row (status, Agents, actions…)
        const statusRow = statusField.parentElement;

        const signature = metaDates.map(({ label, value }) => `${label} ${value}`).join("|");
        if (dates?.previousElementSibling === statusRow && dates.dataset.signature === signature) return;

        dates?.remove();
        const element = document.createElement("div");
        element.id = datesId;
        element.dataset.signature = signature;
        element.append(
            ...metaDates.map(({ icon, label, value, day }) => createDateBadge(icon, label, day, `${label} ${value}`)),
        );
        statusRow.after(element);
    }

    function applySettings() {
        const root = document.documentElement;
        root.classList.toggle("dtm-wide-issue-modal", settings.wideIssueModalWidth > 0);
        root.style.setProperty("--dtm-issue-modal-width", `${settings.wideIssueModalWidth}vw`);
        root.classList.toggle("dtm-reorder", Boolean(settings.jiraPanel && settings.apiKey && settings.apiUrl));
        syncPanel();
        syncDates();
    }

    // Atlassian design tokens of the active theme
    function getTheme() {
        const rootStyle = getComputedStyle(document.documentElement);
        const tokens = {};
        for (const name of themeTokens) {
            const value = rootStyle.getPropertyValue(name).trim();
            if (value) tokens[name] = value;
        }

        return { tokens, fontFamily: getComputedStyle(document.body).fontFamily };
    }

    dtm.watchPanel(getTheme);
    dtm.watchSettings(settings, applySettings);
    // Jira is a SPA: re-sync on navigation and when React re-renders the column
    dtm.poll(() => {
        syncPanel();
        syncDates();
    });
})();
