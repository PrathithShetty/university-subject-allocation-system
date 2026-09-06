import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AllocationResults from "./pages/AllocationResults";
import Faculty from "./pages/Faculty";
import Subjects from "./pages/Subjects";
import Sections from "./pages/Sections";
import WorkloadDashboard from "./pages/WorkloadDashboard";

import PreferenceCycles from "./pages/PreferenceCycles";
import FacultyPreferences from "./pages/FacultyPreferences";
import PreferredSections from "./pages/PreferredSections";
import PreferredTimeSlots from "./pages/PreferredTimeSlots";
import FacultyAvailability from "./pages/FacultyAvailability";
import WorkloadPreferences from "./pages/WorkloadPreferences";
import AllocationRuns from "./pages/AllocationRuns";
import "./index.css";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<RequireAuth><Dashboard /></RequireAuth>}
      />

      <Route
        path="/allocation-runs"
        element={<RequireAuth><AllocationRuns /></RequireAuth>}
      />

      <Route
        path="/allocation-runs/:runId"
        element={<RequireAuth><AllocationResults /></RequireAuth>}
      />

      <Route
        path="/faculty"
        element={<RequireAuth><Faculty /></RequireAuth>}
      />

      <Route
        path="/subjects"
        element={<RequireAuth><Subjects /></RequireAuth>}
      />

      <Route
        path="/sections"
        element={<RequireAuth><Sections /></RequireAuth>}
      />

      <Route
        path="/workload-dashboard"
        element={<RequireAuth><WorkloadDashboard /></RequireAuth>}
      />

      <Route
        path="/preference-cycles"
        element={<RequireAuth><PreferenceCycles /></RequireAuth>}
      />

      <Route
        path="/faculty-preferences"
        element={<RequireAuth><FacultyPreferences /></RequireAuth>}
      />

      <Route
        path="/preferred-sections"
        element={<RequireAuth><PreferredSections /></RequireAuth>}
      />

      <Route
        path="/preferred-time-slots"
        element={<RequireAuth><PreferredTimeSlots /></RequireAuth>}
      />

      <Route
        path="/faculty-availability"
        element={<RequireAuth><FacultyAvailability /></RequireAuth>}
      />

      <Route
        path="/workload-preferences"
        element={<RequireAuth><WorkloadPreferences /></RequireAuth>}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />

    </Routes>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);