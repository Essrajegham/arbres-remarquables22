const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

router.get("/admin-only", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Bienvenue admin, cette page est réservée !" });
});

router.get("/user-or-admin", verifyToken, authorizeRoles("user", "admin"), (req, res) => {
  res.json({ message: "Page accessible aux utilisateurs et aux admins." });
});

module.exports = router;
