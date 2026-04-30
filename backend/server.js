const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const postsRoutes = require("./routes/posts");
const leadsRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");
const interacoesRoutes = require("./routes/interacoes");

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/posts", postsRoutes);
app.use("/leads", leadsRoutes);
app.use("/auth", authRoutes);
app.use("/interacoes", interacoesRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/psifacil.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});