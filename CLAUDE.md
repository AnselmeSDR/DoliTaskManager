# DoliTaskManager

Chrome extension (MV3) to search Dolibarr tasks and log time, via the custom API `custom/vold/ticket_api.php` (`apiUrl` + `apiKey` in settings).

## Stack

React 19 + Vite 6 + Tailwind 3.4. `npm run build` → `dist/` (load unpacked). `src/config.js` is gitignored (`ATLASSIAN_HOSTNAME`).

## Structure

- `src/popup.jsx` — entry of `index.html`: popup `App` (views `home` / `task` / `settings`, all settings in `chrome.storage.sync`, one state + `save*` per setting), or `Embed` when `?embed=task&ref=KEY`
- `src/Embed.jsx` / `src/JiraTask.jsx` / `src/embed.css` — DoliTaskManager group embedded in the Jira issue right column: searches the Jira key, then shows the task + time logging styled like a native Jira group (`dtm-*` classes on Atlassian `--ds-*` tokens, forwarded by the content script via `dtm:ready` → `dtm:theme`); reports its height via `dtm:resize`
- `src/utils/format.js` — duration/date/Gravatar helpers shared by `Task.jsx` and `JiraTask.jsx`
- `src/content.js` / `src/content.css` — plain JS/CSS statically copied (not bundled) on `https://*.atlassian.net/*`, targeting Jira `data-testid`s (`testIds` in content.js): injects `index.html?embed=task&ref=KEY` iframe (`#dtm-panel`) right after the status block (`jiraPanel`); moves the created/updated footnote dates into badges (`#dtm-dates`) on their own line under the status row and hides the footnote (`jiraDates`, read from the DOM, no API call); reorders the right column with CSS `order` on `visibility-container` children (status, panel, Details, then SLA/Client…) when the panel is enabled (`html.dtm-reorder`); toggles `html.dtm-wide-issue-modal` when `wideIssueModalWidth` (% of the window, 0 = Jira default) is set, via `--dtm-issue-modal-width`
- `src/hooks/api.js` — `useAPIData(endpoint, token)`: `searchTasks`, `getTask`, `getPinnedTasks`, `updateTaskTime`

## Conventions

- Jira is a React SPA: content script polls (URL + re-inserts the panel), targets `data-testid` / `role`, never generated classes
- Extension pages loaded in Jira must be listed in `web_accessible_resources`
- The Dolibarr API sends no CORS headers: `host_permissions` (`https://*.vold.lu/*`) lets the extension bypass CORS; the embedded view fetches through `background.js` (`dtm:fetch`, accepted only from extension pages and for URLs under the configured `apiUrl`)
- Issue key from URL: `?selectedIssue=KEY` (modal) or `/browse/KEY`
