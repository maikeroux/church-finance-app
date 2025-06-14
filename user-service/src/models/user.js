const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String, // hashed
  role: { type: String, enum: ["SuperAdmin", "Admin", "Viewer"], default: "Viewer" }
});

module.exports = mongoose.model("User", userSchema);
