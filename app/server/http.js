var express = require('express');
// jshint camelcase:false
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
var getIpFromRequest = require('ipware')().get_ip;
// jshint camelcase:true
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

var geoid = require('./geoid');
var weatherAPI = require('./weather');


var router = express.Router();

router.get('/', function (req, res) {
    var clientIp = getIpFromRequest(req).clientIp;

    geoid.getGeoidByIp(clientIp).done(function (geoid) {
        res.render('index', {data: {geoid: geoid}});

    }, function (error) {
        console.error(error);
        res.sendStatus(500);

    });
});


module.exports.router = router;