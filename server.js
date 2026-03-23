const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

app.use(session({
  secret: "medicine-secret",
  resave: false,
  saveUninitialized: true
}));

const USERS = "users.json";
const MEDICINES = "medicines.json";

/* ---------------- USER AUTH ---------------- */

app.post("/api/register", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS));
  users.push(req.body);
  fs.writeFileSync(USERS, JSON.stringify(users, null, 2));
  res.json({ message: "Registered successfully" });
});

app.post("/api/login", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS));
  const user = users.find(
    u => u.email === req.body.email && u.password === req.body.password
  );

  if (user) {
    req.session.user = user.email;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login.html");
});

/* ---------------- MEDICINES ---------------- */

app.get("/api/medicines", (req, res) => {
  const meds = JSON.parse(fs.readFileSync(MEDICINES));
  res.json(meds);
});

app.post("/api/medicines", (req, res) => {
  const meds = JSON.parse(fs.readFileSync(MEDICINES));
  meds.push({ ...req.body, taken: false });
  fs.writeFileSync(MEDICINES, JSON.stringify(meds, null, 2));
  res.json({ message: "Added" });
});

app.post("/api/taken/:name", (req, res) => {
  let meds = JSON.parse(fs.readFileSync(MEDICINES));
  meds = meds.map(m =>
    m.name === req.params.name ? { ...m, taken: true } : m
  );
  fs.writeFileSync(MEDICINES, JSON.stringify(meds, null, 2));
  res.json({ message: "Marked taken" });
});

app.listen(PORT, () => console.log("Server running"));