/*
Class Description: 
    - 

Contributors: 
    - Jorge Arias
    - Anthony Gonzalez
*/
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as app from "./app.js";

yargs(hideBin(process.argv))
  //we want to use the search function of the api to look thru the artists, genres, albums,etc
  .command(
    "search <query> [type]",
    "Search Spotify",
    (yargs) => {
      //we want to provide the user the syntax to use for searching for a song,artist,album, and audiobooks
      //Since the api asks for a query we have to create a query that provides all the possible choices for the user
      return (
        yargs
          .positional("query", { type: "string", describe: "Search term" })
          //set the track query as default since songs seem to be the most searched for but can change later
          .positional("type", {
            choices: ["track", "artist", "album", "audiobook"],
            describe: "Type of content to search",
          })
          //provide the option to set a limit of results that are sent back, since we are basically
          // going thru the spotify library,there can be multiple results for a search
          .option("limit", {
            alias: "l",
            type: "number",
            default: 10,
            describe: "Number of results to return",
          })
      );
    },
    async (argv) => {
      //attempts to make the search based on the provided user input of the cmd
      try {
        await app.search(argv.query, argv.type);
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  )
  //artist cmd
  //want to create a cmd that shows all the data of the artist that is searched)this is NOT using the search cmd
  //It would be like: node cli.js artist "SZA" -> specifies what to search for
  .command(
    "artist <name>",
    "Get artist details by name",
    (yargs) => {
      return (
        yargs
          .positional("name", {
            type: "string",
            describe: 'Artist name; Ex: "SZA","The Weeknd"',
          })
          //the limit can be changed by the user but its not included for them to know since 1 result would be ideal
          //if they are searching for an artist
          .option("limit", {
            alias: "l",
            type: "number",
            default: 1,
            describe: "Number of results to return",
          })
      );
    },
    async (argv) => {
      try {
        await app.search(argv.name, "artist");
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  )
  //trach cmd
  //want to create a cmd that shows all the data of the track that is searched)this is NOT using the search cmd
  //It would be like: node cli.js track "luther" -> specifies what to search for
  .command(
    "track <name>",
    "Get track details by title",
    (yargs) => {
      return (
        yargs
          .positional("name", {
            type: "string",
            describe: 'Track name; Ex: "luther","30 for 30"',
          })
          //the limit can be changed by the user but its not included for them to know since 1 result would be ideal
          //if they are searching for an artist
          .option("limit", {
            alias: "l",
            type: "number",
            default: 1,
            describe: "Number of results to return",
          })
      );
    },
    async (argv) => {
      try {
        await app.search(argv.name, "track");
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  )
  //album cmd
  //personalized cmd for albums -> specifying the type of search
  .command(
    "album <name>",
    "Get album details by name",
    (yargs) => {
      return yargs
        .positional("name", {
          type: "string",
          describe: 'Album name; Ex: "SOS","DAMN."',
        })
        .option("limit", {
          alias: "l",
          type: "number",
          default: 1,
          describe: "Number of results to return",
        });
    },
    async (argv) => {
      try {
        await app.search(argv.name, "album");
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  )
  //audiobook cmd
  //personalized cmd for audiobooks -> specifying the type of search
  .command(
    "audiobook <name>",
    "Get audiobook details by name",
    (yargs) => {
      return yargs
        .positional("name", {
          type: "string",
          describe: 'Audiobook title; Ex: "Dune","Harry Potter"',
        })
        .option("limit", {
          alias: "l",
          type: "number",
          default: 1,
          describe: "Number of results to return",
        });
    },
    async (argv) => {
      try {
        await app.search(argv.name, "audiobook");
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  )
  .command(
    "history <type>",
    "View search or selection history",
    (yargs) => {
      return yargs.positional("type", {
        choices: ["keywords", "selections"],
      });
    },
    async (argv) => {
      await app.getHistory(argv.type);
    }
  )

  .demandCommand()
  .help().argv;
