/**
 * ThreeJS scene handler
 */
import Sphere from './sphere';

export default {
  mWrap: null,
  mCanvas: null,
  mRenderer: null,
  mScene: null,
  mCamera: null,
  mBox: null,
  mMouse: { x: 0, y: 0 },
  mObjects: [],

  // setup animation canvas
  setupCanvas() {
    this.mWrap   = document.querySelector( '#player-wrap' );
    this.mCanvas = document.querySelector( '#player-canvas' );
    this.mBox    = this.mWrap.getBoundingClientRect();

    // setup scene and renderer
    this.mScene = new THREE.Scene();
    this.mRenderer = new THREE.WebGLRenderer( { canvas: this.mCanvas, alpha: true, antialias: true, precision: 'lowp' } );
    this.mRenderer.setClearColor( 0x000000, 0 );
    this.mRenderer.setPixelRatio( window.devicePixelRatio );

    // setup camera
    this.mCamera = new THREE.PerspectiveCamera( 60, ( this.mBox.width / this.mBox.height ), 0.1, 20000 );
    this.mCamera.lookAt( this.mScene.position );
    this.mCamera.position.set( 0, 0, 300 );
    this.mCamera.rotation.set( 0, 0, 0 );

    // add and create objects
    this.mObjects.push( Sphere );

    for ( let o of this.mObjects ) {
      o.create( this.mBox, this.mScene );
    }
    // setup events
    window.addEventListener( 'mousemove', this.updateMouse.bind( this ) );
    window.addEventListener( 'resize', this.updateSize.bind( this ) );
    this.updateMouse();
    this.updateSize();
  },

  // update custom objects in 3d scene
  updateObjects( freq ) {
    for ( let o of this.mObjects ) {
      o.update( this.mBox, this.mMouse, freq );
    }
    this.mRenderer.render( this.mScene, this.mCamera );
  },

  // update canvas size
  updateSize() {
    if ( !this.mWrap || !this.mCanvas ) return;
    this.mBox = this.mWrap.getBoundingClientRect();
    this.mCanvas.width = this.mBox.width;
    this.mCanvas.height = this.mBox.height;
    this.mCamera.aspect = ( this.mBox.width / this.mBox.height );
    this.mCamera.updateProjectionMatrix();
    this.mRenderer.setSize( this.mBox.width, this.mBox.height );
  },

  // update mouse position from center of canvas
  updateMouse( e ) {
    if ( !this.mBox ) return;
    const centerX = this.mBox.left + ( this.mBox.width / 2 );
    const centerY = this.mBox.top + ( this.mBox.height / 2 );

    if ( e ) {
      this.mMouse.x = Math.max( 0, e.pageX || e.clientX || 0 ) - centerX;
      this.mMouse.y = Math.max( 0, e.pageY || e.clientY || 0 ) - centerY;
    } else {
      this.mMouse.x = centerX;
      this.mMouse.y = centerY;
    }
  },
}
