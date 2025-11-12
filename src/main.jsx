import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "flowbite/dist/flowbite.css";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { createTheme, ThemeProvider } from "flowbite-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const customTheme = createTheme({
  button: {
    color: {
      primary: "bg-[#E6E6FE] hover:bg-[#d9d9ff]",
      secondary: "bg-blue-500 hover:bg-blue-600",
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={customTheme}>
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </Provider>
    </ThemeProvider>
  </StrictMode>,
);
