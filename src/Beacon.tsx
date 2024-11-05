import React, { useRef, useEffect } from 'react';

import { useLoader } from '@react-three/fiber';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

import * as THREE from 'three';



interface BeaconProps {

  objUrl: string;

  mtlUrl: string;

  scale: number;

  yaw: number;

  pitch: number;

  roll: number;

  position: [number, number, number];

}



const Beacon: React.FC<BeaconProps> = ({

  objUrl,

  mtlUrl,

  scale,

  yaw,

  pitch,

  roll,

  position,

}) => {

  const groupRef = useRef<THREE.Group>(null);



  // Load materials and 3D object

  const materials = useLoader(MTLLoader, mtlUrl);

  const obj = useLoader(OBJLoader, objUrl, (loader) => {

    materials.preload();

    loader.setMaterials(materials);

  });



  // Update position and rotation based on props

  useEffect(() => {

    if (groupRef.current) {

      groupRef.current.position.set(...position);

      groupRef.current.rotation.set(

        THREE.MathUtils.degToRad(pitch),

        THREE.MathUtils.degToRad(yaw),

        THREE.MathUtils.degToRad(roll)

      );

    }

  }, [position, yaw, pitch, roll]);



  return (

    <group ref={groupRef}>

      <primitive object={obj} scale={scale} />

    </group>

  );

};



export default Beacon;
