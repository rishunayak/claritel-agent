import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import DashBoard from "./pages/DashBoard";
import DashboardPage from "./pages/DashboardPage";
import AssistantsPage from "./pages/AssistantsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CreateAssistant from "./pages/CreateAssistant";
import CompaniesPage from "./pages/CompaniesPage";
import CreateCampaign from "./pages/CreateCampaign";
import CompanyAssistantsPage from "./pages/CompanyAssistantsPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistants"
          element={
            <ProtectedRoute>
              <Layout>
                <AssistantsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-assistant"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-campaign"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateCampaign />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <Layout>
                <CompaniesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/:companyId/assistants"
          element={
            <ProtectedRoute>
              <Layout>
                <CompanyAssistantsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/:companyId/create-assistant"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Legacy dashboard route */}
        <Route
          path="/legacy-dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to auth */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
