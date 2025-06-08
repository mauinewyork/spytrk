// Vercel Analytics for vanilla JavaScript
// This will be automatically replaced by Vercel in production
(function() {
    if (typeof window !== 'undefined') {
        // Create placeholders for analytics functions
        // Vercel will inject the actual scripts in production
        window.va = window.va || function () { 
            (window.vaq = window.vaq || []).push(arguments); 
        };
        
        window.si = window.si || function () { 
            (window.siq = window.siq || []).push(arguments); 
        };
        
        // In development, log analytics calls
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics disabled in development');
        }
    }
})();