import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import preferenceService from "../services/preferenceService";
import facultyService from "../services/facultyService";
import academicService from "../services/academicService";

import "../styles/shared.css";
import "./PreferredSections.css";


function PreferredSections() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [preferences, setPreferences] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    faculty: "",
    preference_cycle: "",
    section: "",
    priority: "",
  });


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        facultyData,
        sectionData,
        cycleData,
        preferenceData,
      ] = await Promise.all([
        facultyService.getFaculties(),
        academicService.getSections(),
        preferenceService.getPreferenceCycles(),
        preferenceService.getPreferredSections(),
      ]);

      setFaculties(facultyData);
      setSections(sectionData);
      setCycles(cycleData);
      setPreferences(preferenceData);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        "Failed to load preferred section data."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadData();

  }, []);


  const resetForm = () => {
    setFormData({
      faculty: "",
      preference_cycle: "",
      section: "",
      priority: "",
    });

    setEditingId(null);
  };


  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const extractErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (data && typeof data === "object") {
      const messages = Object.entries(data)
        .map(([field, value]) => {
          return `${field}: ${Array.isArray(value) ? value.join(", ") : value}`;
        })
        .join(" | ");

      return messages || fallback;
    }

    return fallback;
  };


  const startEdit = (preference) => {
    setEditingId(preference.id);

    setFormData({
      faculty: preference.faculty,
      preference_cycle: preference.preference_cycle,
      section: preference.section,
      priority: preference.priority,
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const cancelEdit = () => {
    resetForm();
    setError("");
  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.faculty ||
      !formData.preference_cycle ||
      !formData.section ||
      !formData.priority
    ) {

      setError(
        "Please fill in all fields."
      );

      return;

    }


    try {

      const payload = {
        faculty: Number(formData.faculty),
        preference_cycle: Number(formData.preference_cycle),
        section: Number(formData.section),
        priority: Number(formData.priority),
      };

      if (editingId) {
        await preferenceService.updatePreferredSection(editingId, payload);

        setSuccess("Preferred section updated successfully.");
      } else {
        await preferenceService.createPreferredSection(payload);

        setSuccess("Preferred section added successfully.");
      }

      resetForm();

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(
          err,
          editingId
            ? "Failed to update preferred section."
            : "Failed to add preferred section."
        )
      );

    }

  };


  const handleDelete = async (preference) => {

    const confirmed = window.confirm(
      "Delete this preferred section?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(preference.id);
      setError("");
      setSuccess("");

      await preferenceService.deletePreferredSection(preference.id);

      setSuccess("Preferred section deleted successfully.");

      if (editingId === preference.id) {
        resetForm();
      }

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(err, "Failed to delete preferred section.")
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

    return faculty.full_name ||
      `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim();

  };


  const getSectionName = (sectionId) => {

    const section = sections.find(
      (item) => item.id === sectionId
    );

    if (!section) {
      return `Section #${sectionId}`;
    }

    return section.name;

  };


  const getCycleName = (cycleId) => {

    const cycle = cycles.find(
      (item) => item.id === cycleId
    );

    return cycle
      ? cycle.name
      : `Cycle #${cycleId}`;

  };


  return (

    <div className="preferred-sections-page">

      <div className="page-header">

        <div>

          <h1>
            Preferred Sections
          </h1>

          <p>
            Manage faculty section preferences.
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


      <div className="form-card">

        <h2>
          {editingId ? "Edit Preferred Section" : "Add Preferred Section"}
        </h2>


        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">

              <label>
                Faculty *
              </label>

              <select
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

              <label>
                Preference Cycle *
              </label>

              <select
                name="preference_cycle"
                value={formData.preference_cycle}
                onChange={handleChange}
              >

                <option value="">
                  Select Preference Cycle
                </option>

                {cycles.map((cycle) => (

                  <option
                    key={cycle.id}
                    value={cycle.id}
                  >
                    {cycle.name} ({cycle.status})
                  </option>

                ))}

              </select>

            </div>


            <div className="form-group">

              <label>
                Section *
              </label>

              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
              >

                <option value="">
                  Select Section
                </option>

                {sections.map((section) => (

                  <option
                    key={section.id}
                    value={section.id}
                  >
                    {section.name}
                  </option>

                ))}

              </select>

            </div>


            <div className="form-group">

              <label>
                Priority * (1 highest - 5 lowest)
              </label>

              <input
                type="number"
                name="priority"
                min="1"
                max="5"
                value={formData.priority}
                onChange={handleChange}
                placeholder="Example: 1"
              />

            </div>

          </div>


          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingId ? "Update Preferred Section" : "Add Preferred Section"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>


      <div className="table-card">

        <div className="table-header">

          <h2>
            Current Section Preferences
          </h2>

          <span>
            {preferences.length} preference
            {preferences.length !== 1 ? "s" : ""}
          </span>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading preferences...
          </div>

        ) : preferences.length === 0 ? (

          <div className="empty-state">
            No preferred sections found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>#</th>
                  <th>Faculty</th>
                  <th>Preference Cycle</th>
                  <th>Section</th>
                  <th>Priority</th>
                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {preferences.map((preference, index) => (

                  <tr key={preference.id}>

                    <td>
                      {index + 1}
                    </td>

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
                      {getSectionName(
                        preference.section
                      )}
                    </td>

                    <td>

                      <span className="priority-badge">
                        {preference.priority}
                      </span>

                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-button"
                          onClick={() => startEdit(preference)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(preference)}
                          disabled={deletingId === preference.id}
                        >
                          {deletingId === preference.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
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


export default PreferredSections;
