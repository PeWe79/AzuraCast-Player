/**
 * AzuraCast API handler
 */

import config from './config'

export default {
  // get station data from api
  getChannels(callback) {
    const apiurl = config.apiBaseUrl + '/api/stations'
    const error = 'There was a problem fetching the latest list of music channels from AzuraCast.'

    fetch(apiurl)
      .then((e) => e.json())
      .then((res) => {
        const list = this._parseChannels(res)
        if (!list.length) return callback(error, [])
        return callback(null, res)
      })
      .catch((e) => {
        return callback(error + String(e.message || ''), [])
      })
  },

  // fetch songs for a channel
  getSongs(channel, callback) {
    const apiurl = channel.songsurl || ''
    const title = channel.name || '...'
    const error = 'There was a problem loading the list of songs for channel ' + title + ' from AzuraCast.'

    fetch(apiurl)
      .then((e) => e.json())
      .then((res) => {
        if (!res) return callback(error, [])
        return callback(null, res)
      })
      .catch((e) => {
        return callback(error + String(e.message || ''), [])
      })
  },

  // parse station list from api response
  _parseChannels(station) {
    let output = []
    var randomNumber = Math.floor(Math.random() * 5)
    let fileName = '.jpg'
    let extension = fileName.split('/').pop()
    if (Array.isArray(station)) {
      for (let c of station) {
        c.plsfile = c.playlist_pls_url
        c.mp3file = c.listen_url
        c.songsurl = config.apiBaseUrl + '/api/nowplaying/' + c.id
        c.infourl = c.url
        c.twitter = c.twitter ? 'https://twitter.com/@' + c.twitter : ''
        c.route = '/station/' + c.shortcode
        c.listeners = c.mounts[0].listeners.current | 0
        c.updated = c.updated | 0
        c.favorite = false
        c.active = false
        c.imgLogo = config.apiBaseUrl + '/static/uploads/' + c.shortcode + '/' + 'album_art.' + randomNumber + extension
        output.push(c)
      }
    }
    return output
  },
}
