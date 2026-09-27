require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());


// ======================================
// MYSQL CONNECTION
// ======================================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// ======================================
// TEST MYSQL CONNECTION
// ======================================

async function testDatabase() {
  try {
    const connection = await db.getConnection();

    console.log("MySQL database connected successfully!");

    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:");
    console.error(error.message);
  }
}

testDatabase();


// ======================================
// TEST ROUTE
// ======================================

app.get("/", (req, res) => {
  res.send("Corporate Facility Management Backend is running!");
});


// ======================================
// LOGIN API
// ======================================

app.post("/api/login", async (req, res) => {

  const { username, password, role } = req.body;

  try {

    const [users] = await db.execute(
      `SELECT id, username, role
       FROM users
       WHERE username = ?
       AND password = ?
       AND role = ?`,
      [username, password, role]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid username, password, or role."
      });
    }

    res.json({
      message: "Login successful!",
      user: {
        id: users[0].id,
        username: users[0].username,
        role: users[0].role
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Database error during login."
    });

  }
});


// ======================================
// GET ALL ISSUES
// ======================================

app.get("/api/issues", async (req, res) => {

  try {

    const [issues] = await db.execute(
      "SELECT * FROM issues ORDER BY id DESC"
    );

    res.json(issues);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Could not fetch issues."
    });

  }

});


// ======================================
// SUBMIT NEW ISSUE
// ======================================

// ======================================
// SUBMIT NEW ISSUE
// ======================================

app.post("/api/issues", async (req, res) => {

  const {
    service,
    description,
    location,
    priority,
    employeeId
  } = req.body;

  try {

    const [result] = await db.execute(
      `INSERT INTO issues
       (service, description, location, priority, status, assignedStaff, employeeId)
       VALUES (?, ?, ?, ?, 'Pending', 'Not Assigned', ?)`,
      [
        service,
        description,
        location,
        priority,
        employeeId
      ]
    );

    const [newIssue] = await db.execute(
      "SELECT * FROM issues WHERE id = ?",
      [result.insertId]
    );

    console.log("New Issue Added:");
    console.log(newIssue[0]);

    res.json({
      message: "Issue submitted successfully!",
      issue: newIssue[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Could not submit issue."
    });

  }

});


// ======================================
// UPDATE ISSUE STATUS
// ======================================

app.put("/api/issues/:id", async (req, res) => {

  const id = Number(req.params.id);
  const { status } = req.body;

  try {

    const [result] = await db.execute(
      `UPDATE issues
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Issue not found."
      });

    }

    const [updatedIssue] = await db.execute(
      "SELECT * FROM issues WHERE id = ?",
      [id]
    );

    res.json({
      message: "Issue status updated!",
      issue: updatedIssue[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Could not update issue status."
    });

  }

});


// ======================================
// ASSIGN STAFF
// ======================================

app.put("/api/issues/:id/staff", async (req, res) => {

  const id = Number(req.params.id);
  const { assignedStaff } = req.body;

  try {

    const [result] = await db.execute(
      `UPDATE issues
       SET assignedStaff = ?
       WHERE id = ?`,
      [assignedStaff, id]
    );

    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Issue not found."
      });

    }

    const [updatedIssue] = await db.execute(
      "SELECT * FROM issues WHERE id = ?",
      [id]
    );

    res.json({
      message: "Staff assigned successfully!",
      issue: updatedIssue[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Could not assign staff."
    });

  }

});


// ======================================
// START SERVER
// ======================================

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});