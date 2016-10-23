const mongoose = require('mongoose');
const Provider = require('../models/Provider');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.dashboard = (req, res) => {

  Provider.find({}, function(err, providers){
      res.json({"title": "One Roof Dashboard", "providers": providers});
  });
};
