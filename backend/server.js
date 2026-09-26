const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const postsRoutes = require("./routes/posts");
const leadsRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");
const interacoesRoutes = require("./routes/interacoes");
const usuariosRoutes = require("./routes/usuarios");
const perfilUserRoutes = require("./routes/perfilUser");
const postsSalvosRoutes = require("./routes/postsSalvos");


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/posts", postsRoutes);
app.use("/leads", leadsRoutes);
app.use("/auth", authRoutes);
app.use("/interacoes", interacoesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/perfil", perfilUserRoutes);
app.use("/salvos", postsSalvosRoutes);



app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://psifacil-blog.onrender.com/</loc>
  </url>

  <url>
    <loc>https://psifacil-blog.onrender.com/psifacil.html</loc>
  </url>

  <url>
    <loc>https://psifacil-blog.onrender.com/conteudo.html</loc>
  </url>

  <url>
    <loc>https://psifacil-blog.onrender.com/ebooks.html</loc>
  </url>

  <url>
    <loc>https://psifacil-blog.onrender.com/escuta.html</loc>
  </url>

</urlset>`);
});


app.get("/robots.txt", (req, res) => {
  res.type("text/plain");

  res.send(`User-agent: *
Allow: /

Sitemap: https://psifacil-blog.onrender.com/sitemap.xml`);
});



app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/psifacil.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});