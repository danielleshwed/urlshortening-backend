var express = require('express');
var mongodb = require('mongodb');
var shortid = require('shortid');
var validUrl = require('valid-url');

var router = express.Router();
var mLab = "mongodb://danielleshwed:URLPassword1@ds239359.mlab.com:39359/urlshortener";
var MongoClient = mongodb.MongoClient;

// var mongoose = require('mongoose');
//
// mongoose.connect("mongodb://localhost:27017/url-shortener");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/details', function(req, res, next) {
  res.json({ ip: req.connection.remoteAddress, browser: req.header('user-agent'), date: new Date(Date.now()).toLocaleString(), })
})

router.get('/:short', function (req, res, next) {
  MongoClient.connect(mLab, (err, database) => {
    if (err) {
      console.log("Cannot connect to Server", err);
    } else {
      console.log("Connected")
    }

    const db = database.db('urlshortener');
    var collection = db.collection('links');
    var params = req.params.short;

    var findLink = function (db, callback) {
      collection.findOne({ "short": params }, { url: 1, _id: 0 }, function (err, doc) {
        if (doc != null) {
          res.redirect(doc.url);
        } else {
          res.json({ error: "No shortlinks matched"})
        };
      })
    }
    findLink(db, function () {
      db.close();
    });
  });
});

router.get('/new/:url(*)', function (req, res, next) {
  MongoClient.connect(mLab, (err, database) => {
    if (err) {
      console.log("Cannot Connect to Server", err);
    } else {
      console.log("Connected")

      const db = database.db('urlshortener');
      var collection = db.collection('links');
      var params = req.params.url;

      var newLink = function (db, callback) {
        if (validUrl.isUri(params)) {
          var shortCode = shortid.generate();
          var newUrl = { url: params, short: shortCode };
          collection.insert([newUrl]);
          res.json({ original_url: params, short_url: "localhost:8080/" + shortCode });
        } else {
          res.json({ error: "Something is wrong with the URL you provided" });
        };
      };

      newLink(db, function () {
        db.close();
      });
    };
  });
});

module.exports = router;
