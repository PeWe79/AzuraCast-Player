[site]: https://github.com/PeWe79/
[mit]: https://www.opensource.org/licenses/mit-license.php
[repo]: https://github.com/PeWe79/AzuraCast-Player/
[demo]: https://azuracast-player.vercel.app
[azuracast]: https://demo.azuracast.com/
[audioapi]: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
[vue]: https://github.com/vuejs/vue
[node]: https://nodejs.org/

## Fully Modified SomaFM Music Player as AzuraCast Player
This is a fully modified version of SomaFM Music Player from [rainner/soma-fm-player](https://github.com/rainner/soma-fm-player) as AzuraCast Radio Player.

This Web project will be grab all radio station from AzuraCast streaming server via API interface.

## Demo Screenshots
![AzuraCast-Player](https://github.com/PeWe79/AzuraCast-Player/blob/main/thumb.png)

![AzuraCast-Player](https://github.com/PeWe79/AzuraCast-Player/blob/main/thumb2.png)

This is a Vue.js web application for streaming radio stations from [demo.azuracast.com][azuracast]. This app uses the public AzuraCast JSON channels API endpoint to pull in a list of stations and makes it easy to switch between stations. This app also used Three.js and the [HTML5 Web Audio Context API][audioapi] to sample audio data and create a visualizer effect for the selected station.

### Demo Site
##### [Check it out][demo]

## Install
Clone this repository :
```
git clone https://github.com/PeWe79/AzuraCast-Player.git
```

#### Edit Your AzuraCast Server.
Edit the configuration AzuraCast server. Open the [config.js](https://github.com/PeWe79/AzuraCast-Player/blob/main/src/js/config.js) file and edit the line below :

```javascript
apiBaseUrl: 'https://your-azuracast-server.com'

```

#### Image Branding
Make sure youre image brang in your Azuracast server is **.jpg** extension to work with this configuration project!.

#### Project setup
```
npm install
```
#### Compiles for development
```
npm run dev
```

#### Compiles and hot-reloads for development
```
npm run init
```
#### Compiles and minifies for production
```
npm run build
```

## Supported Cover Artworks
* iTunes

## TODO
- [ ] Option get Cover Artworks from Deezer or/and from Spotify.
- [ ] Make song request form and work with AzuraCast server.
- [x] Get Station image branding

### Author
[PeWe79][site]

### License
Licensed under [MIT][mit].

## Credits
* [rainner/soma-fm-player](https://github.com/rainner/soma-fm-player)
