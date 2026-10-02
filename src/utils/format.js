import sha256 from "crypto-js/sha256";

export function formatBusinessDuration(minutes) {
    const minutesPerDay = 480; // 8 hours * 60 minutes
    const days = Math.floor(minutes / minutesPerDay);
    const remainingMinutes = minutes % minutesPerDay;
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;

    let result = "";

    if (days > 0) {
        result += `${days} day${days > 1 ? "s" : ""}`;
    }

    if (hours > 0) {
        if (result) result += " ";
        result += `${hours}h`;
    }

    if (mins > 0) {
        if (result) result += " ";
        result += `${mins}min`;
    }

    // Case: less than a day and no full hours (e.g., 30min)
    if (!result) {
        result = `${mins}min`;
    }

    return result;
}

// Compact duration for buttons: 45 min, 1h, 1h30
export function formatShortDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (!hours) return `${mins} min`;
    if (!mins) return `${hours}h`;
    return `${hours}h${String(mins).padStart(2, "0")}`;
}

// Format seconds to a human-friendly business duration using the existing formatter
export function formatSecondsHuman(seconds) {
    const mins = Math.round(parseInt(seconds || 0, 10) / 60);
    return formatBusinessDuration(mins);
}

// Format a timestamp (YYYY-MM-DD HH:mm:ss) into a local readable string
export function formatDateTime(ts) {
    if (!ts) return "";
    try {
        const d = new Date(ts.replace(" ", "T"));
        return d.toLocaleString();
    } catch {
        return ts;
    }
}

export function getGravatarUrl(email, size = 32) {
    const clean = (email || "").trim().toLowerCase();
    const hash = sha256(clean).toString();
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
