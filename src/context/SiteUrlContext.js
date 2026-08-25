import { createContext, useContext } from "react";

const SiteUrlContext = createContext("");

export function SiteUrlProvider({ value, children }) {
  return <SiteUrlContext.Provider value={value || ""}>{children}</SiteUrlContext.Provider>;
}

export function useSiteUrl() {
  return useContext(SiteUrlContext);
}
