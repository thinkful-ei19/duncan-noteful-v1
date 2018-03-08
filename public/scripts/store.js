// eslint-disable-next-line no-unused-vars
'use strict';

const store = (function(){
  const deleteNote = function(id){
    this.notes = this.notes.filter(note => note.id !== id);
  };

  return {
    notes: [],
    currentNote: false,
    currentSearchTerm: '',
    deleteNote
  };
  
}());
