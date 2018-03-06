'use strict';

// TEMP: Simple In-Memory Database

const express = require('express');
const data = require('./db/notes');

const app = express();
app.use(express.static('public'));

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

app.listen(8080, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
