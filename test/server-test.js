'use strict';

const app = require('../server');

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
  
});
  
describe('404 handler', function () {
  
  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/bad/path')
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
  
});

describe('Endpoint Tests', function (){



  it('should list all notes', function (){
    return chai.request(app)
      .get('/api/notes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach(function(note) {
          expect(note).to.be.a('object');
          expect(note).to.include.keys(expectedKeys);
        });
      });
  });

  it('should list the specific note with the given id', function(){
    return chai.request(app)
      .get('/api/notes/')
      .then(function(res){
        return chai.request(app)
          .get(`/api/notes/${res.body[0].id}`);
      })
      .then(function(res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        const expectedKeys = ['id', 'title', 'content'];
        expect(res.body).to.include.keys(expectedKeys);
      });
  });

  it('should update the note for the given id', function(){
    const updateItem = {
      'title': 'new title',
      'content': 'new content'
    };
    return chai.request(app)
      .get('/api/notes/')
      .then(function(res){
        updateItem.id = res.body[0].id;
        return chai.request(app)
          .put(`/api/notes/${updateItem.id}`)
          .send(updateItem);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal(updateItem);
      });
  });

  it('should post a new note', function(){
    const newItem = {
      'title': 'new title',
      'content': 'new content'
    };
    return chai.request(app)
      .post('/api/notes/')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        const expectedKeys = ['id', 'title', 'content'];
        expect(res.body).to.include.keys(expectedKeys);
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  it('if a title is not used when posting a note, a 400 should be flagged for missing title',function(){
    const incorrectItem = {};
    return chai.request(app)
      .post('/api/notes')
      .send(incorrectItem)
      .catch(err => err.response)
      .then(function(res){
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal({
          'message': 'Missing `title` in request body',
          'error': {
            'status': 400
          }
        });

      });
  });

  it('should delete a note', function(){
    return chai.request(app)
      .get('/api/notes/')
      .then(function(res){
        return chai.request(app)
          .delete(`/api/notes/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  it('if trying to delete a non existing id, should flag a 400 for incorrect id',function(){
    return chai.request(app)
      .delete('/api/notes/badid')
      .catch(err => err.response)
      .then(function(res){
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal({
          'message': 'Delete Id not matching an id in DB',
          'error': {
            'status': 400
          }
        });

      });
  });
  
});
