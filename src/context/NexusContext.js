import { createContext, useContext, useState } from "react";

const NexusContext = createContext(null);

export function NexusProvider({ children }) {
  const [clientId, setClientId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionValue, setPermissionValue] = useState("0");
  const [scopes, setScopes] = useState(["bot"]);
  const [redirectUri, setRedirectUri] = useState("");
  const [requireCodeGrant, setRequireCodeGrant] = useState(false);
  const [applicationInfo, setApplicationInfo] = useState(null);

  return (
    <NexusContext.Provider
      value={{
        clientId,
        setClientId,
        selectedPermissions,
        setSelectedPermissions,
        permissionValue,
        setPermissionValue,
        scopes,
        setScopes,
        redirectUri,
        setRedirectUri,
        requireCodeGrant,
        setRequireCodeGrant,
        applicationInfo,
        setApplicationInfo,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used within NexusProvider");
  return ctx;
}
