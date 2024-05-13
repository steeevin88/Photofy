# Photofy

### Inspiration
People often create Spotify playlists that SURROUND a picture that they took. Pictures can preserve memories, emotions; they hold meaning and capture raw emotions from a specific moment in time. However, such playlist creation is strictly manual. Listeners are forced to pick their own songs and individually add them to their playlist(s). 
<br>
<br>
What if this process was automated? What if users could upload an image and a playlist was generated with songs that surrounded the emotions and ideas nested within the image itself?

### What it does
Users can log into Photofy using their Spotify account; in doing so, the application will have access to your account information, including listening preferences and playlist data. On Photofy, users will upload an image and declare a playlist name and optional description. 
<br>
<br>
Photofy will then use [Anthropic's Claude 3 Sonnet model](https://www.anthropic.com/news/claude-3-family) to analyze and interpret the "meaning" of the uploaded image. Based on its interpretation, the model will select 3 artists and 2 genres to be used as seeds for the [Spotify API's "Get Recommendations" Endpoint](https://developer.spotify.com/documentation/web-api/reference/get-recommendations). After fetching songs, a new playlist will be created on the user's Spotify account. This playlist and its contents can be viewed on both Spotify and Photofy.

## How we built it
Photofy is a NextJS application utilizing Supabase for both authentication and a database. The application's UI and base components are largely taken from [here](https://www.youtube.com/watch?v=2aeMRB8LL4o&t=624s&ab_channel=CodeWithAntonio). 
<br>
<br>
Because Supabase uses the Spotify API's OAuth for authentication, Photofy simply takes the authentication token generated from OAuth to make additional API calls to Spotify (including playlist creation, song recommendations, etc...). To analyze images, the application uses Anthropic's Claude 3 Sonnet model; the free tier is suitable for local instances of Photofy.
