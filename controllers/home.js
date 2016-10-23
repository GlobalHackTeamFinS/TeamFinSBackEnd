const mongoose = require('mongoose');
const Provider = require('../models/Provider');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  // res.render('home', {
  //   title: 'Home'
  // });
  // query = db.runCommand( { geoNear: "providers", near: [-90.2535793, 38.6109042], spherical: true, distanceMultiplier: 3963.2});
  query = Provider.collection.geoNear(parseFloat(req.query.lon), parseFloat(req.query.lat), {spherical: true, maxDistance: 30, distanceMultiplier: 3963.2}, function(err, docs) {
  		if (err){
	 		res.send(err);
	 	} else {
	 		return res.json(docs.results);
	 	}
  });
  // console.log(query);
  // res.send('ooppiesiojdajnfk');
};

exports.dashboard = (req, res) => {

  Provider.find({}, function(err, providers){
      res.json({"title": "One Roof Dashboard", "providers": providers});
  });
};
