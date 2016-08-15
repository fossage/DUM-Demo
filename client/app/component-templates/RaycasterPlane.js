'use strict';
import {DUM} from '../../dum-core/dum';
const THREE = require('three');
require('three/examples/js/controls/FlyControls');

// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
const quadrants = ['pcBuffer', 'pcIndexed', 'pcIndexedOffset', 'pcRegular']; 
let startTime;

export class RaycasterPlane{
  constructor (cancelWhen = null) {
    this.cancelWhen   - cancelWhen;
    this.threshold    = 0.5;
    this.pointSize    = 0.005;
    this.width        = 100;
    this.length       = 500;
    this.mouse        = new THREE.Vector2();
    this.intersection = null;
    this.rotateY      = new THREE.Matrix4().makeRotationY( 0.001 );
    this.rotateX      = new THREE.Matrix4().makeRotationX( -0.0005 );
    this.rotateZ      = new THREE.Matrix4().makeRotationZ( 0.0008 );
    this.node         = DUM.div.addClass('three-dee');
    this.toggle       = 0;
    this.scene        = new THREE.Scene();
    this.clock        = new THREE.Clock();
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight - 100 );
    this.node.append( DUM.decorateEl(this.renderer.domElement) );

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = this.threshold;
 
    
    this.camera = new THREE.PerspectiveCamera( 6, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0,0,200 ) );
    this.camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.5 ) );
    
    this.controls               = new THREE.FlyControls(this.camera, this.renderer.domElement);
    this.controls.movementSpeed = .004;
	  this.controls.rollSpeed     = 0.00005;
    this.controls.dragToLook    = true;
    this.controls.useMouse      = false;

    this.pcBuffer = this.generatePointcloud( new THREE.Color( 1,0,0 ), this.width, this.length );
    this.pcBuffer.scale.set( 10,0,10 );
    this.pcBuffer.position.set( -5,0,5 );
    this.pcBuffer.scale.y = 0; // THIS IS WHAT WE UPDATE TO MAKE ANALYZER
    this.scene.add( this.pcBuffer );
    
    this.pcIndexed = this.generateIndexedPointcloud( new THREE.Color( 0,1,0 ), this.width, this.length );
    this.pcIndexed.scale.set( 10,0,10 );
    this.pcIndexed.position.set( 5,0,5 );
    this.pcIndexed.scale.y = 0;
    this.scene.add( this.pcIndexed );
    
    this.pcIndexedOffset = this.generateIndexedWithOffsetPointcloud( new THREE.Color( 0,1,1 ), this.width, this.length );
    this.pcIndexedOffset.scale.set( 10,0,10 );
    this.pcIndexedOffset.position.set( 5,0,-5 );
    this.pcIndexedOffset.scale.y = 0;
    this.scene.add( this.pcIndexedOffset );
    
    this.pcRegular = this.generateRegularPointcloud( new THREE.Color( 1,0,1 ), this.width, this.length );
    this.pcRegular.scale.set( 10,0,10 );
    this.pcRegular.position.set( -5,0,-5 );
    this.scene.add( this.pcRegular );
    this.pointclouds = [ this.pcBuffer, this.pcIndexed, this.pcIndexedOffset, this.pcRegular ];

    
    this.starField = this.generateStarField();
    this.starField.scale.set( 80,80,-80 );
    this.starField.position.set( 0, 0 ,0 );
    this.scene.add(this.starField);

    window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false )
  }

  generatePointCloudGeometry( color, width, length ){
    let geometry  = new THREE.BufferGeometry();
    let numPoints = width*length;
    let positions = new Float32Array( numPoints*3 );
    let colors    = new Float32Array( numPoints*3 );
    let k = 0;
    
    for( let i = 0; i < width; i++ ) {
      for( let j = 0; j < length; j++ ) {
        let bandSpacingX = i / width;
        let bandSpacingY = j / length;
        let bandSpacingZ = bandSpacingX - 0.5;
        let ripples      = ( Math.cos( bandSpacingX * Math.PI * 8 ) + Math.sin( bandSpacingY * Math.PI * 8 ) ) / 20;
        let rippleLength = (bandSpacingY - 0.5);
        
        positions[ 3 * k ] = bandSpacingZ;
        positions[ 3 * k + 1 ] = ripples;
        positions[ 3 * k + 2 ] = rippleLength;
        
        let intensity = ( ripples + 0.1 ) * 5; // manipulate the 5 to adjust the brightness
        
        colors[ 3 * k ] = color.r * intensity;
        colors[ 3 * k + 1 ] = color.g * intensity;
        colors[ 3 * k + 2 ] = color.b * intensity;
        k++;
      }
    }
    
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    geometry.computeBoundingBox();
    return geometry;
  }

  generatePointcloud( color, width, length ) {
    let geometry   = this.generatePointCloudGeometry( color, width, length );
    let material   = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: THREE.VertexColors } );
    let pointcloud = new THREE.Points( geometry, material );
    return pointcloud;
  }

  generateStarField() {
    let geometry  = new THREE.BufferGeometry();
    let positions = new Float32Array( 15000 );
    let colors    = new Float32Array( 15000 );
    
    for(let i=0; i<15000; i += 3) {
      let phi = Math.random() * (0 - 2 * Math.PI);
      let costheta = Math.random() * (-1 - 1) + 1
      let u = Math.random() * (0 - 1)

      let theta = Math.acos( costheta )
      let r = 200 * Math.cbrt( u )
      
      let x = r * (Math.sin( theta) * Math.cos( phi )) / 100
      let y = r * (Math.sin( theta) * Math.sin( phi )) / 100
      let z = r * (Math.cos( theta )) / 100

      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      colors[i] = 1;
      colors[i + 1] = 1;
      colors[i + 2] = 1;
    }

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    geometry.computeBoundingBox();
    let material  = new THREE.PointsMaterial({size: 0.1, vertexColors: THREE.VertexColors});
    let starField = new THREE.Points(geometry, material);
    return starField;
  }

  generateIndexedPointcloud( color, width, length ) {
    let k         = 0;
    let geometry  = this.generatePointCloudGeometry( color, width, length );
    let numPoints = width * length;
    let indices   = new Uint16Array( numPoints );
    
    for( let i = 0; i < width; i++ ) {
      for( let j = 0; j < length; j++ ) {
        indices[ k ] = k;
        k++;
      }
    }
    
    geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    
    let material   = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: THREE.VertexColors } );
    let pointcloud = new THREE.Points( geometry, material );
    return pointcloud;
  }

  generateIndexedWithOffsetPointcloud( color, width, length ){
    let k         = 0;
    let geometry  = this.generatePointCloudGeometry( color, width, length );
    let numPoints = width * length;
    let indices   = new Uint16Array( numPoints );
    
    for( let i = 0; i < width; i++ ){
      for( let j = 0; j < length; j++ ) {
        indices[ k ] = k;
        k++;
      }
    }
    
    geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    geometry.addGroup( 0, indices.length );
    
    let material   = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: THREE.VertexColors } );
    let pointcloud = new THREE.Points( geometry, material );
    return pointcloud;
  }

  generateRegularPointcloud( color, width, length ) {
    let k        = 0;
    let colors   = [];
    let geometry = new THREE.Geometry();
    
    for( let i = 0; i < width; i++ ) {
      for( let j = 0; j < length; j++ ) {
        let u = i / width;
        let v = j / length;
        let x = u - 0.5;
        let y = ( Math.cos( u * Math.PI * 8 ) + Math.sin( v * Math.PI * 8) ) / 20;
        let z = v - 0.5;
        let a = new THREE.Vector3( x,y,z );
        let intensity = ( y + 0.1 ) * 7;
        
        colors[ 3 * k ] = color.r * intensity;
        colors[ 3 * k + 1 ] = color.g * intensity;
        colors[ 3 * k + 2 ] = color.b * intensity;
        
        geometry.vertices.push( a );
        colors[ k ] = ( color.clone().multiplyScalar( intensity ) );
        k++;
      }
    }
    
    geometry.colors = colors;
    geometry.computeBoundingBox();
    
    let material   = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: THREE.VertexColors } );
    let pointcloud = new THREE.Points( geometry, material );
    return pointcloud;
  }

  onDocumentMouseMove( event ) {
    event.preventDefault();
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 1.6 + 1;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate() {
    let cancelId = requestAnimationFrame( this.animate.bind(this) );
    this.render();
    if(this.cancelWhen && this.cancelWhen()) cancelAnimationFrame(cancelId);
  }

  updateYScale(val, quadrant) {
    this[quadrants[quadrant]].scale.y = val;
  }

  render() {
    this.camera.applyMatrix( this.rotateY );
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera( this.mouse, this.camera );
    
    let intersections = this.raycaster.intersectObjects( this.pointclouds );
    this.intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    this.toggle += this.clock.getDelta();
    this.controls.update( this.toggle );
    this.renderer.render( this.scene, this.camera );
  }
}




