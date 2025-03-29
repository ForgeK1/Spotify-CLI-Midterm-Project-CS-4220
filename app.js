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
    console.log(`\nAccess token: ${accessToken}`);

    /*Gets album name and total tracks by name*/
    let albumByName = await api.getAlbumByName(accessToken, "starboy");

    /*In the Spotify API, when you search for an album name (or any name in general)
      there could be multiple versions of it. In this instance, there's Starboy,
      Starboy (Deluxe), Starboy (Instrumental), etc. But when you search by ID there's
      only one version of it*/
    let firstAlbum = albumByName.albums.items[0];

    let firstAlbumByName = firstAlbum.name;
    let firstAlbumTotalTracksByName = firstAlbum.total_tracks;

    console.log(`\nalbumByName: ${firstAlbumByName}`);
    console.log(`albumTotalTracksByName: ${firstAlbumTotalTracksByName}`);

    /*Gets album name and total tracks by ID*/
    let albumByID = await api.getAlbumByID(accessToken, "4aawyAB9vmqN3uQ7FjRGTy");
    
    let albumNameByID = albumByID.name;
    let albumTotalTracksByID = albumByID.total_tracks;

    console.log(`\nalbumNameByID: ${albumNameByID}`);
    console.log(`albumTotalTracksByID: ${albumTotalTracksByID}`);

    /*Gets artist by name*/
    let artistByName = await api.getArtistByName(accessToken, "Taylor Swift")
    let artistName = artistByName.artists.items[0].name
    console.log(`\nartistByName: ${artistName}`)

    /*Gets audiobook by name */
    let audiobookByName = await api.getAudiobookByName(accessToken, "Harry Potter")
    let audiobookName = audiobookByName.audiobooks.items[0].name
    console.log(`audiobookByName: ${audiobookName}`)

    /*Gets artist by ID*/
    let artistByID = await api.getArtistByID(accessToken, "3TVXtAsR1Inumwj472S9r4");
    let artistNameByID = artistByID.name;
    let artistTotalFollowersByID = artistByID.followers.total;
    console.log(`\nartistNameByID: ${artistNameByID}`)
    console.log(`artistTotalFollowersByID: ${artistTotalFollowersByID}`)

    /*Gets audiobook by ID*/
    let audiobookByID = await api.getAudiobookByID(accessToken, "1NDH0k2YgnVmC3M2zkomuV");
    let audiobookNameByID = audiobookByID.name;
    let audiobookPublisherByID = audiobookByID.publisher;
    console.log(`\naudiobookPublisherByID: ${audiobookPublisherByID}`)
    console.log(`audiobookNameByID: ${audiobookNameByID}`)

};

run(); 