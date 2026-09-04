import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import academicService from "../services/academicService";
import allocationService from "../services/allocationService";

import "./Dashboard.css";

function getCount(data) {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (data && Array.isArray(data.results)) {
    return data.results.length;
  }

  return 0;
}

function Dashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    academicYears: 0,
    departments: 0,
    programs: 0,
    semesters: 0,
    sections: 0,
    subjects: 0,
    offerings: 0,
    runs: 0,
  });

  const [latestRun, setLatestRun] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        academicYears,
        departments,
        programs,
        semesters,
        sections,
        subjects,
        offerings,
        runs,
      ] = await Promise.all([
        academicService.getAcademicYears(),
        academicService.getDepartments(),
        academicService.getPrograms(),
        academicService.getSemesters(),
        academicService.getSections(),
        academicService.getSubjects(),
        academicService.getSubjectOfferings(),
        allocationService.getRuns(),
      ]);

      setStats({
        academicYears: getCount(academicYears),
        departments: getCount(departments),
        programs: getCount(programs),
        semesters: getCount(semesters),
        sections: getCount(sections),
        subjects: getCount(subjects),
        offerings: getCount(offerings),
        runs: getCount(runs),
      });

      const runList = Array.isArray(runs)
        ? runs
        : runs?.results || [];

      if (runList.length > 0) {
        const sortedRuns = [...runList].sort(
          (a, b) => b.id - a.id
        );

        setLatestRun(sortedRuns[0]);
      }
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <header className="dashboard-header">

        <div>
          <h1>Subject Allocation System</h1>

          <p>
            University Academic Management Dashboard
          </p>
        </div>

        <div className="header-actions">

          <span className="welcome-text">
            {user?.username
              ? `Welcome, ${user.username}`
              : "Welcome"}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* -------------------------------------------------- */}
      {/* MAIN CONTENT */}
      {/* -------------------------------------------------- */}

      <main className="dashboard-content">

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}


        {/* ------------------------------------------------ */}
        {/* STATISTICS */}
        {/* ------------------------------------------------ */}

        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-label">
              Academic Years
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.academicYears}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Departments
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.departments}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Programs
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.programs}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Semesters
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.semesters}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Sections
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.sections}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Subjects
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.subjects}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Subject Offerings
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.offerings}
            </strong>
          </div>


          <div className="stat-card">
            <span className="stat-label">
              Allocation Runs
            </span>

            <strong className="stat-value">
              {loading ? "—" : stats.runs}
            </strong>
          </div>

        </section>


        {/* ------------------------------------------------ */}
        {/* LATEST ALLOCATION RUN */}
        {/* ------------------------------------------------ */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Latest Allocation Run</h2>

              <p>
                Most recent allocation execution
              </p>
            </div>

          </div>


          {loading ? (

            <div className="loading-card">
              Loading allocation information...
            </div>

          ) : latestRun ? (

            <div className="run-card">

              <div className="run-main">

                <h3>
                  {latestRun.name}
                </h3>

                <span className="run-id">
                  Run #{latestRun.id}
                </span>

              </div>


              <div className="run-status">

                <span
                  className={`status-badge status-${String(
                    latestRun.status
                  ).toLowerCase()}`}
                >
                  {latestRun.status}
                </span>

              </div>


              <div className="run-details">

                <div>
                  <span>Academic Year</span>
                  <strong>
                    {latestRun.academic_year}
                  </strong>
                </div>

                <div>
                  <span>Allocations</span>
                  <strong>
                    {latestRun.allocation_count ?? 0}
                  </strong>
                </div>

                <div>
                  <span>Conflicts</span>
                  <strong>
                    {latestRun.conflict_count ?? 0}
                  </strong>
                </div>

              </div>

              <button
                className="view-run-button"
                onClick={() =>
                  navigate(
                    `/allocation-runs/${latestRun.id}`
                  )
                }
              >
                View Allocation
              </button>

            </div>

          ) : (

            <div className="empty-card">
              No allocation runs found.
            </div>

          )}

        </section>


        {/* ------------------------------------------------ */}
        {/* QUICK ACTIONS */}
        {/* ------------------------------------------------ */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage your allocation system
              </p>
            </div>

          </div>


          <div className="quick-actions">

            <button
              onClick={() =>
                navigate("/allocation-runs")
              }
            >
              Allocation Runs
            </button>

            <button
              onClick={() =>
                navigate("/subjects")
              }
            >
              Subjects
            </button>

            <button
              onClick={() =>
                navigate("/faculty")
              }
            >
              Faculty
            </button>

            <button
              onClick={() =>
                navigate("/sections")
              }
            >
              Sections
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;