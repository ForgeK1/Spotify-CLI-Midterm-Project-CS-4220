# Spotify CLI Midterm Project (CS-4220)

# Description
Spotify CLI is a Node.js-based command-line application that interacts with Spotify’s Web API. It allows users to search and retrieve information about artists, tracks, albums, and audiobooks directly from the terminal. The app utilizes OAuth 2.0 for authentication and includes commands to explore content and view keyword history which offer a simple yet powerful tool for discovering music and media.

# How to view the list of available commands
node cli.js --help

# Example commands
node cli.js search "Eminem" artist 
node cli.js artist "Kendrick Lamar" 
node cli.js track "Reborn"
node cli.js album "Graduation"
node cli.js audiobook "The Alchemist"
node cli.js history keywords