# Claritel - React + Vite + Clerk Authentication

A modern React application with Clerk authentication, unified auth page, and a beautiful dashboard interface.

## Features

- 🔐 **Unified Authentication** - Single page for both Sign In and Sign Up with Clerk
- 🛣️ **Routing** - React Router with protected routes
- 🎨 **Modern UI** - Tailwind CSS for beautiful, responsive design
- ⚡ **Fast Development** - Vite for instant HMR
- 🔒 **Protected Routes** - Secure dashboard and pages

## Tech Stack

- **React 19** - Latest React version
- **Vite** - Next generation frontend tooling
- **Clerk** - Complete user management and authentication
- **React Router** - Declarative routing for React
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Clerk account (free at [clerk.com](https://clerk.com))

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up Clerk**

   a. Go to [Clerk Dashboard](https://dashboard.clerk.com)

   b. Create a new application or use an existing one

   c. Navigate to **Developers → API Keys**

   d. Copy your **Publishable Key**

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

   Replace `pk_test_your_publishable_key_here` with your actual Clerk Publishable Key.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

## Project Structure

```
Claritel/
├── src/
│   ├── components/        # React components
│   │   ├── Assistants/
│   │   ├── Campaigns/
│   │   ├── Customers/
│   │   └── Dashboard/
│   ├── pages/            # Page components
│   │   ├── Auth.jsx      # Unified auth page (sign in/up)
│   │   ├── Login.jsx     # Login redirect handler
│   │   └── DashBoard.jsx # Protected dashboard
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── App.jsx           # Main app with routing
│   └── main.jsx          # App entry point with Clerk provider
├── public/               # Static assets
└── .env                  # Environment variables (create this)
```

## Available Routes

- `/` - Landing/Login redirect page
- `/auth` - Unified authentication page (toggle between sign in and sign up)
- `/dashboard` - Protected dashboard (requires authentication)

## Authentication Flow

The app uses a unified authentication page where users can:

- Toggle between Sign In and Sign Up modes
- Use the same page for all authentication needs
- Get automatically redirected to the dashboard after authentication

## Protected Routes

The dashboard and other authenticated pages are protected using Clerk's authentication. Users must sign in to access these routes. Unauthenticated users are automatically redirected to the auth page.

## Customization

### Styling the Clerk Components

You can customize Clerk's appearance in the Auth page by modifying the `appearance` prop:

```jsx
<SignIn
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-xl",
      // Add more customization here
    },
  }}
/>
```

### Adding More Routes

To add new protected routes, add them in `src/App.jsx`:

```jsx
<Route
  path="/your-route"
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Clerk Configuration

### Required Settings in Clerk Dashboard

1. **Allowed Redirect URLs**
   - Add your development URL: `http://localhost:5173`
   - Add your production URL when deploying

2. **After sign-in/sign-up URLs**
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`
   - After sign-out URL: `/auth`

## Troubleshooting

### "Missing Publishable Key" Error

Make sure you have:

1. Created a `.env` file in the root directory
2. Added `VITE_CLERK_PUBLISHABLE_KEY` with your Clerk key
3. Restarted the dev server after creating the `.env` file

### Redirect Issues

Check that your Clerk dashboard has the correct URLs configured for your environment.

## License

This project is open source and available under the MIT License.
