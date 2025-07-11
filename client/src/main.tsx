import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/enhanced-chat.css";
import { Auth0Provider } from '@auth0/auth0-react';

const root = createRoot(document.getElementById("root")!);
root.render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN || "your-auth0-domain.auth0.com"}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || "your-auth0-client-id"}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://api.sofeia.com"
    }}
  >
    <App />
  </Auth0Provider>
);
