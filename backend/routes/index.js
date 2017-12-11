const express = require('express');
const router = express.Router();
const db      = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('express connected');
});

// add player
router.post('/player', (req,res,next) => {
  /*
  Request format:
  {
    "name": "Samee Khan",
    "username": "beardaintweird",
    "games_played": 0,
    "points": 0,
    "table_id": null
  }
  */
  db.Player.create(req.body)
    .then((player) => {
      res.json(player)
    }).catch(err=>res.status(500).json(err))
})
// Add table
router.post('/table', (req,res,next) => {
  /*
  Request format:
  {
    "name": "champsOnly",
    "player_limit": 6
  }
  */
  console.log(req.body);
  db.table.create(req.body)
    .then((table) => {
      res.json(table)
    }).catch(err=>res.status(500).json(err))
})
// Add player to table
router.post('/table/addPlayer', (req,res,next) => {
  /*
  Request format:
  {
    "table_id": 1234,
    "player": "Beardaintweird",
    "player_id": 1
  }
  */
  console.log(req.body);
  db.table.findById(req.body.table_id, {
    attributes: ['id','name','players']
  })
    .then((table) => {
      console.log(table);
      if(!table.players) table.players = [req.body.player]
      else               table.players.push(req.body.player)
      console.log('after push');
      return table.update({
        players: table.players
      },{
        where: {
          id: req.body.table_id
        }
      })
    })
    .then((table) => {
      console.log(table);
      return db.Player.update({
        table_id: req.body.table_id
      }, {
        where: {
          id: req.body.player_id
        }
      })
    })
    .then((player) => {
      if(player) res.json("shuccess")
    }).catch(err=>res.status(500).json(err))
})
// Get tables
router.get('/table', (req,res,next) => {
  db.table.findAll({
    include: [{
      model: db.Player
    }]
  })
    .then((tables) => {
      res.json(tables)
    }).catch(err=>res.status(500).json(err))
})


// Add points
router.post('/points', (req,res,next) => {
  /*
  Request format:
  {
    "points": 2,
  }
  */
  db.Player.findById(req.body.id)
    .then((player) => {
      console.log("player",player);
      return db.Player.update({"points":req.body.points + player.dataValues.points}, {
          where: { "id":req.body.id}
        })
    })
    .then((updated_player) => {
      res.json(updated_player)
    }).catch(err=>res.status(500).json(err))
})
// update games played
router.post('/games_played', (req,res,next) => {
  /*
  Request format:
  {

  }
  */
  db.Player.findById(req.body.id)
  .then((player) => {
    return db.Player.update({"games_played": player.dataValues.games_played + 1}, {
      where: { "id":player.dataValues.id}
    })
  })
    .then((player) => {
      res.json(player)
    }).catch(err=>res.status(500).json(err))
})


module.exports = router;