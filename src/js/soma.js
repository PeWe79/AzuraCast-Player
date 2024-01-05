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
  getSongs( channel, callback ) {
    const apiurl = channel.songsurl || '';
    const title  = channel.name || '...';
    const error  = 'There was a problem loading the list of songs for channel '+ title +' from AzuraCast.';

    axios.get( apiurl ).then( res => {
      if ( !res.data ) return callback( error, [] );
      return callback( null, res.data );
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
        c.plsfile   = c.playlist_pls_url;
        c.mp3file   = c.listen_url;
        c.songsurl  = API + '/nowplaying/' + c.id;
        c.image     = '/public/img/'+c.shortcode+'.png';
        c.infourl   = c.url;
        c.twitter   = c.twitter ? 'https://twitter.com/@'+ c.twitter : '';
        c.route     = '/station/'+ c.shortcode;
        c.listeners = c.mounts[0].listeners.current | 0;
        c.updated   = c.updated | 0;
        c.favorite  = false;
        c.active    = false;
        output.push( c );
        // console.log("DATA => "+c.image);
      }
    }
    return output;
  },

}
