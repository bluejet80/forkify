import 'core-js/stable';
import 'regenerator-runtime';
import * as model from './model';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarkView from './views/bookmarkView';
import addRecipeView from './views/addRecipeView';

// API Link
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return; // guard clause
    recipeView.renderSpinner();

    // 0) Results View to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    // 1 ) updating Bookmarks
    bookmarkView.update(model.state.bookmarks);

    // 2) Load recipe
    await model.loadRecipe(id);

    // 3) Render recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(`${err}`);
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

//subscriber
const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add or remove book mark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // update recipe view

  recipeView.update(model.state.recipe);

  //render book marks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading Spinner
    addRecipeView.renderSpinner();
    //Upload new Recipe Data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //Render Recipe
    recipeView.render(model.state.recipe);
    //Display Success Message
    addRecipeView.renderMessage();
    //Render Bookmark View
    bookmarkView.render(model.state.bookmarks);
    // Change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close Form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

// subscriber
const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addhandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};
init();
