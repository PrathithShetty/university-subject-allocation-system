import React, { useEffect, useState } from "react";

import preferenceService from "../services/preferenceService";
import academicService from "../services/academicService";

import "./PreferenceCycles.css";


function PreferenceCycles() {

  const [cycles, setCycles] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    academic_year: "",
    start_date: "",
    end_date: "",
    status: "DRAFT",
  });


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [cyclesData, yearsData] = await Promise.all([
        preferenceService.getPreferenceCycles(),
        academicService.getAcademicYears(),
      ]);

      setCycles(cyclesData);
      setAcademicYears(yearsData);

    } catch (err) {

      console.error(err);

      setError(
        "Failed to load preference cycle data."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadData();

  }, []);


  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setError("");
      setSuccess("");

      if (
        !formData.name ||
        !formData.academic_year ||
        !formData.start_date ||
        !formData.end_date
      ) {

        setError(
          "Please fill in all required fields."
        );

        return;

      }


      await preferenceService.createPreferenceCycle({
        name: formData.name,
        academic_year: Number(formData.academic_year),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      });


      setSuccess(
        "Preference cycle created successfully."
      );


      setFormData({
        name: "",
        academic_year: "",
        start_date: "",
        end_date: "",
        status: "DRAFT",
      });


      setShowForm(false);

      await loadData();

    } catch (err) {

      console.error(err);

      if (err.response?.data) {

        const data = err.response.data;

        const messages = Object.entries(data)
          .map(([field, value]) => {
            return `${field}: ${Array.isArray(value) ? value.join(", ") : value}`;
          })
          .join(" | ");

        setError(
          messages || "Failed to create preference cycle."
        );

      } else {

        setError(
          "Failed to create preference cycle."
        );

      }

    }

  };


  const getStatusClass = (status) => {

    if (status === "OPEN") {
      return "status-open";
    }

    if (status === "CLOSED") {
      return "status-closed";
    }

    return "status-draft";

  };


  return (

    <div className="preference-cycles-page">

      <div className="page-header">

        <div>

          <h1>
            Preference Cycles
          </h1>

          <p>
            Manage faculty preference submission cycles.
          </p>

        </div>


        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
        >

          {showForm
            ? "Cancel"
            : "+ Create Preference Cycle"}

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


      {showForm && (

        <div className="form-card">

          <h2>
            Create Preference Cycle
          </h2>


          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: 2026-2027 Faculty Preferences"
                />

              </div>


              <div className="form-group">

                <label>
                  Academic Year *
                </label>

                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
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


              <div className="form-group">

                <label>
                  Start Date *
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>
                  End Date *
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="OPEN">
                    Open
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>

                </select>

              </div>

            </div>


            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
              >
                Create Cycle
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      <div className="table-card">

        <div className="table-header">

          <h2>
            Preference Cycles
          </h2>

          <span>
            {cycles.length} cycle{cycles.length !== 1 ? "s" : ""}
          </span>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading preference cycles...
          </div>

        ) : cycles.length === 0 ? (

          <div className="empty-state">
            No preference cycles found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Academic Year
                  </th>

                  <th>
                    Start Date
                  </th>

                  <th>
                    End Date
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {cycles.map((cycle, index) => (

                  <tr key={cycle.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td className="cycle-name">
                      {cycle.name}
                    </td>

                    <td>
                      {academicYears.find(
                        (year) =>
                          year.id === cycle.academic_year
                      )?.year_name || cycle.academic_year}
                    </td>

                    <td>
                      {cycle.start_date}
                    </td>

                    <td>
                      {cycle.end_date}
                    </td>

                    <td>

                      <span
                        className={`status-badge ${getStatusClass(
                          cycle.status
                        )}`}
                      >
                        {cycle.status}
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


export default PreferenceCycles;