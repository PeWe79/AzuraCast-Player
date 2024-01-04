var API = 'https://stream.cloudmu.id/api'

export default {

    // get channels data from api
    getChannels( callback ) {
      const apiurl = API + '/nowplaying/station';
      const error  = 'There was a problem fetching the latest list of music channels from SomaFM.';
  
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
      const error  = 'There was a problem loading the list of songs for channel '+ title +' from SomaFM.';
  
      axios.get( apiurl ).then( res => {
        if ( !res.data ) return callback( error, [] );
        return callback( null, res.data );
      })
      .catch( e => {
        return callback( error + String( e.message || '' ), [] );
      });
    },
  
    // parse channels list from api response
    _parseChannels( channels ) {
      let output = [];
      if ( Array.isArray( channels ) ) {
        for ( let c of channels ) {
					//   if ( !Array.isArray( c.playlists ) ) continue;
          c.plsfile   = c.station.listen_url;
          c.mp3file   = c.station.listen_url;
          c.songsurl  = API + '/nowplaying/' + c.station.shortcode +'.json';
          c.infourl   = API + '/nowplaying/' + c.station.name;
          c.twitter   = c.twitter ? 'https://twitter.com/@'+ c.twitter : '';
          c.route     = '/channel/'+ c.station.shortcode;
          c.listeners = c.listeners.current | 0;
          // c.updated   = c.updated | 0;
          c.favorite  = false;
          c.active    = false;
          output.push( c );
					console.log("DATA => " + c.route);
        }
      }
      return output;
    },
  
  }