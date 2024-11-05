import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Globe from './Globe';
import Beacon from './Beacon';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SatelliteData {
  messageID: string;
  position: { latitude: number; longitude: number; altitude: number };
  orientation: { yaw: number; pitch: number; roll: number };
  acceleration: { yaw: number; pitch: number; roll: number };
}

function CustomTrajectory({ points }: { points: THREE.Vector3[] }) {
  const lineRef = useRef<THREE.Line>(null);
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

  useFrame(() => {
    if (lineRef.current) {
      geometry.setFromPoints(points);
    }
  });

  return <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />;
}

function App() {
  const [satelliteData, setSatelliteData] = useState<SatelliteData>({
    messageID: "",
    position: { latitude: 0, longitude: 0, altitude: 0 },
    orientation: { yaw: 0, pitch: 0, roll: 0 },
    acceleration: { yaw: 0, pitch: 0, roll: 0 }
  });

  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDataExhausted, setIsDataExhausted] = useState(false);

  const [satellitePosition, setSatellitePosition] = useState<[number, number, number]>([0, 0, 0]);
  const trajectoryPoints = useRef<THREE.Vector3[]>([]);
  const maxTrajectoryPoints = 1500;

  useEffect(() => {
    fetch('/data.txt')
      .then(response => response.text())
      .then(text => setMessages(text.split(/_+/)))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (messages.length === 0 || isDataExhausted) return;

    const parseMessage = (message: string): SatelliteData => {
      const newData: SatelliteData = {
        messageID: "",
        position: { latitude: 0, longitude: 0, altitude: 0 },
        orientation: { yaw: 0, pitch: 0, roll: 0 },
        acceleration: { yaw: 0, pitch: 0, roll: 0 }
      };

      const messageIdMatch = message.match(/Message\s?(\d+)/);
      const locationMatch = message.match(/L\[(.*?)\]/);
      const orientationMatch = message.match(/R\[(.*?)\]/);
      const accelerationMatch = message.match(/G\[(.*?)\]/);

      if (messageIdMatch) newData.messageID = messageIdMatch[1];

      if (locationMatch) {
        const [lat, long, alt] = locationMatch[1].split(',').map(Number);
        newData.position = { latitude: lat, longitude: long, altitude: alt };
      }

      if (orientationMatch) {
        const [yaw, pitch, roll] = orientationMatch[1].split(',').map(Number);
        newData.orientation = { yaw, pitch, roll };
      }

      if (accelerationMatch) {
        const [yawAcc, pitchAcc, rollAcc] = accelerationMatch[1].split(',').map(Number);
        newData.acceleration = { yaw: yawAcc, pitch: pitchAcc, roll: rollAcc };
      }

      return newData;
    };

    const updateInterval = setInterval(() => {
      if (currentIndex >= messages.length - 1) {
        clearInterval(updateInterval);
        setIsDataExhausted(true);
        return;
      }

      const message = messages[currentIndex];
      const newSatelliteData = parseMessage(message);
      setSatelliteData(newSatelliteData);

      // Update satellite position
      const earthRadius = 6371; // km
      const globeRadius = 4; // 3D scene units
      const scaleFactor = globeRadius / earthRadius;
      const radius = (earthRadius + newSatelliteData.position.altitude) * scaleFactor;

      const { latitude, longitude } = newSatelliteData.position;
      const latRad = latitude * (Math.PI / 180);
      const longRad = longitude * (Math.PI / 180);

      const x = radius * Math.cos(latRad) * Math.cos(longRad);
      const y = radius * Math.sin(latRad);
      const z = radius * Math.cos(latRad) * Math.sin(longRad);

      const newPosition: [number, number, number] = [x, y, z];
      setSatellitePosition(newPosition);

      // Update trajectory
      trajectoryPoints.current.push(new THREE.Vector3(x, y, z));
      if (trajectoryPoints.current.length > maxTrajectoryPoints) {
        trajectoryPoints.current.shift();
      }

      // Move to the next message
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, 3);

    return () => clearInterval(updateInterval);
  }, [messages, currentIndex, isDataExhausted]);

  return (
    <div className="space">
      <Globe textureUrl="./earth_texture.jpg" width="100vw" height="100vh">
        <CustomTrajectory points={trajectoryPoints.current} />
        <Beacon
          objUrl="/beacon.obj"
          mtlUrl="/beacon.mtl"
          scale={0.01}
          yaw={satelliteData.orientation.yaw}
          pitch={satelliteData.orientation.pitch}
          roll={satelliteData.orientation.roll}
          position={satellitePosition}
        />
      </Globe>
    </div>
  );
}

export default App;