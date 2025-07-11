import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/enhanced-chat.css";
import { Auth0Provider } from '@auth0/auth0-react';

// Check if Auth0 is properly configured
const hasValidAuth0Config = 
  import.meta.env.VITE_AUTH0_DOMAIN && 
  import.meta.env.VITE_AUTH0_DOMAIN !== "dev-sofeia.us.auth0.com" &&
  import.meta.env.VITE_AUTH0_CLIENT_ID && 
  import.meta.env.VITE_AUTH0_CLIENT_ID !== "sofeia-ai-client-id" &&
  !import.meta.env.VITE_AUTH0_DOMAIN.includes('your-auth0-domain');

const root = createRoot(document.getElementById("root")!);

if (hasValidAuth0Config) {
  // Use real Auth0 when properly configured
  root.render(
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN!}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.sofeia.com"
      }}
    >
      <App />
    </Auth0Provider>
  );
} else {
  // Render without Auth0 when not configured
  root.render(<App />);
}
