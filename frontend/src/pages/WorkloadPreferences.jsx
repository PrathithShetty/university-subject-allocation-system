import React, { useEffect, useState } from "react";
import preferenceService from "../services/preferenceService";
import facultyService from "../services/facultyService";
import "./WorkloadPreferences.css";

function WorkloadPreferences() {
  const [faculties, setFaculties] = useState([]);
  const [preferenceCycles, setPreferenceCycles] = useState([]);
  const [workloadPreferences, setWorkloadPreferences] = useState([]);

  const [formData, setFormData] = useState({
    faculty: "",
    preference_cycle: "",
    minimum_hours: "",
    preferred_hours: "",
    maximum_hours: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      await preferenceService.createWorkloadPreference({
        faculty: Number(formData.faculty),
        preference_cycle: Number(formData.preference_cycle),
        minimum_hours: minimum,
        preferred_hours: preferred,
        maximum_hours: maximum,
      });

      setMessage(
        "Workload preference added successfully."
      );

      setFormData({
        faculty: "",
        preference_cycle: "",
        minimum_hours: "",
        preferred_hours: "",
        maximum_hours: "",
      });

      await loadData();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data)
        );
      } else {
        setError(
          "Failed to add workload preference."
        );
      }
    } finally {
      setSubmitting(false);
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
      faculty.name ||
      faculty.user?.name ||
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
        </div>

        <div className="workload-card">
          <h2>Add Workload Preference</h2>

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
                    {faculty.name ||
                      faculty.user?.name ||
                      `Faculty #${faculty.id}`}
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

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Adding..."
                : "Add Workload Preference"}
            </button>

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