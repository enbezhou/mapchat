var express = require('express');
var userDB = require('../userDB');
var router = express.Router();
// TODO will save userList in DB or cache

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.get('/register/:id', function(req, res, next) {
  userDB.userList.push(req.params.id);
  res.send(userDB);
});

router.get('/list', function(req, res, next) {
  res.send(userDB.userList);
});

/* GET users listing. */
router.post('/register', function(req, res, next) {
  if (req.body.uuid) {
    var duplicatedUsers = userDB.userList.filter(function (item, index) {
      return item.uuid == req.body.uuid;
    });
    if (duplicatedUsers.length == 0) {
      userDB.userList.push(req.body);
    }
  }
  console.log("register:" + req.body.uuid);
  res.send(userDB);
});

module.exports = router;
