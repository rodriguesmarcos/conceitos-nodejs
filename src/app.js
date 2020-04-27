const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const validateId = (request, response, next) => {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid repository id" });
  }

  const repoIndex = repositories.findIndex((repo) => repo.id === id);
  if (repoIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  request.repoIndex = repoIndex;

  return next();
};

app.use("/repositories/:id", validateId);

const repositories = [];

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
    ? repositories.filter((repo) =>
        repo.title.toLowerCase().includes(title.toLowerCase())
      )
    : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repository = {
    ...repositories[request.repoIndex],
    id,
    title,
    url,
    techs,
  };

  repositories[request.repoIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  repositories[request.repoIndex].likes++;

  return response.json({ likes: repositories[request.repoIndex].likes });
});

module.exports = app;
