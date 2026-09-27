import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // NEW: Store logged-in user's ID
  const [userId, setUserId] = useState(null);

  const [selectedIssue, setSelectedIssue] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Low");

  const [issues, setIssues] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("Ravi");

  const issueTypes = [
    "❄️ AC Issue",
    "⚡ Electrical Issue",
    "🧹 Housekeeping",
    "🏢 Meeting Room",
    "🔐 Security",
    "💻 IT",
  ];

  const staffMembers = ["Ravi", "Kiran", "Sneha", "Priya"];

  // =========================
  // GET ALL ISSUES
  // =========================

  const fetchIssues = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/issues"
      );

      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchIssues();
    }
  }, [isLoggedIn]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (selectedRole) => {
    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      // Store logged-in user's information
      setRole(data.user.role);
      setUserId(data.user.id);
      setIsLoggedIn(true);

    } catch (error) {
      console.error("Login error:", error);
      alert("Could not connect to the server.");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole("");
    setUsername("");
    setPassword("");
    setUserId(null);
  };

  // =========================
  // SUBMIT ISSUE
  // =========================

  const submitIssue = async () => {
    if (!selectedIssue) {
      alert("Please select an issue type.");
      return;
    }

    if (!description || !location) {
      alert("Please enter description and location.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/issues",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service: selectedIssue,
            description,
            location,
            priority,

            // NEW: Send logged-in employee ID
            employeeId: userId,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      setDescription("");
      setLocation("");
      setPriority("Low");
      setSelectedIssue("");

      fetchIssues();

    } catch (error) {
      console.error(error);
      alert("Could not connect to the server.");
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/issues/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);
      fetchIssues();

    } catch (error) {
      console.error(error);
      alert("Could not update status.");
    }
  };

  // =========================
  // ASSIGN STAFF
  // =========================

  const assignStaff = async (id, assignedStaff) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/issues/${id}/staff`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignedStaff,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);
      fetchIssues();

    } catch (error) {
      console.error(error);
      alert("Could not assign staff.");
    }
  };

  // =========================
  // STAFF ISSUES
  // =========================

  const staffIssues = issues.filter(
    (issue) => issue.assignedStaff === selectedStaff
  );

  // =========================
  // EMPLOYEE ISSUES
  // =========================

  const employeeIssues = issues.filter(
    (issue) => Number(issue.employeeId) === Number(userId)
  );

  // =========================
  // LOGIN PAGE
  // =========================

  if (!isLoggedIn) {
    return (
      <div className="login-page">

        <div className="login-box">

          <h1>Corporate Facility Management</h1>

          <p>
            Login to access the facility management system
          </p>

          <h2>Login</h2>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <h3>Select Your Role</h3>

          <button
            onClick={() =>
              handleLogin("Employee")
            }
          >
            👩‍💻 Login as Employee
          </button>

          <button
            onClick={() =>
              handleLogin("Admin")
            }
          >
            👨‍💼 Login as Admin
          </button>

          <button
            onClick={() =>
              handleLogin("Staff")
            }
          >
            👨‍🔧 Login as Staff
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app">

      {/* HEADER */}

      <header>

        <div>
          <h1>
            Corporate Facility Management
          </h1>

          <p>
            Logged in as:{" "}
            <strong>{role}</strong>
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main>

        {/* =========================
            EMPLOYEE
        ========================= */}

        {role === "Employee" && (
          <>
            <h2>Employee Services</h2>

            <div className="issue-container">

              {issueTypes.map((issue) => (
                <div
                  className="issue-card"
                  key={issue}
                  onClick={() =>
                    setSelectedIssue(issue)
                  }
                >
                  {issue}
                </div>
              ))}

            </div>

            {selectedIssue && (
              <div className="issue-form">

                <h2>
                  Raise {selectedIssue}
                </h2>

                <label>
                  Description
                </label>

                <textarea
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />

                <label>
                  Location
                </label>

                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                />

                <label>
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <button
                  onClick={submitIssue}
                >
                  Submit Issue
                </button>

              </div>
            )}

            {/* EMPLOYEE ISSUE DASHBOARD */}

            <section className="dashboard">

              <h2>My Issues</h2>

              {employeeIssues.length === 0 ? (
                <p className="no-issues">
                  You have not submitted any issues yet.
                </p>
              ) : (
                <div className="issue-list">

                  {employeeIssues.map((issue) => (
                    <div
                      className="issue-item"
                      key={issue.id}
                    >

                      <h3>
                        {issue.service}
                      </h3>

                      <p>
                        <strong>
                          Description:
                        </strong>{" "}
                        {issue.description}
                      </p>

                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {issue.location}
                      </p>

                      <p>
                        <strong>
                          Priority:
                        </strong>{" "}
                        {issue.priority}
                      </p>

                      <p>
                        <strong>
                          Assigned Staff:
                        </strong>{" "}
                        {issue.assignedStaff}
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        {issue.status}
                      </p>

                    </div>
                  ))}

                </div>
              )}

            </section>
          </>
        )}

        {/* =========================
            ADMIN
        ========================= */}

        {role === "Admin" && (
          <section className="admin-dashboard">

            <h2>
              👨‍💼 Admin Dashboard
            </h2>

            {issues.length === 0 ? (
              <p>No issues available.</p>
            ) : (
              <div className="admin-list">

                {issues.map((issue) => (
                  <div
                    className="admin-item"
                    key={issue.id}
                  >

                    <h3>
                      {issue.service}
                    </h3>

                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {issue.description}
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>{" "}
                      {issue.location}
                    </p>

                    <p>
                      <strong>
                        Priority:
                      </strong>{" "}
                      {issue.priority}
                    </p>

                    <p>
                      <strong>
                        Employee ID:
                      </strong>{" "}
                      {issue.employeeId || "Not Available"}
                    </p>

                    <p>
                      <strong>
                        Assigned Staff:
                      </strong>{" "}
                      {issue.assignedStaff}
                    </p>

                    <label>
                      Assign Staff
                    </label>

                    <select
                      value={issue.assignedStaff}
                      onChange={(e) =>
                        assignStaff(
                          issue.id,
                          e.target.value
                        )
                      }
                    >

                      <option value="Not Assigned">
                        Select Staff
                      </option>

                      {staffMembers.map(
                        (staff) => (
                          <option
                            key={staff}
                            value={staff}
                          >
                            {staff}
                          </option>
                        )
                      )}

                    </select>

                    <label>
                      Update Status
                    </label>

                    <select
                      value={issue.status}
                      onChange={(e) =>
                        updateStatus(
                          issue.id,
                          e.target.value
                        )
                      }
                    >

                      <option>
                        Pending
                      </option>

                      <option>
                        Assigned
                      </option>

                      <option>
                        In Progress
                      </option>

                      <option>
                        Resolved
                      </option>

                    </select>

                  </div>
                ))}

              </div>
            )}

          </section>
        )}

        {/* =========================
            STAFF
        ========================= */}

        {role === "Staff" && (
          <section className="staff-dashboard">

            <h2>
              👨‍🔧 Staff Dashboard
            </h2>

            <div className="staff-selector">

              <label>
                Select Staff
              </label>

              <select
                value={selectedStaff}
                onChange={(e) =>
                  setSelectedStaff(
                    e.target.value
                  )
                }
              >

                {staffMembers.map(
                  (staff) => (
                    <option
                      key={staff}
                      value={staff}
                    >
                      {staff}
                    </option>
                  )
                )}

              </select>

            </div>

            <h3>
              Issues assigned to{" "}
              {selectedStaff}
            </h3>

            {staffIssues.length === 0 ? (
              <p className="no-issues">
                No issues assigned to{" "}
                {selectedStaff}.
              </p>
            ) : (
              <div className="staff-list">

                {staffIssues.map(
                  (issue) => (
                    <div
                      className="staff-item"
                      key={issue.id}
                    >

                      <h3>
                        {issue.service}
                      </h3>

                      <p>
                        <strong>
                          Description:
                        </strong>{" "}
                        {issue.description}
                      </p>

                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {issue.location}
                      </p>

                      <p>
                        <strong>
                          Priority:
                        </strong>{" "}
                        {issue.priority}
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        {issue.status}
                      </p>

                      <button
                        onClick={() =>
                          updateStatus(
                            issue.id,
                            "Resolved"
                          )
                        }
                      >
                        Mark as Resolved
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </section>
        )}

      </main>

    </div>
  );
}

export default App;