# Secure Authentication Implementation with Auth0

This document provides code examples for implementing secure authentication using Auth0, replacing Replit's default authentication. This solution will address the login errors on your homepage and provide a robust, industry-standard authentication system.

We will cover both the frontend (React) and backend (Flask) integration.

## 1. Auth0 Setup (Outside of Code)

Before implementing the code, you need to set up an Auth0 account and application:

1.  **Sign up for Auth0:** Go to [Auth0.com](https://auth0.com/) and sign up for a free account.
2.  **Create a new Application:**
    *   Navigate to Applications > Applications in your Auth0 dashboard.
    *   Click "Create Application".
    *   Choose "Single Page Web Applications" (for React frontend).
    *   Give your application a name (e.g., "Sofeia AI Frontend").
3.  **Configure Application Settings:**
    *   **Allowed Callback URLs:** Add `http://localhost:3000` (for local development) and your Replit app URL (e.g., `https://sofeia-interactive-otteyfrancisca.replit.app/`).
    *   **Allowed Logout URLs:** Add the same URLs as above.
    *   **Allowed Web Origins:** Add the same URLs as above.
    *   **Allowed Origins (CORS):** Add the same URLs as above.
    *   Note down your **Domain** and **Client ID**. You will need these for your frontend code.
4.  **Create a new API:**
    *   Navigate to Applications > APIs in your Auth0 dashboard.
    *   Click "Create API".
    *   Give it a name (e.g., "Sofeia AI Backend API").
    *   Set an **Audience** (a unique identifier for your API, e.g., `https://api.sofeia.com`). Note this down.
    *   Note down your **Domain** (same as application domain) and **Audience**. You will need these for your backend code.

## 2. Frontend (React) Implementation

This section provides the necessary code for your React frontend to integrate with Auth0 for user authentication.

### 2.1 Install Auth0 React SDK

First, navigate to your React project directory in Replit's shell and install the Auth0 React SDK:

```bash
npm install @auth0/auth0-react
# or
yarn add @auth0/auth0-react
```

### 2.2 Wrap your Application with Auth0Provider

In your `src/index.js` (or equivalent entry file), wrap your main `App` component with `Auth0Provider`. Replace `YOUR_AUTH0_DOMAIN` and `YOUR_AUTH0_CLIENT_ID` with the values from your Auth0 Application settings.

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.sofeia.com" // Replace with your Auth0 API Audience
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
```

### 2.3 Create Login and Logout Buttons

Now, in your `src/App.js` (or the component where your login buttons are), use the `useAuth0` hook to access authentication state and methods.

```javascript
// src/App.js (or your main component)
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();

  // Example of how to get an access token for your backend API
  const callProtectedApi = async () => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://api.sofeia.com", // Your Auth0 API Audience
        },
      });
      console.log("Access Token:", accessToken);
      // Now you can use this accessToken to make authenticated calls to your Flask backend
      // Example: fetch('/api/protected', { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch (error) {
      console.error("Error getting access token:", error);
    }
  };

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div>
      <h1>Welcome to Sofeia AI</h1>
      {!isAuthenticated && (
        <button onClick={() => loginWithRedirect()}>Login / Sign Up</button>
      )}
      {isAuthenticated && (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
          <button onClick={callProtectedApi}>Call Protected API</button>
        </>
      )}
      {/* Your existing Sofeia AI content and chat interface goes here */}
    </div>
  );
}

export default App;
```

### 2.4 Update Homepage Buttons

Replace your existing login buttons on the homepage (`Login`, `Try Demo`, `Login to Start Writing`, `Try Demo (No Login)`) with the new Auth0-powered buttons. The `Try Demo (No Login)` button can still navigate directly to the chat page, but for actual login, use the `loginWithRedirect` function.

## 3. Backend (Flask) Implementation

This section provides the necessary code for your Flask backend to validate tokens issued by Auth0 and protect your API endpoints.

### 3.1 Install Dependencies

Add these to your `requirements.txt` and install them:

```
python-dotenv
Auth0-Python
PyJWT
```

Then run:

```bash
pip install -r requirements.txt
```

### 3.2 Environment Variables

Create a `.env` file in your Flask project root (or set these as Replit secrets) with your Auth0 API details:

```
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
AUTH0_API_AUDIENCE=https://api.sofeia.com
AUTH0_ALGORITHMS=RS256
```

### 3.3 Create a JWT Validation Decorator

This decorator will verify the JWT sent from your frontend.

```python
# utils/auth_decorator.py (create this new file)

from functools import wraps
from flask import request, jsonify
from jose import jwt
from jose.exceptions import JWTError
import json
from urllib.request import urlopen
import os

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
ALGORITHMS = [os.getenv("AUTH0_ALGORITHMS")]

class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

def get_token_auth_header():
    """Obtains the Access Token from the Authorization Header
    """
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise AuthError({
            "code": "authorization_header_missing",
            "description": "Authorization header is expected"
        }, 401)

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthError({
            "code": "invalid_header",
            "description": "Authorization header must start with Bearer"
        }, 401)

    elif len(parts) == 1:
        raise AuthError({
            "code": "invalid_header",
            "description": "Token not found"
        }, 401)

    elif len(parts) > 2:
        raise AuthError({
            "code": "invalid_header",
            "description": "Authorization header must be Bearer token"
        }, 401)

    token = parts[1]
    return token

def requires_auth(f):
    """Determines if the Access Token is valid
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    audience=API_AUDIENCE,
                    issuer=f"https://{AUTH0_DOMAIN}/"
                )
            except JWTError as e:
                raise AuthError({
                    "code": "invalid_token",
                    "description": str(e)
                }, 401)
            except Exception as e:
                raise AuthError({
                    "code": "invalid_header",
                    "description": "Unable to parse authentication token."
                }, 400)
            
            # You can access user info from payload if needed
            # g.user_id = payload.get('sub') 
            
            return f(*args, **kwargs)
        raise AuthError({
            "code": "invalid_header",
            "description": "Unable to find appropriate key"
        }, 400)
    return decorated

```

### 3.4 Protect Flask Endpoints

In your `main.py` (or wherever your Flask routes are defined), import the decorator and apply it to any endpoint you want to protect.

```python
# main.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the authentication decorator
from utils.auth_decorator import requires_auth, AuthError

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super-secret-default-key") # Use a strong secret key
CORS(app) # Enable CORS for all origins for now, restrict in production

# Error handler for AuthError
@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

# Example protected endpoint
@app.route("/api/protected", methods=["GET"])
@requires_auth
def protected_route():
    return jsonify({"message": "This is a protected resource! You are authenticated."})

# Your existing chat routes (from previous code_implementations.md) can also be protected
# For example:
@app.route("/api/chat", methods=["POST"])
@requires_auth # Add this decorator to protect your chat endpoint
def chat():
    # Your existing chat logic here
    data = request.get_json()
    message = data.get("message", "").strip()
    # ... rest of your chat logic ...
    return jsonify({"response": f"AI received: {message}"})

# ... (rest of your Flask app code)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## 4. Integration Steps

1.  **Auth0 Setup:** Complete the Auth0 account and application/API setup as described in Section 1.
2.  **Frontend Updates:**
    *   Install `@auth0/auth0-react` in your React project.
    *   Update `src/index.js` to wrap your `App` with `Auth0Provider`.
    *   Modify your homepage/login components (`src/App.js` or similar) to use `loginWithRedirect` and `logout` from `useAuth0`.
    *   Ensure your `redirect_uri` and `audience` in `Auth0Provider` match your Auth0 settings.
3.  **Backend Updates:**
    *   Install the Python dependencies (`python-dotenv`, `Auth0-Python`, `PyJWT`).
    *   Create the `utils/auth_decorator.py` file with the provided code.
    *   Update your `main.py` to load environment variables, include the error handler, and apply the `@requires_auth` decorator to your protected API endpoints (like `/api/chat`).
    *   Set your Auth0 environment variables (Domain, Audience, Algorithms) in Replit secrets or a `.env` file.

This setup will redirect users to Auth0 for login/signup, and upon successful authentication, they will be redirected back to your application with a valid JWT. Your backend can then verify this JWT to ensure only authenticated users can access protected resources like your chat API.

