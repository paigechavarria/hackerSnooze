"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await storyList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  let star = favoriteStar(story, currentUser)
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${star}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function favoriteStar(story, user) {
  const isFavorite = user.isFavorite(story);
  let starType = '';
  if(isFavorite === true){
    starType = 'fas';
  }
  else {
    starType = 'far';
  }
  return `<span class="star">
            <i class="${starType} fa-star"></i>
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
  let author = $('#author').val();
  let title = $('#title').val();
  let url = $('#url').val();
  let username = currentUser.username;

  const newStory = await storyList.addStory(currentUser, {author, title, url, username})
  
  const addStory = generateStoryMarkup(newStory)
  $('.stories-list').prepend(addStory);
  
}

$('#submitForm').on('submit', submitStory);