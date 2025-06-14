const express = require("express");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const app = express();
app.use(express.json());

const sequelize = new Sequelize(process.env.PG_URI);

sequelize.authenticate()
  .then(() => console.log("Postgres connected"))
  .catch(err => console.error("DB Error:", err));

app.get("/", (req, res) => res.send("Finance Service Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Finance Service on port ${PORT}`));
