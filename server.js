'use strict';

// TEMP: Simple In-Memory Database

const express = require('express');
const data = require('./db/notes');
const {PORT} = require('./config');
const simDB = require('./db/simDB'); 
const notes = simDB.initialize(data);

const app = express();
app.use(express.static('public'));

function requestLogger(req, res, next){
  const now = new Date();
  console.log(`${now.toLocaleDateString()} ${now.toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
}
app.use(requestLogger);

app.get('/api/notes', (req, res) => {
  const {searchTerm} = req.query;
  if (searchTerm){
    const newData = data.filter(item => item.title.includes(searchTerm));
    res.json(newData);
  } else {
    res.json(data);
  }
});

app.get('/api/notes/:id', (req, res) => {
  const {id} = req.params;
  let newData = data.find(item => item.id === parseInt(id));
  res.json(newData);
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
