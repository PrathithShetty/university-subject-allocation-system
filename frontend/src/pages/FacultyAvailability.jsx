import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import preferenceService from "../services/preferenceService";
import facultyService from "../services/facultyService";

import "../styles/shared.css";
import "./FacultyAvailability.css";


function FacultyAvailability() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    faculty: "",
    day: "",
    slot_number: "",
    is_available: true,
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
        availabilityData,
      ] = await Promise.all([
        facultyService.getFaculties(),
        preferenceService.getFacultyAvailability(),
      ]);

      setFaculties(facultyData);
      setAvailability(availabilityData);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        "Failed to load faculty availability data."
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
      day: "",
      slot_number: "",
      is_available: true,
    });

    setEditingId(null);
  };


  const handleChange = (event) => {

    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
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


  const startEdit = (record) => {
    setEditingId(record.id);

    setFormData({
      faculty: record.faculty,
      day: record.day,
      slot_number: record.slot_number,
      is_available: record.is_available,
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
      !formData.day ||
      !formData.slot_number
    ) {

      setError(
        "Please fill in all required fields."
      );

      return;

    }


    try {

      const payload = {
        faculty: Number(formData.faculty),
        day: formData.day,
        slot_number: Number(formData.slot_number),
        is_available: formData.is_available,
      };

      if (editingId) {
        await preferenceService.updateFacultyAvailability(editingId, payload);

        setSuccess("Faculty availability updated successfully.");
      } else {
        await preferenceService.createFacultyAvailability(payload);

        setSuccess("Faculty availability added successfully.");
      }

      resetForm();

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(
          err,
          editingId
            ? "Failed to update faculty availability."
            : "Failed to add faculty availability."
        )
      );

    }

  };


  const handleDelete = async (record) => {

    const confirmed = window.confirm(
      "Delete this faculty availability record?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(record.id);
      setError("");
      setSuccess("");

      await preferenceService.deleteFacultyAvailability(record.id);

      setSuccess("Faculty availability deleted successfully.");

      if (editingId === record.id) {
        resetForm();
      }

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(err, "Failed to delete faculty availability.")
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


  return (

    <div className="faculty-availability-page">

      <div className="page-header">

        <div>

          <h1>
            Faculty Availability
          </h1>

          <p>
            Manage faculty availability for teaching slots.
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
          {editingId ? "Edit Faculty Availability" : "Add Faculty Availability"}
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


            <div className="form-group checkbox-group">

              <label>
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                />

                <span>
                  Faculty is available
                </span>
              </label>

            </div>

          </div>


          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingId ? "Update Availability" : "Add Availability"}
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
            Faculty Availability
          </h2>

          <span>
            {availability.length} record
            {availability.length !== 1 ? "s" : ""}
          </span>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading availability...
          </div>

        ) : availability.length === 0 ? (

          <div className="empty-state">
            No faculty availability records found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>#</th>
                  <th>Faculty</th>
                  <th>Day</th>
                  <th>Slot</th>
                  <th>Availability</th>
                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {availability.map((record, index) => (

                  <tr key={record.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {getFacultyName(record.faculty)}
                    </td>

                    <td>
                      {record.day}
                    </td>

                    <td>
                      {record.slot_number}
                    </td>

                    <td>

                      <span
                        className={
                          record.is_available
                            ? "availability-badge available"
                            : "availability-badge unavailable"
                        }
                      >
                        {record.is_available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-button"
                          onClick={() => startEdit(record)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(record)}
                          disabled={deletingId === record.id}
                        >
                          {deletingId === record.id ? "Deleting..." : "Delete"}
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


export default FacultyAvailability;
