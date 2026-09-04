import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AllocationResults from "./pages/AllocationResults";
import Faculty from "./pages/Faculty";

import PreferenceCycles from "./pages/PreferenceCycles";
import FacultyPreferences from "./pages/FacultyPreferences";
import PreferredSections from "./pages/PreferredSections";
import PreferredTimeSlots from "./pages/PreferredTimeSlots";
import FacultyAvailability from "./pages/FacultyAvailability";
import WorkloadPreferences from "./pages/WorkloadPreferences";

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
        element={<Dashboard />}
      />

      <Route
        path="/allocation-runs"
        element={<Dashboard />}
      />

      <Route
        path="/allocation-runs/:runId"
        element={<AllocationResults />}
      />

      <Route
        path="/faculty"
        element={<Faculty />}
      />

      <Route
        path="/preference-cycles"
        element={<PreferenceCycles />}
      />

      <Route
        path="/faculty-preferences"
        element={<FacultyPreferences />}
      />

      <Route
        path="/preferred-sections"
        element={<PreferredSections />}
      />

      <Route
        path="/preferred-time-slots"
        element={<PreferredTimeSlots />}
      />

      <Route
        path="/faculty-availability"
        element={<FacultyAvailability />}
      />

      <Route
        path="/workload-preferences"
        element={<WorkloadPreferences />}
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