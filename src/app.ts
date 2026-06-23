import expres from "express";

const app = expres();

app.get("/", (req, res) => {
  res.send("Welcome to Auth Service");
});

export default app;
