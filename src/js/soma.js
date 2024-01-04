/**
 * Soma-FM API handler
 */
let API='https://stream.cloudmu.id/api';

export default {

  // get station data from api
  getChannels( callback ) {
    const apiurl = API+'/stations';
    const error  = 'There was a problem fetching the latest list of music channels from AzuraCast.';

    axios.get( apiurl ).then( res => {
      const list = this._parseChannels( res.data );
      if ( !list.length ) return callback( error, [] );
      return callback( null, list );
    })
    .catch( e => {
      return callback( error + String( e.message || '' ), [] );
    });
  },

  // fetch songs for a channel
  getSongs( channel ) {
    const apiurl = API+'/nowplaying/'+channel;
    // const title  = channel.title || '...';
    const error  = 'There was a problem loading the list of songs for channel from AzuraCast.';

    axios.get( apiurl ).then( res => {
      if ( !res.data.station ) return callback( error, [] );
      return callback( null, res.data.station );
    })
    .catch( e => {
      return callback( error + String( e.message || '' ), [] );
    });
  },

  // parse station list from api response
  _parseChannels( station ) {
    let output = [];
    if ( Array.isArray( station ) ) {
      for ( let c of station ) {
        // if ( !Array.isArray( c.playlists ) ) continue;
        // c.plsfile   = API+ c.id +'.pls';
        c.mp3file   = c.listen_url;
        c.songsurl  = API+'/nowplaying/'+ c.shortcode;
        // c.infourl   = 'https://somafm.com/'+ c.id +'/';
        c.twitter   = c.twitter ? 'https://twitter.com/@'+ c.twitter : '';
        c.route     = '/station/'+ c.shortcode;
        c.listeners = c.mounts[0].listeners.current | 0;
        c.updated   = c.updated | 0;
        c.favorite  = false;
        c.active    = false;
        output.push( c );
        // console.log("DATA => "+c.songsurl);
      }
    }
    return output;
  },

}
