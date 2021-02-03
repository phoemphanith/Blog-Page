//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const _ = require("lodash");
const { response } = require("express");

mongoose.connect("mongodb://localhost:27017/blogPageDb", { useNewUrlParser: true, useUnifiedTopology: true });
//TODO: create post schema
const postschema = new mongoose.Schema({
  title: String,
  paragraph: String,
  image: String,
});
const Post = mongoose.model("Post", postschema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//TODO: create storage
const helpers = require("./controller/helper.js");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

let allPost = [];

app.get("/", function (req, res) {
  const homeStartingContent =
    "I learned that we can do anything, but we can't do everything... at least not at the same time. So think of your priorities not in terms of what activities you do, but when you do them. Timing is everything. By Dan Millman";
  Post.find({}, (err, posts) => {
    if (!err) {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  console.log(req.body);
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single("profile_pic");
  upload(req, res, function (err) {
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }
    const post = new Post({
      title: req.body.postTitle,
      image: req.file.path.slice(15),
      paragraph: req.body.postBody,
    });
    post.save((err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  });
});

app.get("/posts/:postId", function (req, res) {
  const requestedId = req.params.postId;

  Post.findById({ _id: requestedId }, (err, post) => {
    if (!err) {
      res.render("post", {
        title: post.title,
        image: post.image,
        content: post.paragraph,
      });
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
