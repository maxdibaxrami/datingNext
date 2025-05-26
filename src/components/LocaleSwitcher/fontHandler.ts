// Function to load font based on the current language or direction
export const FontHandller = () => {
    const lang = document.documentElement.lang || 'en'; // Get language, default to English
    console.log("change aaaaa")
    // Preconnect to Google Fonts and Google Static Content for faster font loading
    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnectGoogle);
  
    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.setAttribute('crossorigin', '');
    document.head.appendChild(preconnectGstatic);
  
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.type = 'text/css';
  
    // Load fonts based on language
    switch (lang) {
      case 'fa': // Farsi
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap'; // Farsi font
        break;
      case 'ar': // Arabic
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap'; // Arabic font
        break;
      case 'ru': // Russian
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Vazirmatn:wght@100..900&display=swap'; // Russian font (Roboto Condensed + Vazirmatn for Cyrillic)
        break;
      default: // English (default case)
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Parkinsans:wght@300..800&family=Signika+Negative:wght@300..700&display=swap'; // English font
    }
  
    // Append the font link to the document head
    document.head.appendChild(fontLink);
  
    // Apply the font to the body based on language with !important to override the global styles
    if (lang === 'fa' || lang === 'ar') {
      document.documentElement.style.setProperty('font-family', 'Vazirmatn, sans-serif', 'important');
    } else if (lang === 'ru') {
      document.documentElement.style.setProperty('font-family', 'Roboto Condensed, Vazirmatn, sans-serif', 'important');
    } else {
      document.documentElement.style.setProperty('font-family', 'Parkinsans, Signika Negative, sans-serif', 'important');
    }
    
  }