'use strict';
import {DUM} from '../../dum-core/dum';
const THREE = require('three');

// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

export class RaycasterPlane{
  constructor () {
    this.threshold    = 0.1;
    this.pointSize    = 0.05;
    this.width        = 500;
    this.length       = 100;
    this.mouse        = new THREE.Vector2();
    this.intersection = null;
    this.spheres      = [];
    this.spheresIndex = 0;
    this.rotateY      = new THREE.Matrix4().makeRotationY( 0.0005 );
    this.node         = DUM.div.setClass('three-dee');
    this.toggle       = 0;
    this.scene        = new THREE.Scene();
    this.clock        = new THREE.Clock();
    this.camera       = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0,0,20 ) );
    this.camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.5 ) );

    this.pcBuffer = this.generatePointcloud( new THREE.Color( 1,0,0 ), this.width, this.length );
    this.pcBuffer.scale.set( 10,0,10 );
    this.pcBuffer.position.set( -5,0,5 );
    this.pcBuffer.scale.y = 10; // THIS IS WHAT WE UPDATE TO MAKE ANALYZER
    this.scene.add( this.pcBuffer );
    
    this.pcIndexed = this.generateIndexedPointcloud( new THREE.Color( 0,1,0 ), this.width, this.length );
    this.pcIndexed.scale.set( 10,0,10 );
    this.pcIndexed.position.set( 5,0,5 );
    this.pcIndexed.scale.y = 20;
    this.scene.add( this.pcIndexed );
    
    this.pcIndexedOffset = this.generateIndexedWithOffsetPointcloud( new THREE.Color( 0,1,1 ), this.width, this.length );
    this.pcIndexedOffset.scale.set( 10,0,10 );
    this.pcIndexedOffset.position.set( 5,0,-5 );
    this.pcIndexedOffset.scale.y = 15;
    this.scene.add( this.pcIndexedOffset );
    
    this.pcRegular = this.generateRegularPointcloud( new THREE.Color( 1,0,1 ), this.width, this.length );
    this.pcRegular.scale.set( 10,0,10 );
    this.pcRegular.position.set( -5,0,-5 );
    this.scene.add( this.pcRegular );
    this.pointclouds = [ this.pcBuffer, this.pcIndexed, this.pcIndexedOffset, this.pcRegular ];

    let sphereGeometry = new THREE.SphereGeometry( 0.1, 102, 102 );
    let sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, shading: THREE.FlatShading } );
    
    for ( let i = 0; i < 10; i++ ) {
      let sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
      this.scene.add( sphere );
      this.spheres.push( sphere );
    }

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.node.append( DUM.decorateEl(this.renderer.domElement) );

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = this.threshold;

    window.addEventListener( 'resize', this.onWindowResize, false );
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
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate() {
    requestAnimationFrame( this.animate.bind(this) );
    this.render();
  }

  render() {
    this.camera.applyMatrix( this.rotateY );
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera( this.mouse, this.camera );
    let intersections = this.raycaster.intersectObjects( this.pointclouds );
    this.intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    
    if ( this.toggle > 0.02 && this.intersection !== null) {
      this.spheres[ this.spheresIndex ].position.copy( this.intersection.point );
      this.spheres[ this.spheresIndex ].scale.set( 1, 1, 1 );
      this.spheresIndex = ( this.spheresIndex + 1 ) % this.spheres.length;
      this.toggle = 0;
    }
    
    for ( let i = 0; i < this.spheres.length; i++ ) {
      let sphere = this.spheres[ i ];
      sphere.scale.multiplyScalar( 0.98 );
      sphere.scale.clampScalar( 0.01, 1 );
    }
    
    this.toggle += this.clock.getDelta();
    this.renderer.render( this.scene, this.camera );
  }
}




