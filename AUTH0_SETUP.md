# Auth0 Setup Instructions for Sofeia AI

## Step 1: Create Auth0 Account
1. Go to [auth0.com](https://auth0.com) and sign up for a free account
2. Complete the onboarding process

## Step 2: Create Application
1. In the Auth0 Dashboard, go to **Applications > Applications**
2. Click **Create Application**
3. Enter name: "Sofeia AI Frontend"
4. Select **Single Page Web Applications**
5. Click **Create**

## Step 3: Configure Application Settings
In your application settings, configure:

### Allowed Callback URLs
```
http://localhost:5000, https://your-replit-app-url.replit.app
```

### Allowed Logout URLs
```
http://localhost:5000, https://your-replit-app-url.replit.app
```

### Allowed Web Origins
```
http://localhost:5000, https://your-replit-app-url.replit.app
```

### Allowed Origins (CORS)
```
http://localhost:5000, https://your-replit-app-url.replit.app
```

## Step 4: Get Your Credentials
1. Note your **Domain** (looks like: `dev-xxxxxxxx.us.auth0.com`)
2. Note your **Client ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

## Step 5: Create API (Optional - for backend protection)
1. Go to **Applications > APIs**
2. Click **Create API**
3. Name: "Sofeia AI Backend API"
4. Identifier: `https://api.sofeia.com`
5. Click **Create**

## Step 6: Update Environment Variables
Update your `.env` file with your actual Auth0 credentials:

```env
# Replace with your actual Auth0 values
VITE_AUTH0_DOMAIN=dev-xxxxxxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-actual-client-id
AUTH0_DOMAIN=dev-xxxxxxxx.us.auth0.com
AUTH0_API_AUDIENCE=https://api.sofeia.com
AUTH0_ALGORITHMS=RS256
```

## Step 7: Restart Application
After updating the environment variables, restart your application to load the new configuration.

The landing page will automatically detect if Auth0 is properly configured and show the authentication buttons accordingly.