const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => res.send("User Service Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`User Service on port ${PORT}`));
