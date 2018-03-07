'use strict';

// TEMP: Simple In-Memory Database

const express = require('express');
const morgan = require('morgan');
const data = require('./db/notes');
const {PORT} = require('./config');
const simDB = require('./db/simDB'); 

const notes = simDB.initialize(data);

const app = express();

app.use(morgan('dev'));

app.use(express.static('public'));
app.use(express.json());


app.get('/api/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  
  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err);
    }
    res.json(list);
  });
});

app.get('/api/notes/:id', (req, res, next) => {
  const {id} = req.params;
  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

app.put('/api/notes/:id', (req, res, next) => {
  const {id} = req.params;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});


app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

app.use(function(req, res, next){
  let err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({message: 'Not Found'});
  next(err);
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    message:err.message,
    error: err
  });
});


app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
