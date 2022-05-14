const express = require("express");
const NodeCache = require("node-cache");
const axios = require("axios");
const apiContext = require("./api");
const url = require("url");
const dotenv = require("dotenv");
const utils = require("./util");
dotenv.config();

const app = express();

app.use(express.json()); // to accept json data

const cache = new NodeCache({ stdTTL: 0 });

const verifyCache = (req, res, next) => {
  try {
    const { search } = url.parse(req.url, true).query;
    if (cache.has(search)) {
      return res.status(200).json(cache.get(search));
    }
    return next();
  } catch (err) {
    throw new Error(err);
  }
};

app.get("/api/anything/get-cache", (req, res) => {
  return res.json(cache.keys());
});

app.get("/api/anything/clear-cache", (req, res) => {
  cache.flushAll();
  return res.json({ message: "Cache cleared." });
});

app.get("/api/anything", verifyCache, async (req, res) => {
  const { search, fuzzy } = url.parse(req.url, true).query;
  try {
    const API_KEY = req.get("API_KEY");
    let url = apiContext.anythingContext;
    if (!API_KEY) {
      return res
        .status(400)
        .json({ status: 400, message: "API_KEY not provided in headers." });
    }
    url = url + `key=${API_KEY}`;
    if (search !== undefined) {
      url = url + `&search=${search}`;
    }
    if (fuzzy !== undefined) {
      url = url + `&fuzzy=${fuzzy}`;
    }
    const { data } = await axios.get(url);
    const sanitizedList = utils.sanitizeData(data);
    cache.set(search, sanitizedList);
    return res.status(200).json(sanitizedList);
  } catch (error) {
    return res.status(error.response.status).json(error.response.data);
  }
});

app.get("*", (req, res) => {
  res.status(500).json({ message: "error" });
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

start(process.env.PORT || 3333);
