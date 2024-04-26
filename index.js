const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

// Middleware para analisar corpos de requisições
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database(":memory:");

// Criação das tabelas
db.serialize(() => {
  db.run(
    "CREATE TABLE Funcionario (id_funcionario INTEGER PRIMARY KEY, nome TEXT, email TEXT, senha TEXT)",
  );
  db.run(
    "CREATE TABLE Livro (id_livro INTEGER PRIMARY KEY, titulo TEXT, autor TEXT, preco TEXT, imagem TEXT)",
  );
});

// Model _Funcionario
class Funcionario {
  static create(nome, email, senha, callback) {
    db.run(
      "INSERT INTO Funcionario (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senha],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, this.lastID);
      },
    );
  }
}

// Model _Livro
class Livro {
  static create(titulo, autor, preco, imagem, callback) {
    db.run(
      "INSERT INTO Livro (titulo, autor, preco, imagem) VALUES (?, ?, ?, ?)",
      [titulo, autor, preco, imagem],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, this.lastID);
      },
    );
  }
}

// Rota raiz
app.get("/", (req, res) => {
  res.send("Bem-vindo à API_LIVRARIA!");
});

// Rota para login de funcionário
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  db.get(
    "SELECT * FROM Funcionario WHERE email = ? AND senha = ?",
    [email, senha],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        return res.json({ message: "Login successful" });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    },
  );
});

// Rota para cadastrar funcionário
app.post("/funcionarios", (req, res) => {
  const { nome, email, senha } = req.body;
  Funcionario.create(nome, email, senha, (err, id) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id });
  });
});

// Rota para cadastrar livro
app.post("/livros", (req, res) => {
  const { titulo, autor, preco, imagem } = req.body;
  Livro.create(titulo, autor, preco, imagem, (err, id) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
