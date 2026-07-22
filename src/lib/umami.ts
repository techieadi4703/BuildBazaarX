declare global {
  interface Window {
    umami?: {
      track: (name?: string | object, data?: object) => void;
      identify: (data: object) => void;
    };
  }
}

export function initUmami() {
  if (import.meta.env.DEV) {
    return;
  }

  const src = import.meta.env.VITE_UMAMI_SRC;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const hostUrl = import.meta.env.VITE_UMAMI_HOST_URL;

  if (!src || !websiteId) {
    return;
  }

  if (document.querySelector('script[data-website-id]')) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = src;
  script.setAttribute("data-website-id", websiteId);
  script.setAttribute("data-auto-track", "false");
  
  if (hostUrl) {
    script.setAttribute("data-host-url", hostUrl);
  }

  document.head.appendChild(script);
}

export function trackPageView(url: string) {
  try {
    window.umami?.track((props) => ({ ...props, url }));
  } catch (err) {
    // silently fail
  }
}

export function trackEvent(name: string, data?: object) {
  try {
    window.umami?.track(name, data);
  } catch (err) {
    // silently fail
  }
}

export function identifyUser(data: object) {
  try {
    window.umami?.identify(data);
  } catch (err) {
    // silently fail
  }
}
