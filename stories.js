"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  //console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${favoriteStar(story, currentUser)}
      <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitStory(e) {
    e.preventDefault();

    //gathering values from inputs 
    let author = $('#author').val();
    let title = $('#title').val();
    let url = $('#url').val();
    let username = currentUser.username;

    //accessing instance of Story to use addStory function 
    const newStory = await storyList.addStory(currentUser, {author, title, url, username})
    
    //generating story markup and adding that to the top of stories on the page
    const addStory = generateStoryMarkup(newStory)
    $('.stories-list').prepend(addStory);

    //resetting value to be blank after submission
    $('#submitForm :input').val('');

    //adding fancy slide up effect after submission
    $('#submitForm').slideUp('slow');
}

$('#submitForm').on('submit', submitStory)

async function deleteStory(evt) {
  console.debug("deleteStory");

  //accessing closest li of the ol of the target 
  const $closestLi = $(evt.target).closest("li");

  //accessing the set id of the story id
  const storyId = $closestLi.attr("id"); 

  //using story instance to access removeStory function
  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
    putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  //if you have not created any stories then generate this message
  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

function favoriteStar(story, user) {
    let isFavorite = false;
    
    //accessing favorites array of currentUser
    const favs = user.favorites
    
    //looping over favs to set isFavorite to true for favorited stories
    for(let fav of favs){
      if(story.storyId === fav.storyId){
        isFavorite = true;
      }
    }

    //if isFavorite is true set starType to filled in ('fas') or blank ('far')
    let starType = '';
    if(isFavorite){
      starType = 'fas'
    } else {
      starType = 'far'
    }
  
    //generate html for each starType 
    return `<span class="star">
              <i class="${starType} fa-star"></i>
            </span>`;
}


function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();
  //if no stories are favorited generate this message
  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites</h5>");
  } else {
    //loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");

  //returning story that matches the story Id that was clicked
  const story = storyList.stories.find(s => s.storyId === storyId);

  //see if the item is already favorited (checking by presence of star)
  if ($target.hasClass("far")) {
    //currently not a favorite: add to user's fav list and change star
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far");
  } else {
    // currently  a favorite: do the opposite
    await currentUser.deleteFavorite(story);
    $target.closest("i").toggleClass("far fas");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);
