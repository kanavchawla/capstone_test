import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParkingLotResponsive = () => {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  let renderer, scene;

  useEffect(() => {
    // Scene setup
    scene = new THREE.Scene();

    // Responsive Camera setup
    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 100; // Increase zoom level for larger slots
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspectRatio) / -2,
      (frustumSize * aspectRatio) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    camera.position.set(0, 100, 0); // Adjust camera position for better view
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Parking Slot Creation Function
    const createParkingSlot = (x, z, isDisabled = false) => {
      const slotWidth = 5;   // Increase slot width
      const slotLength = 10; // Increase slot length
      const lineWidth = 0.1; // Adjust line width

      const slotGroup = new THREE.Group();

      // Parking slot base
      const slotBase = new THREE.Mesh(
        new THREE.PlaneGeometry(slotWidth, slotLength),
        new THREE.MeshBasicMaterial({ color: isDisabled ? 0xffff00 : 0x666666 })
      );
      slotBase.rotation.x = -Math.PI / 2;
      slotBase.position.set(x, 0.01, z);
      slotGroup.add(slotBase);

      // Parking lines (left and right)
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const lineGeometry = new THREE.PlaneGeometry(lineWidth, slotLength);

      const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
      leftLine.rotation.x = -Math.PI / 2;
      leftLine.position.set(x - slotWidth / 2, 0.02, z);
      slotGroup.add(leftLine);

      const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
      rightLine.rotation.x = -Math.PI / 2;
      rightLine.position.set(x + slotWidth / 2, 0.02, z);
      slotGroup.add(rightLine);

      return slotGroup;
    };

    // Create multiple parking rows
    const createParkingLot = () => {
      const rows = 5;
      const cols = 10;
      const parkingLotGroup = new THREE.Group();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * 6 - (cols * 3); // Adjust spacing for larger slots
          const z = row * 12 - (rows * 6); // Adjust row spacing for larger slots
          const isDisabled = (row === 1 && col >= 3); // Handicapped spaces
          const slot = createParkingSlot(x, z, isDisabled);
          parkingLotGroup.add(slot);
        }
      }

      return parkingLotGroup;
    };

    // Add parking lot to the scene
    const parkingLot = createParkingLot();
    scene.add(parkingLot);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, cameraRef.current);
    };

    animate();

    // Handle window resize for responsiveness
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);

      const aspectRatio = width / height;
      const camera = cameraRef.current;
      camera.left = (-frustumSize * aspectRatio) / 2;
      camera.right = (frustumSize * aspectRatio) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Scroll handler
  const handleScroll = (event) => {
    const scrollSpeed = 0.5;
    const delta = event.deltaY * scrollSpeed;
    const camera = cameraRef.current;
    if (camera) {
      camera.position.y += delta;
      camera.position.y = Math.max(10, camera.position.y); // Limit zoom out
    }
  };

  return (
    <div
      ref={mountRef}
      style={{ width: '100vw', height: '100vh', overflow: 'auto' }}
      onWheel={handleScroll}
    />
  );
};

export default ParkingLotResponsive;
