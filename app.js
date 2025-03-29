/*
Class Description: 
    - 

Contributors: 
    - Johny Vu
    - Sanskar Thapa
*/

//Imports
import * as api from './api.js';

//Here's a run function as an example of how api.js class works
const run = async () => {
    /*Aquires the access token to access the Spotify Web API*/
    const accessToken = await api.getToken();

    const result = await api.searchByName(accessToken, "Taylor Swift");
    console.log("\nArtist Search:", result.artists.items[0].name);

    const album = await api.getByID(accessToken, "album", "4aawyAB9vmqN3uQ7FjRGTy");

    console.log("Album Name:", album.name);           
    console.log("Track Count:", album.total_tracks);  
};

run(); 