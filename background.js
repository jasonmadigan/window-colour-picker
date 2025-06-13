// Simple theme class
class BasicColourTheme {
    constructor(frame, tab_background_text = '#111') {
        this.frame = frame;
        this.tab_background_text = tab_background_text;
    }

    get browserThemeObject() {
        return {
            colors: {
                frame: this.frame,
                tab_background_text: this.tab_background_text,
            }
        };
    }
}

// Track custom window colours
let customWindowColours = new Map();

// Apply saved colours when windows are created
async function applyColourToWindow(window) {
    // Check if window has a custom colour preference
    const storageData = await browser.storage.local.get(`window_${window.id}_colour`);
    const customColour = storageData[`window_${window.id}_colour`];
    
    if (customColour) {
        // Apply custom colour
        const customTheme = new BasicColourTheme(customColour);
        browser.theme.update(window.id, customTheme.browserThemeObject);
        customWindowColours.set(window.id, customTheme);
    }
    // If no custom colour, window remains with default theme
}

// Clean up when window is closed
async function cleanupWindow(window_id) {
    if (customWindowColours.has(window_id)) {
        customWindowColours.delete(window_id);
        await browser.storage.local.remove(`window_${window_id}_colour`);
    }
}

// Apply saved colours to all existing windows on startup
async function applySavedColours() {
    const windows = await browser.windows.getAll();
    for (const window of windows) {
        await applyColourToWindow(window);
    }
}

// Event listeners
browser.windows.onCreated.addListener(applyColourToWindow);
browser.windows.onRemoved.addListener(cleanupWindow);
browser.runtime.onStartup.addListener(applySavedColours);
browser.runtime.onInstalled.addListener(applySavedColours);

// Handle messages from popup
browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'setWindowColour') {
        const { windowId, colour } = message;
        
        // Apply custom colour
        const customTheme = new BasicColourTheme(colour);
        browser.theme.update(windowId, customTheme.browserThemeObject);
        customWindowColours.set(windowId, customTheme);
        
    } else if (message.action === 'removeWindowColour') {
        const { windowId } = message;
        
        // Reset to default theme
        browser.theme.reset(windowId);
        customWindowColours.delete(windowId);
        await browser.storage.local.remove(`window_${windowId}_colour`);
        
    } else if (message.action === 'resetAllColours') {
        // Clear all custom colours
        const windows = await browser.windows.getAll();
        for (const window of windows) {
            browser.theme.reset(window.id);
        }
        customWindowColours.clear();
        await browser.storage.local.clear();
    }
});