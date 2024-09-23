const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (role !== "user" && role !== "admin") {
    return res.status(400).json({ message: " must use role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "registration failed " });
        }
        res.status(201).json({ message: "user  successfully registered" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "something error" });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err || results.length === 0) {
        return res
          .status(401)
          .json({ message: "invalid username or password." });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "invalid username or password." });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({ token });
    }
  );
};
