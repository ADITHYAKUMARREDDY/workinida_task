const db = require("../db");

exports.bookSeat = (req, res) => {
  const { train_id } = req.body;
  const user_id = req.user.id;

  db.query("start transaction", (err) => {
    if (err) {
      return res.status(500).json({
        message: "transaction failed in start",
      });
    }

    db.query(
      "SELECT available_seats FROM trains WHERE id = ? FOR UPDATE",
      [train_id],
      (err, results) => {
        if (err || results.length === 0) {
          return db.query("ROLLBACK", () => {
            res.status(400).json({
              message: "ttrain not found",
            });
          });
        }

        const availableSeats = results[0].available_seats;
        if (availableSeats <= 0) {
          return db.query("ROLLBACK", () => {
            res.status(400).json({
              message: "no seats available in train",
            });
          });
        }
        db.query(
          "UPDATE trains SET available_seats = available_seats - 1 WHERE id = ?",
          [train_id],
          (err) => {
            if (err) {
              return db.query("ROLLBACK", () => {
                res.status(500).json({
                  message: "fail to change seat availability",
                });
              });
            }

            // Insert booking record
            db.query(
              "INSERT INTO bookings (user_id, train_id, booking_date) VALUES (?, ?, NOW())",
              [user_id, train_id],
              (err) => {
                if (err) {
                  return db.query("ROLLBACK", () => {
                    res.status(500).json({
                      message: "failed to create booking file",
                    });
                  });
                }
                db.query("COMMIT", (err) => {
                  if (err) {
                    return db.query("ROLLBACK", () => {
                      res.status(500).json({
                        message: "commit failed",
                      });
                    });
                  }
                  res.status(200).json({
                    message: "seat booked successfully",
                  });
                });
              }
            );
          }
        );
      }
    );
  });
};

exports.getBookingDetails = (req, res) => {
  const { booking_id } = req.body;
  const user_id = req.user.id;

  db.query(
    "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
    [booking_id, user_id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          message: "booking not found",
        });
      }
      res.status(200).json(results[0]);
    }
  );
};
