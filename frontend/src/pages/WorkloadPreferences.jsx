import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import preferenceService from "../services/preferenceService";
import facultyService from "../services/facultyService";
import "../styles/shared.css";
import "./WorkloadPreferences.css";

function WorkloadPreferences() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [preferenceCycles, setPreferenceCycles] = useState([]);
  const [workloadPreferences, setWorkloadPreferences] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    faculty: "",
    preference_cycle: "",
    minimum_hours: "",
    preferred_hours: "",
    maximum_hours: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData({
      faculty: "",
      preference_cycle: "",
      minimum_hours: "",
      preferred_hours: "",
      maximum_hours: "",
    });

    setEditingId(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        facultyData,
        cycleData,
        workloadData,
      ] = await Promise.all([
        facultyService.getFaculties(),
        preferenceService.getPreferenceCycles(),
        preferenceService.getWorkloadPreferences(),
      ]);

      setFaculties(facultyData);
      setPreferenceCycles(cycleData);
      setWorkloadPreferences(workloadData);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Failed to load workload preferences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEdit = (preference) => {
    setEditingId(preference.id);

    setFormData({
      faculty: preference.faculty,
      preference_cycle: preference.preference_cycle,
      minimum_hours: preference.minimum_hours,
      preferred_hours: preference.preferred_hours,
      maximum_hours: preference.maximum_hours,
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    resetForm();
    setError("");
  };

  const extractErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (data && typeof data === "object") {
      return Object.entries(data)
        .map(([field, value]) => {
          const text = Array.isArray(value)
            ? value.join(", ")
            : value;

          return `${field}: ${text}`;
        })
        .join(" | ");
    }

    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.faculty ||
      !formData.preference_cycle ||
      formData.minimum_hours === "" ||
      formData.preferred_hours === "" ||
      formData.maximum_hours === ""
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const minimum = Number(formData.minimum_hours);
    const preferred = Number(formData.preferred_hours);
    const maximum = Number(formData.maximum_hours);

    if (minimum > preferred || preferred > maximum) {
      setError(
        "Hours must follow: Minimum ≤ Preferred ≤ Maximum."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        faculty: Number(formData.faculty),
        preference_cycle: Number(formData.preference_cycle),
        minimum_hours: minimum,
        preferred_hours: preferred,
        maximum_hours: maximum,
      };

      if (editingId) {
        await preferenceService.updateWorkloadPreference(
          editingId,
          payload
        );

        setMessage("Workload preference updated successfully.");
      } else {
        await preferenceService.createWorkloadPreference(payload);

        setMessage("Workload preference added successfully.");
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        extractErrorMessage(
          err,
          editingId
            ? "Failed to update workload preference."
            : "Failed to add workload preference."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (preference) => {
    const confirmed = window.confirm(
      `Delete the workload preference for ${getFacultyName(
        preference.faculty
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(preference.id);
      setError("");
      setMessage("");

      await preferenceService.deleteWorkloadPreference(
        preference.id
      );

      setMessage("Workload preference deleted successfully.");

      if (editingId === preference.id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        extractErrorMessage(
          err,
          "Failed to delete workload preference."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(
      (item) => item.id === facultyId
    );

    if (!faculty) {
      return `Faculty #${facultyId}`;
    }

    return (
      faculty.full_name ||
      `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim() ||
      `Faculty #${faculty.id}`
    );
  };

  const getCycleName = (cycleId) => {
    const cycle = preferenceCycles.find(
      (item) => item.id === cycleId
    );

    if (!cycle) {
      return `Cycle #${cycleId}`;
    }

    return cycle.name;
  };

  return (
    <div className="workload-page">
      <div className="workload-container">

        <div className="workload-header">
          <h1>Workload Preferences</h1>

          <p>
            Set the minimum, preferred, and maximum
            workload hours for each faculty member.
          </p>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="workload-card">
          <h2>
            {editingId
              ? "Edit Workload Preference"
              : "Add Workload Preference"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="faculty">
                Faculty
              </label>

              <select
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
              >
                <option value="">
                  Select Faculty
                </option>

                {faculties.map((faculty) => (
                  <option
                    key={faculty.id}
                    value={faculty.id}
                  >
                    {faculty.full_name ||
                      `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preference_cycle">
                Preference Cycle
              </label>

              <select
                id="preference_cycle"
                name="preference_cycle"
                value={formData.preference_cycle}
                onChange={handleChange}
              >
                <option value="">
                  Select Preference Cycle
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

            <div className="hours-grid">

              <div className="form-group">
                <label htmlFor="minimum_hours">
                  Minimum Hours
                </label>

                <input
                  id="minimum_hours"
                  type="number"
                  name="minimum_hours"
                  min="0"
                  value={formData.minimum_hours}
                  onChange={handleChange}
                  placeholder="Example: 8"
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferred_hours">
                  Preferred Hours
                </label>

                <input
                  id="preferred_hours"
                  type="number"
                  name="preferred_hours"
                  min="0"
                  value={formData.preferred_hours}
                  onChange={handleChange}
                  placeholder="Example: 12"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maximum_hours">
                  Maximum Hours
                </label>

                <input
                  id="maximum_hours"
                  type="number"
                  name="maximum_hours"
                  min="0"
                  value={formData.maximum_hours}
                  onChange={handleChange}
                  placeholder="Example: 16"
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                    ? "Update Workload Preference"
                    : "Add Workload Preference"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="workload-card">

          <h2>Existing Workload Preferences</h2>

          {loading ? (
            <p>Loading...</p>
          ) : workloadPreferences.length === 0 ? (
            <p>
              No workload preferences found.
            </p>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Preference Cycle</th>
                    <th>Minimum Hours</th>
                    <th>Preferred Hours</th>
                    <th>Maximum Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {workloadPreferences.map(
                    (preference) => (
                      <tr key={preference.id}>

                        <td>
                          {getFacultyName(
                            preference.faculty
                          )}
                        </td>

                        <td>
                          {getCycleName(
                            preference.preference_cycle
                          )}
                        </td>

                        <td>
                          {preference.minimum_hours}
                        </td>

                        <td>
                          {preference.preferred_hours}
                        </td>

                        <td>
                          {preference.maximum_hours}
                        </td>

                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => startEdit(preference)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleDelete(preference)}
                              disabled={deletingId === preference.id}
                            >
                              {deletingId === preference.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default WorkloadPreferences;
