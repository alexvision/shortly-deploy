var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Url.find({}, function(err, links) {
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    return res.send(404);
  }

  db.Url.find({ url: uri }, function(err, link){
    if (link.length > 0) {
      res.send(200, link.attributes);
    } else {
      util.getUrlTitle(uri)
      .then(function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        db.Url.create({
          url: uri,
          base_url: req.headers.origin,
          title: title,
          visits: 0
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.find({ username: username }, function(err, user){
    if(err) {throw err}
    
      util.comparePassword(password, user[0].password, function(match){
        if(match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
        
      })
    
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
    db.User.find({ username: username }, function(err, user){
      if(err) { console.error(err) }
      if (user.length === 0) {
        db.User.create({
          username: username,
          password: password
        }, function(err, user){
          if(err) {console.error(err)}
          util.createSession(req, res, user);
        });
      } else {
        res.redirect('/signup');
      } 
    });
};

exports.navToLink = function(req, res) {
  db.Url.find({ code: req.params[0] }, function(err, link){   
    console.log('this is link', link);
    if (link.length === 0) {
      res.redirect('/');
    } else {
      db.Url.findOneAndUpdate({ code: req.params[0] }, 
        { visits: link[0].visits + 1 },
        {upsert: false}, 
        function(err, numAffected, response){
          return res.redirect(link[0].url);
        }
      )
    }
  });
};