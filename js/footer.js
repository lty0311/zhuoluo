/**
window.onload = function () {
    if (window.location.pathname === '/' || window.location.pathname === '/jsononline' || window.location.pathname === '/jsononline/') {
        if (document.documentElement.classList.contains('format-fullscreen')) {
            // console.log('no ad');
            return;
        }
    }
    setTimeout(() => {
        loadJavaScriptFile('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
    }, 500);
};
 */