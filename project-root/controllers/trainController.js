const db = require("../db");

exports.addTrain = (req, res) => {
  const { train_id, train_name, source, destination, total_seats } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "You are not allowed to add trains. Only admins can do this.",
    });
  }
  db.query(
    "INSERT INTO trains (id, train_name, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?, ?)",
    [train_id, train_name, source, destination, total_seats, total_seats],
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error while adding train. Try again later." });
      }
      res.status(201).json({ message: "Train added successfully by admin!" });
    }
  );
};
exports.getSeatAvailability = (req, res) => {
  const { source, destination } = req.body;
  db.query(
    "SELECT * FROM trains WHERE source = ? AND destination = ?",
    [source, destination],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Error fetching seat availability. Try again later.",
        });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No trains found for this route." });
      }
      res.status(200).json(results);
    }
  );
};
