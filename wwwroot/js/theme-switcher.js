// "nav-theme-btn" is an anchor element that the user can click to flip Pico CSS's theme between light and dark.
// On top of setting the Pico theme, we want to store their preference.

document.addEventListener('DOMContentLoaded', function() {
    const themeSwitcher = document.getElementById('nav-theme-btn');

    // Set theme to what's been saved, else the default.
    document.documentElement.setAttribute('data-theme', getCurrentTheme());
    
    // Upon theme button click, change theme and save new selection.
    themeSwitcher.addEventListener('click', (event) => {
        event.preventDefault();
        let currentTheme = getCurrentTheme();
        let nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        themeSwitcher.blur();
    });
}, false);

// Return the current theme from local storage or default to dark if not set.
function getCurrentTheme() {
    const default_theme ='dark';
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === 'undefined')
    { 
        savedTheme = default_theme;
        localStorage.setItem('theme', savedTheme);
    }
    return savedTheme;
}
