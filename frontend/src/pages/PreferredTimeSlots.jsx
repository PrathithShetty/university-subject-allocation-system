import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import preferenceService from "../services/preferenceService";
import facultyService from "../services/facultyService";

import "../styles/shared.css";
import "./PreferredTimeSlots.css";


function PreferredTimeSlots() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
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
    day: "",
    slot_number: "",
    priority: "",
  });


  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        facultyData,
        cycleData,
        preferenceData,
      ] = await Promise.all([
        facultyService.getFaculties(),
        preferenceService.getPreferenceCycles(),
        preferenceService.getPreferredTimeSlots(),
      ]);

      setFaculties(facultyData);
      setCycles(cycleData);
      setPreferences(preferenceData);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        "Failed to load preferred time slot data."
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
      day: "",
      slot_number: "",
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
      day: preference.day,
      slot_number: preference.slot_number,
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
      !formData.day ||
      !formData.slot_number ||
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
        day: formData.day,
        slot_number: Number(formData.slot_number),
        priority: Number(formData.priority),
      };

      if (editingId) {
        await preferenceService.updatePreferredTimeSlot(editingId, payload);

        setSuccess("Preferred time slot updated successfully.");
      } else {
        await preferenceService.createPreferredTimeSlot(payload);

        setSuccess("Preferred time slot added successfully.");
      }

      resetForm();

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(
          err,
          editingId
            ? "Failed to update preferred time slot."
            : "Failed to add preferred time slot."
        )
      );

    }

  };


  const handleDelete = async (preference) => {

    const confirmed = window.confirm(
      "Delete this preferred time slot?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(preference.id);
      setError("");
      setSuccess("");

      await preferenceService.deletePreferredTimeSlot(preference.id);

      setSuccess("Preferred time slot deleted successfully.");

      if (editingId === preference.id) {
        resetForm();
      }

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(err, "Failed to delete preferred time slot.")
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


  const getCycleName = (cycleId) => {

    const cycle = cycles.find(
      (item) => item.id === cycleId
    );

    return cycle
      ? cycle.name
      : `Cycle #${cycleId}`;

  };


  return (

    <div className="preferred-time-slots-page">

      <div className="page-header">

        <div>

          <h1>
            Preferred Time Slots
          </h1>

          <p>
            Manage faculty preferred teaching time slots.
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
          {editingId ? "Edit Preferred Time Slot" : "Add Preferred Time Slot"}
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
                Day *
              </label>

              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
              >

                <option value="">
                  Select Day
                </option>

                {days.map((day) => (

                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>

                ))}

              </select>

            </div>


            <div className="form-group">

              <label>
                Slot Number * (1-8)
              </label>

              <input
                type="number"
                name="slot_number"
                min="1"
                max="8"
                value={formData.slot_number}
                onChange={handleChange}
                placeholder="Example: 1"
              />

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
              {editingId ? "Update Preferred Time Slot" : "Add Preferred Time Slot"}
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
            Current Time Slot Preferences
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
            No preferred time slots found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>#</th>
                  <th>Faculty</th>
                  <th>Preference Cycle</th>
                  <th>Day</th>
                  <th>Slot</th>
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
                      {preference.day}
                    </td>

                    <td>
                      {preference.slot_number}
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


export default PreferredTimeSlots;
