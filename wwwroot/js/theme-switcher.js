// "nav-theme-btn" is an anchor element that the user can click to flip Pico CSS's theme between light and dark.
// On top of setting the Pico theme, we want to store their preference.

document.addEventListener('DOMContentLoaded', function() {
    const themeSwitcher = document.getElementById('nav-theme-btn');
    const default_theme ='dark';
    
    // Load saved theme from local storage.
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === 'undefined') { savedTheme = default_theme; }
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSwitcher.value = savedTheme;
    
    // Change theme and save to local storage.
    themeSwitcher.addEventListener('click', (event) => {
        event.preventDefault();
        let currentTheme = localStorage.getItem('theme');
        if (!currentTheme || currentTheme === 'undefined') { currentTheme = default_theme; }
        const nextTheme = getNextTheme(currentTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        themeSwitcher.blur();
    });
}, false);

// Cycle to next theme option.
function getNextTheme(currentTheme) {
    if (currentTheme === 'dark') return 'light';
    else return 'dark';
}
