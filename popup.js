let selectedWindowId = null;

// Load current windows
async function loadWindows() {
    const windowList = document.getElementById('windowList');
    windowList.innerHTML = '<div style="padding: 10px; color: #333;">Loading windows...</div>';
    
    try {
        // Get the current window ID
        const currentWindow = await browser.windows.getCurrent();
        const currentWindowId = currentWindow.id;
        
        const windows = await browser.windows.getAll();
        windowList.innerHTML = '';
        
        // If no windows found, show a message
        if (windows.length === 0) {
            windowList.innerHTML = '<div style="padding: 10px; text-align: center; color: #666;">No windows found</div>';
            return;
        }
        
        // Auto-select the current window
        selectedWindowId = currentWindowId;
        
        for (const window of windows) {
            const tabs = await browser.tabs.query({ windowId: window.id });
            const activeTab = tabs.find(tab => tab.active);
            
            const windowItem = document.createElement('div');
            windowItem.className = 'window-item' + (window.id === currentWindowId ? ' current-window selected' : '');
            windowItem.dataset.windowId = window.id;
            
            // Get current colour for this window from storage
            const colourData = await browser.storage.local.get(`window_${window.id}_colour`);
            const currentColour = colourData[`window_${window.id}_colour`];
            
            const title = activeTab ? activeTab.title : ('Window ' + window.id);
            const tabText = tabs.length + ' tab' + (tabs.length !== 1 ? 's' : '');
            const isCurrentWindow = window.id === currentWindowId;
            
            windowItem.innerHTML = '<div class="window-info">' +
                '<span class="window-title">' + title + '</span>' +
                '<span class="tab-count">' + tabText + 
                (isCurrentWindow ? ' • This window' : '') + '</span>' +
                '</div>';
            
            if (currentColour) {
                windowItem.innerHTML += '<div class="current-colour" style="background-color: ' + currentColour + '"></div>';
            } else {
                windowItem.innerHTML += '<div class="current-colour default">Default</div>';
            }
            
            windowItem.addEventListener('click', () => selectWindow(window.id));
            windowList.appendChild(windowItem);
        }
    } catch (error) {
        const windowList = document.getElementById('windowList');
        windowList.innerHTML = `<div style="padding: 10px; color: red;">Error loading windows: ${error.message}</div>`;
    }
}

// Select a window
function selectWindow(windowId) {
    selectedWindowId = windowId;
    
    // Update UI to show selected window
    document.querySelectorAll('.window-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-window-id="${windowId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // Don't focus the window - this causes the popup to close
    // Users can still identify which window by its title
}

// Validate hex colour
function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/i.test(hex);
}

// Apply colour to selected window
async function applyColour(colour) {
    if (!selectedWindowId) {
        showError('Please select a window first!');
        return;
    }
    
    if (!isValidHex(colour)) {
        showError('Invalid colour format! Use #RRGGBB');
        return;
    }
    
    // Send message to background script to apply the colour
    await browser.runtime.sendMessage({
        action: 'setWindowColour',
        windowId: selectedWindowId,
        colour: colour
    });
    
    // Save the custom colour preference
    await browser.storage.local.set({
        [`window_${selectedWindowId}_colour`]: colour
    });
    
    // Reload the window list to show the new colour
    loadWindows();
}

// Remove colour from selected window
async function removeColour() {
    if (!selectedWindowId) {
        showError('Please select a window first!');
        return;
    }
    
    // Send message to background script to remove the colour
    await browser.runtime.sendMessage({
        action: 'removeWindowColour',
        windowId: selectedWindowId
    });
    
    // Reload the window list
    loadWindows();
}

// Reset all colours
async function resetAllColours() {
    if (confirm('Remove all custom colours from all windows?')) {
        // Send message to background script to reset all colours
        await browser.runtime.sendMessage({
            action: 'resetAllColours'
        });
        
        // Reload the window list
        loadWindows();
    }
}

// Show error message
function showError(message) {
    const instructions = document.querySelector('.instructions');
    instructions.style.color = '#f44336';
    instructions.textContent = message;
    setTimeout(() => {
        instructions.style.color = '';
        instructions.textContent = 'Select a window, then choose a colour';
    }, 2000);
}

// Update colour preview
function updateColourPreview(hex) {
    const preview = document.getElementById('colourPreview');
    if (isValidHex(hex)) {
        preview.style.backgroundColor = hex;
        preview.style.borderColor = '#4285f4';
    } else {
        preview.style.backgroundColor = '#f0f0f0';
        preview.style.borderColor = '#ddd';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadWindows();
    
    // Initialize colour preview with default value
    const hexInput = document.getElementById('hexInput');
    updateColourPreview(hexInput.value);
    
    // Preset colour buttons
    document.querySelectorAll('.colour-button').forEach(button => {
        button.addEventListener('click', () => {
            const colour = button.dataset.colour;
            applyColour(colour);
        });
    });
    
    // HEX input field - already declared above
    const applyButton = document.getElementById('applyHexColour');
    
    hexInput.addEventListener('input', (e) => {
        updateColourPreview(e.target.value);
    });
    
    hexInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyColour(hexInput.value);
        }
    });
    
    applyButton.addEventListener('click', () => {
        applyColour(hexInput.value);
    });
    
    // Remove colour button
    document.getElementById('removeColour').addEventListener('click', removeColour);
    
    // Reset all button
    document.getElementById('resetAllColours').addEventListener('click', resetAllColours);
});

// Reload windows when popup is opened
browser.windows.onCreated.addListener(loadWindows);
browser.windows.onRemoved.addListener(loadWindows);