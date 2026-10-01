// Copy to src/config.js (gitignored) and set your own hosts
const config = {
    // Jira Cloud site: ticket key detection in the popup, task link in the GitLab panel
    ATLASSIAN_HOSTNAME: 'your-site.atlassian.net',
    // GitLab instance where the merge request panel is injected
    GITLAB_HOSTNAME: 'gitlab.example.com',
    // Match pattern of the Dolibarr API host: lets the extension call it without CORS headers
    API_HOST_PERMISSION: 'https://dolibarr.example.com/*',
};

export default config;
