var express = require('express');
var mongodb = require('mongodb');
var shortid = require('shortid');
var validUrl = require('valid-url');

var router = express.Router();
var mLab = "mongodb://localhost:27017/url-shortener";
var MongoClient = mongodb.MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:short', function (req, res, next) {
  MongoClient.connect(mLab, (err, database) => {
    if (err) {
      console.log("Cannot connect to Server", err);
    } else {
      console.log("Connected")
    }

    const db = database.db('url-shortener');
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

      const db = database.db('url-shortener');
      var collection = db.collection('links');
      var params = req.params.url;

      var newLink = function (db, callback) {
        if (validUrl.isUri(params)) {
          var shortCode = shortid.generate();
          var newUrl = { url: params, short: shortCode };
          collection.insert([newUrl]);
          res.json({ original_url: params, short_url: "localhost:3000/" + shortCode });
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
