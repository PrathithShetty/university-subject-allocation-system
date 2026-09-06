import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import academicService from "../services/academicService";
import preferenceService from "../services/preferenceService";
import allocationService from "../services/allocationService";

import "./AllocationRuns.css";

function AllocationRuns() {
  const navigate = useNavigate();

  const [runs, setRuns] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [preferenceCycles, setPreferenceCycles] = useState([]);

  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [preferenceCycle, setPreferenceCycle] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [executing, setExecuting] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        runsData,
        academicYearsData,
        preferenceCyclesData,
      ] = await Promise.all([
        allocationService.getRuns(),
        academicService.getAcademicYears(),
        preferenceService.getPreferenceCycles(),
      ]);

      setRuns(runsData);
      setAcademicYears(academicYearsData);

      const openCycles = preferenceCyclesData.filter(
        (cycle) => cycle.status === "OPEN"
      );

      setPreferenceCycles(openCycles);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load allocation data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRun = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter an allocation run name.");
      return;
    }

    if (!academicYear) {
      setError("Please select an academic year.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const createdRun = await allocationService.createRun({
        name: name.trim(),
        academic_year: Number(academicYear),
      });

      setRuns((previousRuns) => [
        createdRun,
        ...previousRuns,
      ]);

      setName("");
      setAcademicYear("");

      setSuccess(
        "Allocation run created successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to create allocation run."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleExecuteRun = async (run) => {
    if (!preferenceCycle) {
      setError(
        "Please select an open preference cycle before executing a run."
      );
      return;
    }

    setError("");
    setSuccess("");

    try {
      setExecuting(run.id);

      const result = await allocationService.executeRun(
        run.id,
        Number(preferenceCycle)
      );

      setRuns((previousRuns) =>
        previousRuns.map((item) =>
          item.id === run.id
            ? {
                ...item,
                status: result.status,
                allocation_count: result.allocated,
                conflict_count: result.conflicts,
              }
            : item
        )
      );

      setSuccess(
        `Allocation completed: ${result.allocated} allocated, ${result.conflicts} conflicts.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Allocation execution failed."
      );

      await loadData();
    } finally {
      setExecuting(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "COMPLETED") {
      return "status-completed";
    }

    if (status === "RUNNING") {
      return "status-running";
    }

    if (status === "FAILED") {
      return "status-failed";
    }

    return "status-default";
  };

  if (loading) {
    return (
      <div className="allocation-runs-page">
        <div className="allocation-runs-header">
          <div>
            <h1>Allocation Runs</h1>
            <p>
              Create, execute, and review faculty allocation runs.
            </p>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="loading-message">
          Loading allocation runs...
        </div>
      </div>
    );
  }

  return (
    <div className="allocation-runs-page">
      <div className="allocation-runs-header">
        <div>
          <h1>Allocation Runs</h1>
          <p>
            Create, execute, and review faculty allocation runs.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          {success}
        </div>
      )}

      <div className="allocation-runs-content">
        <section className="create-run-card">
          <div className="section-heading">
            <h2>Create Allocation Run</h2>
            <p>
              Create a new run before executing the allocation engine.
            </p>
          </div>

          <form
            className="create-run-form"
            onSubmit={handleCreateRun}
          >
            <div className="form-group">
              <label htmlFor="run-name">
                Run Name
              </label>

              <input
                id="run-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Example: September Allocation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="academic-year">
                Academic Year
              </label>

              <select
                id="academic-year"
                value={academicYear}
                onChange={(event) =>
                  setAcademicYear(event.target.value)
                }
              >
                <option value="">
                  Select Academic Year
                </option>

                {academicYears.map((year) => (
                  <option
                    key={year.id}
                    value={year.id}
                  >
                    {year.year_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Allocation Run"}
            </button>
          </form>
        </section>

        <section className="execute-run-card">
          <div className="section-heading">
            <h2>Execute Allocation</h2>
            <p>
              Select the preference cycle used by the allocation engine.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="preference-cycle">
              Preference Cycle
            </label>

            <select
              id="preference-cycle"
              value={preferenceCycle}
              onChange={(event) =>
                setPreferenceCycle(event.target.value)
              }
            >
              <option value="">
                Select Open Preference Cycle
              </option>

              {preferenceCycles.map((cycle) => (
                <option
                  key={cycle.id}
                  value={cycle.id}
                >
                  {cycle.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="runs-list-card">
          <div className="section-heading">
            <h2>Previous Allocation Runs</h2>
            <p>
              View and execute your allocation runs.
            </p>
          </div>

          {runs.length === 0 ? (
            <div className="empty-message">
              No allocation runs have been created yet.
            </div>
          ) : (
            <div className="runs-table-container">
              <table className="runs-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Academic Year</th>
                    <th>Status</th>
                    <th>Allocations</th>
                    <th>Conflicts</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id}>
                      <td>
                        <strong>{run.name}</strong>
                      </td>

                      <td>
                        {run.academic_year_name ||
                          run.academic_year}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                      </td>

                      <td>
                        {run.allocation_count ?? 0}
                      </td>

                      <td>
                        {run.conflict_count ?? 0}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-button"
                            onClick={() =>
                              navigate(
                                `/allocation-runs/${run.id}`
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="execute-button"
                            onClick={() =>
                              handleExecuteRun(run)
                            }
                            disabled={
                              executing === run.id ||
                              run.status === "RUNNING" ||
                              !preferenceCycle
                            }
                          >
                            {executing === run.id
                              ? "Executing..."
                              : "Execute"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AllocationRuns;