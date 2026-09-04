import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import facultyService from "../services/facultyService";
import academicService from "../services/academicService";
import api from "../api/axios";

import "./Faculty.css";

function Faculty() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    joining_date: "",
    max_workload_hours: 18,
    is_active: true,
    department: "",
    designation: "",
  });


  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        facultyData,
        departmentData,
        designationResponse,
      ] = await Promise.all([
        facultyService.getFaculties(),
        academicService.getDepartments(),
        api.get("/staff/designations/"),
      ]);

      const facultyList = Array.isArray(facultyData)
        ? facultyData
        : facultyData?.results || [];

      const departmentList = Array.isArray(departmentData)
        ? departmentData
        : departmentData?.results || [];

      const designationData = designationResponse.data;

      const designationList = Array.isArray(designationData)
        ? designationData
        : designationData?.results || [];

      setFaculties(facultyList);
      setDepartments(departmentList);
      setDesignations(designationList);

    } catch (err) {
      console.error("Failed to load faculty data:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("Unable to load faculty data.");
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      joining_date: "",
      max_workload_hours: 18,
      is_active: true,
      department: "",
      designation: "",
    });

    setEditingFaculty(null);
  };


  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const openAddForm = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowForm(true);
  };


  const openEditForm = (faculty) => {
    setEditingFaculty(faculty);

    setFormData({
      employee_id: faculty.employee_id || "",
      first_name: faculty.first_name || "",
      last_name: faculty.last_name || "",
      email: faculty.email || "",
      phone_number: faculty.phone_number || "",
      joining_date: faculty.joining_date || "",
      max_workload_hours:
        faculty.max_workload_hours || 18,
      is_active: faculty.is_active ?? true,
      department: faculty.department || "",
      designation: faculty.designation || "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const closeForm = () => {
    setShowForm(false);
    resetForm();

    setError("");
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        joining_date: formData.joining_date,
        max_workload_hours: Number(
          formData.max_workload_hours
        ),
        is_active: formData.is_active,
        department: Number(formData.department),
        designation: Number(formData.designation),
      };


      if (editingFaculty) {

        await facultyService.updateFaculty(
          editingFaculty.id,
          payload
        );

        setSuccess(
          "Faculty member updated successfully."
        );

      } else {

        await facultyService.createFaculty(
          payload
        );

        setSuccess(
          "Faculty member created successfully."
        );
      }


      closeForm();

      await loadData();

    } catch (err) {
      console.error(
        "Failed to save faculty:",
        err
      );

      const data = err.response?.data;

      if (data && typeof data === "object") {

        const messages = Object.entries(data)
          .map(([field, message]) => {

            const text = Array.isArray(message)
              ? message.join(", ")
              : message;

            return `${field}: ${text}`;

          })
          .join(" | ");

        setError(
          messages ||
          "Unable to save faculty."
        );

      } else {

        setError(
          "Unable to save faculty."
        );
      }

    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (faculty) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete ${faculty.full_name}?`
    );

    if (!confirmed) {
      return;
    }


    try {

      setDeleting(true);
      setError("");
      setSuccess("");

      await facultyService.deleteFaculty(
        faculty.id
      );

      setSuccess(
        "Faculty member deleted successfully."
      );

      await loadData();

    } catch (err) {

      console.error(
        "Failed to delete faculty:",
        err
      );

      const data = err.response?.data;

      if (data && typeof data === "object") {

        const messages = Object.entries(data)
          .map(([field, message]) => {

            const text = Array.isArray(message)
              ? message.join(", ")
              : message;

            return `${field}: ${text}`;

          })
          .join(" | ");

        setError(
          messages ||
          "Unable to delete faculty."
        );

      } else {

        setError(
          "Unable to delete faculty."
        );
      }

    } finally {

      setDeleting(false);

    }
  };


  return (
    <div className="faculty-page">

      {/* HEADER */}

      <header className="faculty-header">

        <div>

          <h1>
            Faculty Management
          </h1>

          <p>
            Manage university faculty members
          </p>

        </div>


        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

      </header>


      {/* CONTENT */}

      <main className="faculty-content">


        {/* TITLE */}

        <div className="faculty-title-row">

          <div>

            <h2>
              Faculty
            </h2>

            <p>
              {faculties.length} faculty member
              {faculties.length !== 1
                ? "s"
                : ""}
            </p>

          </div>


          <button
            className="add-faculty-button"
            onClick={
              showForm
                ? closeForm
                : openAddForm
            }
          >
            {showForm
              ? "Cancel"
              : "+ Add Faculty"}
          </button>

        </div>


        {/* SUCCESS */}

        {success && (

          <div className="faculty-success">

            {success}

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div className="faculty-error">

            {error}

          </div>

        )}


        {/* FORM */}

        {showForm && (

          <div className="faculty-form-card">

            <h2>

              {editingFaculty
                ? "Edit Faculty"
                : "Add Faculty"}

            </h2>


            <p className="form-description">

              {editingFaculty
                ? "Update the faculty member's information."
                : "Enter the details of the new faculty member."}

            </p>


            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">


                {/* EMPLOYEE ID */}

                <div className="form-group">

                  <label>
                    Employee ID
                  </label>

                  <input
                    type="text"
                    name="employee_id"
                    value={
                      formData.employee_id
                    }
                    onChange={handleChange}
                    placeholder="FAC003"
                    required
                  />

                </div>


                {/* FIRST NAME */}

                <div className="form-group">

                  <label>
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={
                      formData.first_name
                    }
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />

                </div>


                {/* LAST NAME */}

                <div className="form-group">

                  <label>
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={
                      formData.last_name
                    }
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={handleChange}
                    placeholder="faculty@university.com"
                    required
                  />

                </div>


                {/* PHONE */}

                <div className="form-group">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone_number"
                    value={
                      formData.phone_number
                    }
                    onChange={handleChange}
                    placeholder="Phone number"
                  />

                </div>


                {/* JOINING DATE */}

                <div className="form-group">

                  <label>
                    Joining Date
                  </label>

                  <input
                    type="date"
                    name="joining_date"
                    value={
                      formData.joining_date
                    }
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* MAX WORKLOAD */}

                <div className="form-group">

                  <label>
                    Maximum Workload Hours
                  </label>

                  <input
                    type="number"
                    name="max_workload_hours"
                    value={
                      formData.max_workload_hours
                    }
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                  />

                </div>


                {/* DEPARTMENT */}

                <div className="form-group">

                  <label>
                    Department
                  </label>

                  <select
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      (department) => (

                        <option
                          key={department.id}
                          value={department.id}
                        >

                          {department.code
                            ? `${department.code} - ${department.name}`
                            : department.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DESIGNATION */}

                <div className="form-group">

                  <label>
                    Designation
                  </label>

                  <select
                    name="designation"
                    value={
                      formData.designation
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Designation
                    </option>

                    {designations.map(
                      (designation) => (

                        <option
                          key={designation.id}
                          value={designation.id}
                        >

                          {designation.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* ACTIVE */}

                <div className="form-group checkbox-group">

                  <label>

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Faculty is active
                    </span>

                  </label>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >

                  {saving
                    ? editingFaculty
                      ? "Updating..."
                      : "Creating..."
                    : editingFaculty
                      ? "Update Faculty"
                      : "Create Faculty"}

                </button>

              </div>

            </form>

          </div>

        )}


        {/* TABLE */}

        {loading ? (

          <div className="faculty-message">
            Loading faculty...
          </div>

        ) : faculties.length === 0 ? (

          <div className="faculty-message">

            <h3>
              No faculty found
            </h3>

            <p>
              There are currently no faculty
              records in the system.
            </p>

          </div>

        ) : (

          <div className="faculty-table-container">

            <table className="faculty-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Faculty
                  </th>

                  <th>
                    Employee ID
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Joining Date
                  </th>

                  <th>
                    Max Workload
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {faculties.map(
                  (faculty) => (

                    <tr
                      key={faculty.id}
                    >

                      <td>
                        {faculty.id}
                      </td>


                      <td>

                        <div className="faculty-name">

                          <strong>
                            {faculty.full_name}
                          </strong>

                          <span>
                            {faculty.first_name}{" "}
                            {faculty.last_name}
                          </span>

                        </div>

                      </td>


                      <td>
                        {faculty.employee_id}
                      </td>


                      <td>
                        {faculty.email}
                      </td>


                      <td>
                        {
                          faculty.phone_number ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          faculty.joining_date ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          faculty.max_workload_hours
                        }{" "}
                        hrs
                      </td>


                      <td>

                        <span
                          className={
                            faculty.is_active
                              ? "faculty-active"
                              : "faculty-inactive"
                          }
                        >

                          {faculty.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      <td>

                        <div className="faculty-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditForm(
                                faculty
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                faculty
                              )
                            }
                            disabled={deleting}
                          >
                            Delete
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

      </main>

    </div>
  );
}

export default Faculty;