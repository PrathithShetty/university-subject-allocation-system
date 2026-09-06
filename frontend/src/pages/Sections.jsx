import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import academicService from "../services/academicService";

import "../styles/shared.css";
import "./Sections.css";


function Sections() {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [offerings, setOfferings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deletingSectionId, setDeletingSectionId] = useState(null);
  const [deletingOfferingId, setDeletingOfferingId] = useState(null);

  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);

  const [sectionForm, setSectionForm] = useState({
    semester: "",
    name: "",
    capacity: 60,
    is_active: true,
  });

  const [offeringForm, setOfferingForm] = useState({
    section: "",
    subject: "",
    is_active: true,
  });


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [sectionData, semesterData, subjectData, offeringData] = await Promise.all([
        academicService.getSections(),
        academicService.getSemesters(),
        academicService.getSubjects(),
        academicService.getSubjectOfferings(),
      ]);

      setSections(Array.isArray(sectionData) ? sectionData : sectionData?.results || []);
      setSemesters(Array.isArray(semesterData) ? semesterData : semesterData?.results || []);
      setSubjects(Array.isArray(subjectData) ? subjectData : subjectData?.results || []);
      setOfferings(Array.isArray(offeringData) ? offeringData : offeringData?.results || []);

    } catch (err) {

      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Failed to load section data.");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadData();
  }, []);


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


  // ---------------- Sections ----------------

  const resetSectionForm = () => {
    setSectionForm({ semester: "", name: "", capacity: 60, is_active: true });
    setEditingSectionId(null);
  };


  const handleSectionChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSectionForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const openAddSectionForm = () => {
    resetSectionForm();
    setError("");
    setSuccess("");
    setShowSectionForm(true);
  };


  const openEditSectionForm = (section) => {
    setEditingSectionId(section.id);

    setSectionForm({
      semester: section.semester,
      name: section.name,
      capacity: section.capacity,
      is_active: section.is_active,
    });

    setError("");
    setSuccess("");
    setShowSectionForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const closeSectionForm = () => {
    setShowSectionForm(false);
    resetSectionForm();
    setError("");
  };


  const handleSectionSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!sectionForm.semester || !sectionForm.name) {
      setError("Please fill in all required fields.");
      return;
    }

    try {

      const payload = {
        semester: Number(sectionForm.semester),
        name: sectionForm.name,
        capacity: Number(sectionForm.capacity),
        is_active: sectionForm.is_active,
      };

      if (editingSectionId) {
        await academicService.updateSection(editingSectionId, payload);
        setSuccess("Section updated successfully.");
      } else {
        await academicService.createSection(payload);
        setSuccess("Section created successfully.");
      }

      closeSectionForm();

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        extractErrorMessage(
          err,
          editingSectionId ? "Failed to update section." : "Failed to create section."
        )
      );

    }

  };


  const handleSectionDelete = async (section) => {

    const confirmed = window.confirm(
      `Delete Section ${section.name}? Any subject offerings linked to it will also be removed.`
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingSectionId(section.id);
      setError("");
      setSuccess("");

      await academicService.deleteSection(section.id);

      setSuccess("Section deleted successfully.");

      if (editingSectionId === section.id) {
        closeSectionForm();
      }

      await loadData();

    } catch (err) {

      console.error(err);

      setError(extractErrorMessage(err, "Failed to delete section."));

    } finally {

      setDeletingSectionId(null);

    }

  };


  const getSemesterName = (semesterId) => {
    const semester = semesters.find((item) => item.id === semesterId);
    return semester ? semester.name : `Semester #${semesterId}`;
  };


  // ---------------- Subject Offerings ----------------

  const handleOfferingChange = (event) => {
    const { name, value, type, checked } = event.target;

    setOfferingForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleOfferingSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!offeringForm.section || !offeringForm.subject) {
      setError("Please select both a section and a subject.");
      return;
    }

    try {

      await academicService.createSubjectOffering({
        section: Number(offeringForm.section),
        subject: Number(offeringForm.subject),
        is_active: offeringForm.is_active,
      });

      setSuccess("Subject offering created successfully.");

      setOfferingForm({ section: "", subject: "", is_active: true });

      await loadData();

    } catch (err) {

      console.error(err);

      setError(extractErrorMessage(err, "Failed to create subject offering."));

    }

  };


  const toggleOfferingActive = async (offering) => {

    try {

      setError("");
      setSuccess("");

      await academicService.updateSubjectOffering(offering.id, {
        section: offering.section,
        subject: offering.subject,
        is_active: !offering.is_active,
      });

      await loadData();

    } catch (err) {

      console.error(err);

      setError(extractErrorMessage(err, "Failed to update subject offering."));

    }

  };


  const handleOfferingDelete = async (offering) => {

    const confirmed = window.confirm("Delete this subject offering?");

    if (!confirmed) {
      return;
    }

    try {

      setDeletingOfferingId(offering.id);
      setError("");
      setSuccess("");

      await academicService.deleteSubjectOffering(offering.id);

      setSuccess("Subject offering deleted successfully.");

      await loadData();

    } catch (err) {

      console.error(err);

      setError(extractErrorMessage(err, "Failed to delete subject offering."));

    } finally {

      setDeletingOfferingId(null);

    }

  };


  const getSectionLabel = (sectionId) => {
    const section = sections.find((item) => item.id === sectionId);
    return section ? `Section ${section.name}` : `Section #${sectionId}`;
  };


  const getSubjectLabel = (subjectId) => {
    const subject = subjects.find((item) => item.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : `Subject #${subjectId}`;
  };


  return (

    <div className="sections-page">

      <div className="page-header">

        <div>
          <h1>Sections</h1>
          <p>Manage class sections and the subjects offered to them.</p>
        </div>

        <div className="row-actions">

          <button className="back-button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>

          <button
            className="primary-button"
            onClick={showSectionForm ? closeSectionForm : openAddSectionForm}
          >
            {showSectionForm ? "Cancel" : "+ Add Section"}
          </button>

        </div>

      </div>


      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}


      {showSectionForm && (

        <div className="form-card">

          <h2>{editingSectionId ? "Edit Section" : "Add Section"}</h2>

          <form onSubmit={handleSectionSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Semester *</label>

                <select name="semester" value={sectionForm.semester} onChange={handleSectionChange}>
                  <option value="">Select Semester</option>

                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Section Name *</label>

                <input
                  type="text"
                  name="name"
                  value={sectionForm.name}
                  onChange={handleSectionChange}
                  placeholder="Example: D"
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>

                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={sectionForm.capacity}
                  onChange={handleSectionChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={sectionForm.is_active}
                    onChange={handleSectionChange}
                  />
                  <span>Section is active</span>
                </label>
              </div>

            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingSectionId ? "Update Section" : "Create Section"}
              </button>

              <button type="button" className="cancel-button" onClick={closeSectionForm}>
                Cancel
              </button>
            </div>

          </form>

        </div>

      )}


      <div className="table-card">

        <div className="table-header">
          <h2>All Sections</h2>
          <span>{sections.length} section{sections.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading sections...</div>
        ) : sections.length === 0 ? (
          <div className="empty-state">No sections found.</div>
        ) : (
          <div className="table-container">
            <table>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Semester</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sections.map((section) => (
                  <tr key={section.id}>
                    <td className="section-name">Section {section.name}</td>
                    <td>{getSemesterName(section.semester)}</td>
                    <td>{section.capacity}</td>
                    <td>
                      <span className={section.is_active ? "status-active" : "status-inactive"}>
                        {section.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="edit-button" onClick={() => openEditSectionForm(section)}>
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleSectionDelete(section)}
                          disabled={deletingSectionId === section.id}
                        >
                          {deletingSectionId === section.id ? "Deleting..." : "Delete"}
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


      <div className="form-card">

        <h2>Add Subject Offering</h2>

        <form onSubmit={handleOfferingSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Section *</label>

              <select name="section" value={offeringForm.section} onChange={handleOfferingChange}>
                <option value="">Select Section</option>

                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    Section {section.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>

              <select name="subject" value={offeringForm.subject} onChange={handleOfferingChange}>
                <option value="">Select Subject</option>

                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Add Subject Offering
            </button>
          </div>

        </form>

      </div>


      <div className="table-card">

        <div className="table-header">
          <h2>Subject Offerings</h2>
          <span>{offerings.length} offering{offerings.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading subject offerings...</div>
        ) : offerings.length === 0 ? (
          <div className="empty-state">No subject offerings found.</div>
        ) : (
          <div className="table-container">
            <table>

              <thead>
                <tr>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {offerings.map((offering) => (
                  <tr key={offering.id}>
                    <td>{getSectionLabel(offering.section)}</td>
                    <td>{getSubjectLabel(offering.subject)}</td>
                    <td>
                      <span className={offering.is_active ? "status-active" : "status-inactive"}>
                        {offering.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="edit-button" onClick={() => toggleOfferingActive(offering)}>
                          {offering.is_active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleOfferingDelete(offering)}
                          disabled={deletingOfferingId === offering.id}
                        >
                          {deletingOfferingId === offering.id ? "Deleting..." : "Delete"}
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

export default Sections;
