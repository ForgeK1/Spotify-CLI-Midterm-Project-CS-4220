/*
Class Description: 
    - 

Contributors: 
    - Jorge Arias
    - Anthony Gonzalez
*/
import 'dotenv/config';
import axios from 'axios';
import yargs from 'yargs';
import { hideBin } from "yargs/helpers";
import * as api from './api.js';
//NEEDED TO CORRECTLY FULFILL THE TASKS OF CLI
//i need these functions that do what is currently implemented here, so that I then can grab the results from the app
//basically everything in the argv{} section in the commands
// import { 
//     search,
//     getArtist,
//     getAlbum,
//     getSearchHistory,
//     getSelectionHistory
// } from './app.js';

const BASE_URL = 'https://api.spotify.com/v1';

yargs(hideBin(process.argv))
    //Search cmd => General info
     //we want to use the search function of the api to look thru the artists, genres, albums,etc
    .command('search <query> [type]', 'Search Spotify', (yargs) => {
        //we want to provide the user the syntax to use for searching for a song,artist,album, and audiobooks
        //Since the api asks for a query we have to create a query that provides all the possible choices for the user
        return yargs.positional('query', {type: 'string', describe: 'Search term'})
        //set the track query as default since songs seem to be the most searched for but can change later
            .positional('type', {
                choices: ['track', 'artist', 'album', 'audiobook'],
                default: 'track',
                describe: 'Type of content to search'
            })
            //provide the option to set a limit of results that are sent back, since we are basically 
            // going thru the spotify library,there can be multiple results for a search
            .option('limit', {
                alias: 'l',
                type: 'number',
                default: 10,
                describe: 'Number of results to return'
            });
    }, async (argv) => {
        //attempts to make the search based on the provided user input of the cmd
        try {
            //grab access token from api
            const accessToken = await api.getToken();

            const { data } = await axios.get(`${BASE_URL}/search`, {
                params: {
                    q: argv.query,
                    type: argv.type,
                    limit: argv.limit
                }
                //allows authorization to the api
                ,headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            console.log(`\nSearch Results:`);
            //since we are saving the data to an array, the query types are saved as plurals in the api db(artists,tracks,etc)
            //so using the types we can grab the item that is stored within that library and itterate thru all the possible
            //results of the search
            //we also add a variable to keep count of the amount of results returned
            //(we increment the value since a result list wouldnt start @ 0):
            //1. result #1
            //2. result #2
            //3. result #3
            if (argv.type === 'audiobook') {
                //itterating thru all the search results up to the limit(default being 10 results)
                data.audiobooks.items.forEach((item, i) => {
                    console.log(`${i+1}. ${item.name}`);
                    //other than a quick name of the searched item, since its an audio booke we also want to provide
                    //info on the author and narrator
                    console.log(`   Author: ${item.authors.map(a => a.name).join(', ')}`);
                    console.log(`   Narrator: ${item.narrators.map(n => n.name).join(', ')}`);
                });
            }
            else if (argv.type === 'artist') {
                //iterating thru all the search results if artist is provided as the type
                data.artists.items.forEach((artist, i) => {
                    console.log(`${i+1}. ${artist.name}`);
                    //since its an artist we want to show some data inviolving their stats
                    //so we get the follower count, popularity and genres connected to the artist(s)
                    console.log(`   Followers: ${artist.followers.total.toLocaleString()}`);
                    console.log(`   Popularity: ${artist.popularity}/100`);
                    console.log(`   Genres: ${artist.genres.join(', ') || 'N/A'}`);
                });
            }
            else if (argv.type === 'album') {
                //iterating thru all the search results if album is provided as the type
                data.albums.items.forEach((album, i) => {
                    console.log(`${i+1}. ${album.name}`);
                    //since its an album we want to show some data inviolving more info
                    //so we get the artist(s), release date,and totla tracks it has
                    console.log(`   Artist: ${album.artists.map(a => a.name).join(', ')}`);
                    console.log(`   Release Date: ${album.release_date}`);
                    console.log(`   Total Tracks: ${album.total_tracks}`);
                });
            }
            else {
                //since artists are usually attached to their songs in a search, we watch to add them in some way
                data[`${argv.type}s`].items.forEach((item, i) => {
                    console.log(`${i+1}. ${item.name}`);
                    if (argv.type === 'track') {
                        //if we look up a track then it should have a format like:
                        //1. song #1,   Artist: artist #1
                        //2. song #2,   Artist: artist #2
                        console.log(`   Artist: ${item.artists.map(a => a.name).join(', ')}`);
                    }
                });
            }
        }
        catch (error) {
            console.error('Error', error.message);
        }
    })
    //artist cmd
    //want to create a cmd that shows all the data of the artist that is searched)this is NOT using the search cmd
    //It would be like: node cli.js artist "SZA"
    .command('artist <name>', 'Get artist details by name', (yargs) => {
        return yargs
            .positional('name', {
                type: 'string',
                describe: 'Artist name; Ex: "SZA","The Weeknd"'
            })
            //the limit can be changed by the user but its not included for them to know since 1 result would be ideal 
            //if they are searching for an artist 
            .option('limit', {
                alias: 'l',
                type: 'number',
                default: 1,
                describe: 'Number of results to return'
            });
    }, async (argv) => {
        try {
            //grab access token from api
            const accessToken = await api.getToken();

            //previously used the search cmd and now we use it here so that we dont have to search by id
            //so we use the name of the artist to locate their information
            const { data } = await axios.get(`${BASE_URL}/search`, {
                params: {
                    q: argv.name,
                    type: 'artist',
                    limit: argv.limit
                }
                //allows authorization to the api
                ,headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            //if the data is empty then that means that there's no artist that matches the name provided
            if (data.artists.items.length === 0) {
                console.log(`No artist found with the name: ${argv.name}`);
                return;
            }
            //after checking that the search result exists, we want to grab the most relavant seach result
            //we decide this by choosing the greater popularity value of the results
            const artist = data.artists.items.reduce((prev, current) => {
                if(prev.popularity>current.popularity){
                    return prev;
                }
                else{
                    return current;
                }
            });
            //show the more detailed info about the artist(name,follower count, popularity, genres, top tracks 
            // and spotify id)
            console.log(`\nArtist: ${artist.name}`);
            console.log(`Followers: ${artist.followers.total.toLocaleString()}`);
            console.log(`Popularity: ${artist.popularity}/100`);
            //the genres section of the api is depricated but the genres section didnt mention anything
            //so incase it doesnt work we want to show no genre as the result(also for when theres no genre 
            // provided for the artist)
            console.log(`Genres: ${artist.genres.join(', ') || 'N/A'}`);
            console.log(`ID: ${artist.id}`);
            //showcase the top tracks in the U.S. -> another api call so it needs the token again
            const { data: topTracks } = await axios.get(`${BASE_URL}/artists/${artist.id}/top-tracks`, {
                params: { market: 'US' }
                //allows authorization to the api
                ,headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
                
            });
            console.log(`\n---Top Tracks---`);
            //iterate thru the track array to grab the top 5 tracks shown on spotify
            topTracks.tracks.slice(0, 5).forEach((track, i) => {
                //showcase the tracks like:
                    //1. track #1
                    //2. track #2
                    //3. track #3
                console.log(`${i+1}. ${track.name}`);
            });
        }
        catch (error) {
            console.error('Error:', error.message);
        }
    })
    //album cmd
    //want to create a cmd to locate known albums by name along with most of their info
    .command('album <name>', 'Get album details by name', (yargs) => {
        return yargs
            .positional('name', {
                type: 'string',
                describe: 'Album name; Ex: "SOS","DAMN."'
            })
            .option('artist', {
                alias: 'a',
                type: 'string',
                describe: 'Filter the search by artist name'
            })
            .option('limit', {
                alias: 'l',
                type: 'number',
                default: 1,
                describe: 'Number of results to return'
            });
    }, async (argv) => {
        try {
            //grab access token from api
            const accessToken = await api.getToken();

            //grabs the artist name from the query
            let query = argv.name;
            if (argv.artist) {
                query += ` artist:${argv.artist}`;
            }
            //uses the collected artist name to commit a search on the artist 
            const { data } = await axios.get(`${BASE_URL}/search`, {
                params: {
                    q: query,
                    type: 'album',
                    limit: argv.limit
                }
                //allows authorization to the api
                ,headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            //if the search ends up having no info then the album doesnt exist
            if (data.albums.items.length === 0) {
                console.log(`No album found with the name: ${argv.name}`);
                return;
            }
            //if the album exists then there should be only 1 result at the start of the array 
            const album = data.albums.items[0];
            //uses the found album to get the id to have access to the rest of the info
            const { data: albumDetails } = await axios.get(`${BASE_URL}/albums/${album.id}`,{
                headers:{'Authorization':`Bearer ${accessToken}`}
            });
            //grabs the album name, artist name(s), release date, total tracks and lists all of those tracks
            console.log(`\nAlbum: ${albumDetails.name}`);
            console.log(`Artist: ${albumDetails.artists.map(a => a.name).join(', ')}`);
            console.log(`Release Date: ${albumDetails.release_date}`);
            console.log(`Total Tracks: ${albumDetails.total_tracks}`);
            console.log(`\n---Tracks---`);
            //iterates thru all the tracks to list them by name
            albumDetails.tracks.items.forEach((track, i) => {
                console.log(`${i+1}. ${track.name}`);
            });
        }
        catch (error) {
            console.error('Error:', error.message);
        }
    })
    //audiobook cmd
    //even though we take into account of audiobooks in a regular search, we want to provide a cmd that shows all the data 
    //the api contains on the audiobook
    .command('audiobook <name>', 'Get audiobook details by name', (yargs) => {
        return yargs
            .positional('name', {
                type: 'string',
                describe: 'Audiobook title; Ex: "Dune","Harry Potter"'
            })
            //optional to add the autors name to get a better search
            .option('author', {
                alias: 'a',
                type: 'string',
                describe: 'Filter the search by author name'
            })
            .option('limit', {
                alias: 'l',
                type: 'number',
                default: 1,
                describe: 'Number of results to return'
            });
    }, async (argv) => {
        try {
            //grab access token from api
            const accessToken = await api.getToken();
            
            //grabs the name of the audiobook from the query and checks if the optional author name was provided
            let query = argv.name;
            if (argv.author) {
                query += ` author:${argv.author}`;
            }
            //use the audiobook query to search for it by name
            const { data } = await axios.get(`${BASE_URL}/search`, {
                params: {
                    q: query,
                    type: 'audiobook',
                    limit: argv.limit,
                    market: 'US'
                }
                //allows authorization to the api
                ,headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            //checks if anything was found from the search
            if (data.audiobooks.items.length === 0) {
                console.log(`No audiobook found with the name: ${argv.name}`);
                return;
            }
            //if theres a result from the search then we grab the very 1st result
            const audiobook = data.audiobooks.items[0];
            //uses the id from the searched audiobook to locate the rest of the details
            const { data: audiobookDetails } = await axios.get(`${BASE_URL}/audiobooks/${audiobook.id}`,{
                params: {market:'US'}
                //allows authorization to the api
                ,headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            //Details
            //Audiobook name
            console.log(`\nAudiobook: ${audiobookDetails.name}`);
            //audiobook id
            console.log(`ID: ${audiobookDetails.id}`);
            //publisher name 
            console.log(`Publisher: ${audiobookDetails.publisher}`);
            //total chapters of the audiobook
            console.log(`Total Chapters: ${audiobookDetails.total_chapters}`);
            //mini description from the description of the audiobook
            //have to get the actual audio book description since the api grabs everything in that div
            //it would restate the authors and narrators all while ending the description txt early
            //We also have to make sure the html syntax doesnt show(yes it does actually show the 
            // <p></p> otherwise)
            const cleanDescription = audiobookDetails.description.replace(/<[^>]*>/g, '');
            console.log(`${cleanDescription}...`);
        }
        catch (error) {
            console.error('Error:', error.message);
        }
    })
    //---------- To Do ----------
    //need to make 2 history cmds, 1 for storing search history and the other for storing the history of unique cmds;
    //like help,audiobook,artist, and album


    .demandCommand()
    .help()
    .argv;

