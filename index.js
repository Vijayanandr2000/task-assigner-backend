const express = require("express");
const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cors = require("cors");
const JWT = require("jsonwebtoken");
const auth = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const DBURL =
  "mongodb+srv://vijay:FAmENTazi1xBAUjS@cluster0.ceeao.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const SK = "0ieKHIm2jlI0BI4G";

const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;
const PORT = process.env.PORT || 8000;
const DB_URL = DBURL || "mongodb://127.0.0.1:27017";

app.get("/", (req, res) => {
  res.send("APP is working");
});

app.post("/student", async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const user = await db
      .collection("student")
      .findOne({ mail: req.body.mail });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    if (user) {
      res.json({ message: "Email already Exists" });
    }
    db.collection("student").insertOne({
      name: req.body.name,
      mail: req.body.mail,
      password: hash,
    });
    res.status(200).json({ message: "Registered" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/staff", async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const user = await db.collection("staff").findOne({ mail: req.body.mail });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    if (user) {
      res.json({ message: "Email already Exists" });
    }
    db.collection("staff").insertOne({
      name: req.body.name,
      mail: req.body.mail,
      password: hash,
    });
    res.status(200).json({ message: "Registered" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/home", async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const userStu = await db
      .collection("student")
      .findOne({ mail: req.body.mail });

    const userSta = await db
      .collection("staff")
      .findOne({ mail: req.body.mails });
    if (userStu) {
      var compare = await bcrypt.compare(req.body.password, userStu.password);
      if (compare) {
        var stuToken = JWT.sign({ mail: userStu.mail }, SK);
        res
          .header("authorization", stuToken)
          .json({ message: "Stu allow", stuToken, userStu });
      } else {
        res.status(400).json({ message: "Password Incorrect", userStu });
      }
    }
    if (userSta) {
      var compare = await bcrypt.compare(req.body.passwords, userSta.password);
      if (compare) {
        var staToken = JWT.sign({ mail: userSta.mail }, SK);
        res
          .header("authorization", staToken)
          .json({ message: "Sta allow", staToken, userSta });
      } else {
        res.status(400).json({ message: "Password Incorrect", userSta });
      }
    } else {
      res.status(400).json({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/post", auth, async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const user = await db.collection("post").insertOne({
      title: req.body.title,
      description: req.body.des,
    });

    res.status(200).json({ message: "Posted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/post", auth, async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const user = await db.collection("post").find().toArray();

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/submit", auth, async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const user = await db
      .collection("post")
      .findOne({ _id: objectId(req.body.id) });
    const title = user.title;
    var data = {
      name: req.body.name,
      mail: req.body.mail,
      status: req.body.status,
      title: title,
    };
    await db.collection("submitList").insertOne(data);

    res.status(200).json({ message: "Submited Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/submitData", auth, async (req, res) => {
  try {
    const client = await mongoClient.connect(DB_URL);
    const db = client.db("Task");
    const user = await db.collection("submitList").find().toArray();

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is woring in port ${PORT}`);
});
