const express = require("express");
const NodeCache = require("node-cache");
const axios = require("axios");

const app = express();
const cache = new NodeCache({ stdTTL: 15 });

const verifyCache = (req, res, next) => {
  try {
    const { id } = req.params;
    if (cache.has(id)) {
      return res.status(200).json(cache.get(id));
    }
    return next();
  } catch (err) {
    throw new Error(err);
  }
};

app.get("/", (req, res) => {
  return res.json({ message: "Hello world 🇵🇹" });
});

app.get("/todos/:id", verifyCache, async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/todos/${id}`
    );
    cache.set(id, data);
    return res.status(200).json(data);
  } catch ({ response }) {
    return res.sendStatus(response.status);
  }
});

const start = (port) => {
  try {
    app.listen(port);
    console.log(`Server started on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit();
  }
};
start(3333);
