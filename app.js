/*
Class Description: 
    - This class serves as the main controller for the Spotify CLI application.
    - It implements the search functionality that allows users to search for artists, albums, tracks, 
      and audiobooks using the Spotify Web API.
    - It also provides access to search history and selection history.
    - The class uses the API methods from api.js to interact with the Spotify Web API and 
      the database methods from db.js to persist search and selection history.

Contributors: 
    - Johny Vu
    - Sanskar Thapa
*/

import inquirer from "inquirer"; //library for interactive command line prompts
import * as api from "./api.js"; //custom module for interacting with Spotify API
import * as db from "./db.js"; //custom module for database operations
import path from "path"; //path module for handling file paths
import url from "url"; //url module for handling file URLs

//get current directory in ESM (ECMAScript Modules) - lowkey ass pull, idk
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//define the path to the mock database directory
const dbDirectory = path.resolve(__dirname, "mock_database");

const displayItemDetails = (item, type) => {
  if (type === "artist") {
    console.log(`Artist ${item.name}`);
    console.log(`Followers: ${item.followers.total.toLocaleString()}`);
    console.log(`Popularity: ${item.popularity}/100`);
    console.log(`Genres: ${item.genres.join(",") || "N/A"}`);
  } else if (type === "album") {
    console.log(`Album: ${item.name}`);
    console.log(`Artist: ${item.artists.map((a) => a.name).join(",")}`);
    console.log(`Release Date: ${item.release_date}`);
    console.log(`Total Tracks: ${item.total_tracks}`);
  } else if (type === "audiobook") {
    console.log(`Audiobook: ${item.name}`);
    console.log(`Author: ${item.authors.map((a) => a.name).join(",")}`);
    console.log(`Narrator: ${item.narrators.map((n) => n.name).join(",")}`);
    console.log(`Publishers: ${item.publisher}`);
    console.log(`Total Chapters: ${item.total_chapters}`);
  } else {
    console.log(`Track: ${item.name}`);
    console.log(`Artist: ${item.artists.map((a) => a.name).join(",")}`);
    console.log(`Album: ${item.album.name}`);
    console.log(`Artist: ${item.artists.map((a) => a.name).join(",")}`);
    console.log(`Popularity: ${item.popularity}/100`);
  }
};

export const getHistory = async (type) => {
  try {
    if (type === "keywords") {
      await getSearchHistory();
    } else if (type === "selections") {
      await getSelectionHistory();
    } else {
      console.log(
        "Invalid history type: ${type}. Please use 'keywords' or 'selections'."
      );
    }
  } catch (error) {
    console.error("Error getting history: ${error.message}");
  }
};

//displays the search keyword history and allows the user to select a keyword to search again
export const getSearchHistory = async () => {
  try {
    //gets all keywords from the database
    const keywords = await db.find("search_history_keyword");

    //checks if there are any keywords in history (checks for anything in the jsons)
    if (keywords.length === 0) {
      console.log("No search history found.");
      return;
    }

    // format the selections to display in list later
    let choices = keywords.map((item) => ({
      name: `${item.keyword} (${item.type}) - ${new Date(
        item.timestamp
      ).toLocaleString()}`,
      value: item,
    }));

    // sort by timestamp
    choices.sort(
      (a, b) => new Date(b.value.timestamp) - new Date(a.value.timestamp)
    );

    //adds an "Exit" option at the top of the list
    choices.unshift({
      name: "Exit",
      value: "exit",
    });

    //asks the user to select a keyword from the history
    const { selectedKeyword } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedKeyword",
        message: "Select a search keyword from history:",
        choices: choices,
      },
    ]);

    //close proccess if choose exit
    if (selectedKeyword === "exit") {
      console.log("Exiting history.");
      return;
    }

    //search again using the selected keyword, make sure the name of the const is search
    await search(selectedKeyword.keyword, selectedKeyword.type);
  } catch (error) {
    console.error("Error getting search history: ${error.message}");
  }
};

//displays the selection history and lets the user to select an item to view its details
export const getSelectionHistory = async () => {
  try {
    //grab all the data from search_history_selection.json
    const selections = await db.find("search_history_selection");

    //check if anything is in the selection history
    if (selections.length === 0) {
      console.log("No selection history found.");
      return;
    }

    //format the selections to display in list later
    let choices = selections.map((item) => ({
      name: `${item.name} (${item.type}) - ${new Date(
        item.timestamp
      ).toLocaleString()}`,
      value: item,
    }));

    //sort by whichever one of them mfs were seen first
    choices.sort(
      (a, b) => new Date(b.value.timestamp) - new Date(a.value.timestamp)
    );

    //add an "Exit" option at the top of the list
    choices.unshift({
      name: "Exit",
      value: "exit",
    });

    //asks the user to select an item from the history
    const { selectedItem } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedItem",
        message: "Select an item from history:",
        choices: choices,
      },
    ]);

    //if choose the exit option then end process
    if (selectedItem === "exit") {
      console.log(chalk.blue("Exiting history."));
      return;
    }

    //get access token
    const accessToken = await api.getToken();

    //get all relevent information from the api
    const itemDetails = await api.getByID(
      accessToken,
      selectedItem.type,
      selectedItem.id
    );

    //display the detailed information, please make the const name displayItemDetails, i beg of you
    displayItemDetails(itemDetails, selectedItem.type);
  } catch (error) {
    console.error("Error getting selection history: ${error.message}");
  }
};

// search function to search for: artists, albums, tracks, and audiobooks.
// additionally saves the search query into the local database if it's a unique insertion in the database.
export const search = async (keyword, type = null) => {
  try {
    // get spotify access token for authentication.
    const accessToken = await api.getToken();

    // if type is not provided, prompt user to choose one of: artists, albums, tracks, or audiobooks.
    if (!type) {
      const { selectedType } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedType",
          message: "What do you want to search for?",
          choices: [
            { name: "Artists", value: "artist" },
            { name: "Albums", value: "album" },
            { name: "Tracks", value: "track" },
            { name: "Audiobooks", value: "audiobook" },
          ],
        },
      ]);
      type = selectedType;
    }

    // perform search using the keyword with spotify api.
    const searchResults = await api.searchByName(accessToken, keyword);

    // save search keyword to local database if the keyword+type combination is unique.
    // verify whether this keyword and type combination already exists in the search history.
    const existingKeywords = await db.find("search_history_keyword", {
      keyword: keyword,
      type: type,
    });

    // if the combination is new, insert the keyword and type into the search history database.
    if (existingKeywords.length === 0) {
      await db.insert("search_history_keyword", {
        keyword: keyword,
        type: type,
        timestamp: new Date().toISOString(),
      });
    }

    // extract search results corresponding to the selected type (artist, album, track, or audiobook).
    let items = [];
    if (type === "artist") {
      items = searchResults.artists.items;
    } else if (type === "album") {
      items = searchResults.albums.items;
    } else if (type === "track") {
      items = searchResults.tracks.items;
    } else if (type === "audiobook") {
      items = searchResults.audiobooks.items;
    }

    // if no results are found, inform user and terminate search.
    if (items.length === 0) {
      console.log(`No ${type}s found for "${keyword}"`);
      return;
    }

    // format search results for display as a selectable list.
    const choices = items.map((item) => {
      let displayText = "";

      if (type === "artist") {
        displayText = `${
          item.name
        } - ${item.followers.total.toLocaleString()} followers`;
      } else if (type === "album") {
        displayText = `${item.name} by ${item.artists
          .map((a) => a.name)
          .join(", ")}`;
      } else if (type === "track") {
        displayText = `${item.name} by ${item.artists
          .map((a) => a.name)
          .join(", ")} on ${item.album.name}`;
      } else if (type === "audiobook") {
        displayText = `${item.name} by ${item.authors
          .map((a) => a.name)
          .join(", ")}`;
      }

      return {
        name: displayText,
        value: item,
      };
    });

    // insert an "exit" option at the beginning of the choices list.
    choices.unshift({
      name: "Exit",
      value: "exit",
    });

    // prompt user to select an item from the formatted search results.
    const { selectedItem } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedItem",
        message: `Select a ${type} from the search results:`,
        choices: choices,
        pageSize: 10,
      },
    ]);

    // if user selects "exit", terminate the search operation.
    if (selectedItem === "exit") {
      console.log("Exiting search.");
      return;
    }

    // retrieve detailed information for the chosen item using its id.
    const itemDetails = await api.getByID(accessToken, type, selectedItem.id);

    // save the chosen item to local history if it hasn't been saved already.
    const existingSelections = await db.find("search_history_selection", {
      id: selectedItem.id,
    });

    // if the selection is unique, insert it into the search history for selections.
    if (existingSelections.length === 0) {
      await db.insert("search_history_selection", {
        id: selectedItem.id,
        name: selectedItem.name,
        type: type,
        timestamp: new Date().toISOString(),
      });
    }

    // display the retrieved detailed information for the selected item.
    displayItemDetails(itemDetails, type);
  } catch (error) {
    // handle errors by logging the error message to the console.
    console.error(`Error during search: ${error.message}`);
  }
};

const run = async () => {
  await getHistory("selections");
};

run();
