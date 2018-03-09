/* global $ store api */
'use strict';

const noteful = (function () {

  function render() {

    const notesList = generateNotesList(store.notes, store.currentNote);
    $('.js-notes-list').html(notesList);

    const editForm = $('.js-note-edit-form');
    editForm.find('.js-note-title-entry').val(store.currentNote.title);
    editForm.find('.js-note-content-entry').val(store.currentNote.content);
  }

  /**
   * GENERATE HTML FUNCTIONS
   */
  function generateNotesList(list, currentNote) {
    const listItems = list.map(item => `
    <li data-id="${item.id}" class="js-note-element ${currentNote.id === item.id ? 'active' : ''}">
      <a href="#" class="name js-note-show-link">${item.title}</a>
      <button class="removeBtn js-note-delete-button">X</button>
    </li>`);
    return listItems.join('');
  }

  /**
   * HELPERS
   */
  function getNoteIdFromElement(item) {
    const id = $(item).closest('.js-note-element').data('id');
    return id;
  }

  /**
   * EVENT LISTENERS AND HANDLERS
   */
  function handleNoteItemClick() {
    $('.js-notes-list').on('click', '.js-note-show-link', event => {
      event.preventDefault();

      const noteId = getNoteIdFromElement(event.currentTarget);

      api.details(noteId)
        .then(detailsResponse => {
          store.currentNote = detailsResponse;
          render();
        });
    });
  }

  function handleNoteSearchSubmit() {
    $('.js-notes-search-form').on('submit', event => {
      event.preventDefault();

      const searchTerm = $('.js-note-search-entry').val();
      store.currentSearchTerm = searchTerm ? { searchTerm } : {};

      api.search(store.currentSearchTerm)
        .then(searchResponse => {
          store.notes = searchResponse;
          render();
        }); 
    });
  }

  function refreshSearchTerm(searchTerm){
    api.search(searchTerm).then(response => {
      store.notes = response;
      render();
    });
  }

  function handleNoteFormSubmit() {
    $('.js-note-edit-form').on('submit', function (event) {
      event.preventDefault();

      const editForm = $(event.currentTarget);

      const noteObj = {
        id: store.currentNote.id,
        title: editForm.find('.js-note-title-entry').val(),
        content: editForm.find('.js-note-content-entry').val()
      };

      if (noteObj.id) {

        api.update(store.currentNote.id, noteObj)
          .then(updateResponse => {
            store.currentNote = updateResponse;
            refreshSearchTerm(store.currentSearchTerm);
          });

      } else {
        
        api.create(noteObj).then(updateResponse => {
          store.currentNote = updateResponse;
          refreshSearchTerm(store.currentSearchTerm);
        });

      }

    });
  }

  function handleNoteStartNewSubmit() {
    $('.js-start-new-note-form').on('submit', event => {
      event.preventDefault();
      store.currentNote = false;
      render();
    });
  }

  function handleNoteDeleteClick() {
    $('.js-notes-list').on('click', '.js-note-delete-button', event => {
      event.preventDefault();

      const noteId = getNoteIdFromElement(event.currentTarget);
      
      api.delete(noteId)
        .then(() => {
          refreshSearchTerm(store.currentNote);
        });

      // My original solution included a new store function, replaced it with ^
      // api.delete(noteId)
      //   .then(() => {
      //     store.deleteNote(noteId);
      //     store.currentNote = false;
      //     render();
      //   });
    });
  }

  function bindEventListeners() {
    handleNoteItemClick();
    handleNoteSearchSubmit();

    handleNoteFormSubmit();
    handleNoteStartNewSubmit();
    handleNoteDeleteClick();
  }

  // This object contains the only exposed methods from this module:
  return {
    render,
    bindEventListeners,
    refreshSearchTerm
  };

}());
