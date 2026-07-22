import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/umami";

export function useUmamiPageviews() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
