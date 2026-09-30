// Copy to src/config.js (gitignored) and set your own hosts
const config = {
    // Jira Cloud site: ticket key detection in the popup
    ATLASSIAN_HOSTNAME: 'your-site.atlassian.net',
    // Match pattern of the Dolibarr API host: lets the extension call it without CORS headers
    API_HOST_PERMISSION: 'https://dolibarr.example.com/*',
};

export default config;
