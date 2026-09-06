import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import academicService from "../services/academicService";

import "../styles/shared.css";
import "./Subjects.css";


function Subjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    semester: "",
    name: "",
    code: "",
    credits: 4,
    is_lab: false,
    is_active: true,
  });


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [subjectData, semesterData] = await Promise.all([
        academicService.getSubjects(),
        academicService.getSemesters(),
      ]);

      setSubjects(Array.isArray(subjectData) ? subjectData : subjectData?.results || []);
      setSemesters(Array.isArray(semesterData) ? semesterData : semesterData?.results || []);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Failed to load subject data.");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadData();
  }, []);


  const resetForm = () => {
    setFormData({
      semester: "",
      name: "",
      code: "",
      credits: 4,
      is_lab: false,
      is_active: true,
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


  const openAddForm = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };


  const openEditForm = (subject) => {
    setEditingId(subject.id);

    setFormData({
      semester: subject.semester,
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      is_lab: subject.is_lab,
      is_active: subject.is_active,
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const closeForm = () => {
    setShowForm(false);
    resetForm();
    setError("");
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.semester || !formData.name || !formData.code) {
      setError("Please fill in all required fields.");
      return;
    }

    try {

      const payload = {
        semester: Number(formData.semester),
        name: formData.name,
        code: formData.code,
        credits: Number(formData.credits),
        is_lab: formData.is_lab,
        is_active: formData.is_active,
      };

      if (editingId) {
        await academicService.updateSubject(editingId, payload);
        setSuccess("Subject updated successfully.");
      } else {
        await academicService.createSubject(payload);
        setSuccess("Subject created successfully.");
      }

      closeForm();

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(
          err,
          editingId ? "Failed to update subject." : "Failed to create subject."
        )
      );

    }

  };


  const handleDelete = async (subject) => {

    const confirmed = window.confirm(
      `Delete subject ${subject.code} - ${subject.name}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(subject.id);
      setError("");
      setSuccess("");

      await academicService.deleteSubject(subject.id);

      setSuccess("Subject deleted successfully.");

      if (editingId === subject.id) {
        closeForm();
      }

      await loadData();

    } catch (err) {

      console.error(err);

      setError(extractErrorMessage(err, "Failed to delete subject."));

    } finally {

      setDeletingId(null);

    }

  };


  const getSemesterName = (semesterId) => {
    const semester = semesters.find((item) => item.id === semesterId);
    return semester ? semester.name : `Semester #${semesterId}`;
  };


  return (

    <div className="subjects-page">

      <div className="page-header">

        <div>
          <h1>Subjects</h1>
          <p>Manage the subjects offered by the department.</p>
        </div>

        <div className="row-actions">

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

          <button
            className="primary-button"
            onClick={showForm ? closeForm : openAddForm}
          >
            {showForm ? "Cancel" : "+ Add Subject"}
          </button>

        </div>

      </div>


      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}


      {showForm && (

        <div className="form-card">

          <h2>{editingId ? "Edit Subject" : "Add Subject"}</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Semester *</label>

                <select name="semester" value={formData.semester} onChange={handleChange}>
                  <option value="">Select Semester</option>

                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject Code *</label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Example: AI501"
                />
              </div>

              <div className="form-group">
                <label>Subject Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Artificial Intelligence"
                />
              </div>

              <div className="form-group">
                <label>Credits</label>

                <input
                  type="number"
                  name="credits"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_lab"
                    checked={formData.is_lab}
                    onChange={handleChange}
                  />
                  <span>This is a lab subject</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Subject is active</span>
                </label>
              </div>

            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Update Subject" : "Create Subject"}
              </button>

              <button type="button" className="cancel-button" onClick={closeForm}>
                Cancel
              </button>
            </div>

          </form>

        </div>

      )}


      <div className="table-card">

        <div className="table-header">
          <h2>All Subjects</h2>
          <span>{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">No subjects found.</div>
        ) : (
          <div className="table-container">
            <table>

              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="subject-code">{subject.code}</td>
                    <td>{subject.name}</td>
                    <td>{getSemesterName(subject.semester)}</td>
                    <td>{subject.credits}</td>
                    <td>{subject.is_lab ? "Lab" : "Theory"}</td>
                    <td>
                      <span className={subject.is_active ? "status-active" : "status-inactive"}>
                        {subject.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="edit-button" onClick={() => openEditForm(subject)}>
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(subject)}
                          disabled={deletingId === subject.id}
                        >
                          {deletingId === subject.id ? "Deleting..." : "Delete"}
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

export default Subjects;
