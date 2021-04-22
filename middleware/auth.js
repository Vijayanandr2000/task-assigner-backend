const JWT = require("jsonwebtoken");
const mongodb = require("mongodb");

const DBURL =
  "mongodb+srv://vijay:FAmENTazi1xBAUjS@cluster0.ceeao.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const SK = "0ieKHIm2jlI0BI4G";

const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;
const DB_URL = DBURL || "mongodb://127.0.0.1:27017";

module.exports = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;
    // console.log(bearer, JWT_SK);
    if (!bearer) {
      return res.json({
        message: "You must Logged In",
      });
    }
    JWT.verify(bearer, SK, async (err, payload) => {
      if (!err) {
        // const id = payload.id;

        // const client = await mongoClient.connect(DB_URL);
        // const db = client.db("user");
        // const user = await db.collection("user").findOne({ _id: objectId(id) });
        // req.user = user;
        // console.log(user);
        // users = user;
        next();
      } else {
        console.log(err);
        res.json({
          message: "You must Logged In",
        });
      }
    });
  } catch (error) {
    return res.json({
      message: "Authentication Failed",
    });
  }
};
