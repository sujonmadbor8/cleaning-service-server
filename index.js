const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectID;
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const port = 5000;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zvuaj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

app.get("/", (req, res) => res.send("Hello, Sujon Madbor"));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const database = client.db("cleaningService");
  const serviceCollection = database.collection("services");
  const reviewCollection = database.collection("reviews");
  const adminCollection = database.collection("admins");
  // review
  app.post("/addReview", (req, res) => {
    const name = req.body.name;
    const designation = req.body.designation;
    const description = req.body.description;
    const rating = req.body.rating;
    const pic = req.files.image;
    const picData = pic.data;
    const encodedPic = picData.toString("base64");

    const imageBuffer = Buffer.from(encodedPic, "base64");

    const review = {
      name,
      designation,
      description,
      rating,
      image: imageBuffer,
    };

    reviewCollection.insertOne({ review }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // admin
  app.post("/addAdmin", (req, res) => {
    const email = req.body.email;

    adminCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/admins", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/isAdmin", (req, res) => {
    const email = req.body.email;
    console.log(email);
    adminCollection.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });

  // service
  app.post("/addService", (req, res) => {
    const pic = req.files.image;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const picData = pic.data;
    const encodedPic = picData.toString("base64");

    const imageBuffer = Buffer.from(encodedPic, "base64");
    const service = {
      title,
      description,
      price,
      image: imageBuffer,
    };

    serviceCollection.insertOne({ service }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // delete
  app.delete("/delete/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});

app.listen(process.env.PORT || port);
