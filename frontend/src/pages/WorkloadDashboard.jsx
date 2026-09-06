import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import allocationService from "../services/allocationService";
import preferenceService from "../services/preferenceService";

import "../styles/shared.css";
import "./WorkloadDashboard.css";


const STATUS_LABELS = {
  UNDERLOADED: "Underloaded",
  WITHIN_RANGE: "Within Range",
  PREFERRED: "Preferred",
  OVERLOADED: "Overloaded",
};


function WorkloadDashboard() {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [runs, setRuns] = useState([]);

  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedRun, setSelectedRun] = useState("");

  const [workloads, setWorkloads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadFilters = async () => {
    try {
      const [cycleData, runData] = await Promise.all([
        preferenceService.getPreferenceCycles(),
        allocationService.getRuns(),
      ]);

      const cycleList = Array.isArray(cycleData) ? cycleData : cycleData?.results || [];
      const runList = Array.isArray(runData) ? runData : runData?.results || [];

      setCycles(cycleList);
      setRuns(runList);

      const openCycle = cycleList.find((cycle) => cycle.status === "OPEN");

      if (openCycle) {
        setSelectedCycle(String(openCycle.id));
      }

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
    }
  };


  const loadWorkloads = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await allocationService.getWorkloadDashboard({
        preferenceCycle: selectedCycle || undefined,
        allocationRun: selectedRun || undefined,
      });

      setWorkloads(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Failed to load workload data.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadFilters();
  }, []);


  useEffect(() => {
    loadWorkloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycle, selectedRun]);


  const getStatusClass = (status) => {
    switch (status) {
      case "OVERLOADED":
        return "status-badge status-overloaded";
      case "PREFERRED":
        return "status-badge status-preferred";
      case "WITHIN_RANGE":
        return "status-badge status-within";
      default:
        return "status-badge status-underloaded";
    }
  };


  const getBarWidth = (workload) => {
    if (!workload.maximum_hours) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((workload.current_hours / workload.maximum_hours) * 100)
    );
  };


  return (

    <div className="workload-dashboard-page">

      <div className="page-header">

        <div>
          <h1>Faculty Workload Dashboard</h1>
          <p>Live workload status for every active faculty member.</p>
        </div>

        <button className="back-button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>

      </div>


      <div className="filters-card">

        <div className="form-group">
          <label>Preference Cycle</label>

          <select
            value={selectedCycle}
            onChange={(event) => setSelectedCycle(event.target.value)}
          >
            <option value="">
              None (use each faculty's default max hours)
            </option>

            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name} ({cycle.status})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Allocation Run</label>

          <select
            value={selectedRun}
            onChange={(event) => setSelectedRun(event.target.value)}
          >
            <option value="">
              All runs (total committed workload)
            </option>

            {runs.map((run) => (
              <option key={run.id} value={run.id}>
                {run.name}
              </option>
            ))}
          </select>
        </div>

      </div>


      {error && <div className="message error-message">{error}</div>}


      <div className="table-card">

        <div className="table-header">
          <h2>Workload by Faculty</h2>
          <span>{workloads.length} faculty member{workloads.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading workload data...</div>
        ) : workloads.length === 0 ? (
          <div className="empty-state">No active faculty found.</div>
        ) : (
          <div className="table-container">
            <table>

              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Current</th>
                  <th>Min / Preferred / Max</th>
                  <th>Load</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {workloads.map((workload) => (
                  <tr key={workload.faculty_id}>
                    <td className="faculty-name-cell">{workload.faculty_name}</td>
                    <td>{workload.department || "-"}</td>
                    <td>{workload.current_hours} hrs</td>
                    <td>
                      {workload.minimum_hours} / {workload.preferred_hours} / {workload.maximum_hours} hrs
                    </td>
                    <td>
                      <div className="load-bar-track">
                        <div
                          className={`load-bar-fill ${workload.status === "OVERLOADED" ? "over" : ""}`}
                          style={{ width: `${getBarWidth(workload)}%` }}
                        />
                      </div>
                    </td>
                    <td>{workload.remaining_capacity} hrs</td>
                    <td>
                      <span className={getStatusClass(workload.status)}>
                        {STATUS_LABELS[workload.status] || workload.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>

  );
}

export default WorkloadDashboard;
