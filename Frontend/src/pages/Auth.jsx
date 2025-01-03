import React, { useEffect, useRef, useState } from "react";
import Register from "../components/Register";
import { Experience } from "../components/Experience";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Login from "../components/Login";

const MovingGrid = () => {
  const gridRef1 = useRef();
  const gridRef2 = useRef();

  useFrame((state, delta) => {
    gridRef1.current.position.z -= delta * 0.8;
    gridRef2.current.position.z -= delta * 0.8;

    if (gridRef1.current.position.z < -4) {
      gridRef1.current.position.z = gridRef2.current.position.z + 4;
    }
    if (gridRef2.current.position.z < -4) {
      gridRef2.current.position.z = gridRef1.current.position.z + 4;
    }
  });

  const createSquareGrid = () => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const size = 50;
    const divisions = 20;
    const step = size / divisions;

    for (let i = 0; i <= divisions; i++) {
      for (let j = 0; j <= divisions; j++) {
        const x = j * step - size / 2;
        const y = i * step - size / 2;

        if (j < divisions) {
          positions.push(x, y, 0);
          positions.push(x + step, y, 0);
        }

        if (i < divisions) {
          positions.push(x, y, 0);
          positions.push(x, y + step, 0);
        }
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geometry;
  };

  useEffect(() => {
    gsap.fromTo(
      [gridRef1.current, gridRef2.current],
      { opacity: 0, rotationX: Math.PI / 4 },
      { opacity: 1, rotationX: -Math.PI / 2, duration: 1.5, delay: 0.5 }
    );
  }, []);

  return (
    <group position-y={-1.5}>
      <line ref={gridRef1} rotation-x={-Math.PI / 2} position-z={-2}>
        <primitive object={createSquareGrid()} />
        <lineBasicMaterial color="#666666" transparent opacity={0.5} />
      </line>
      <line ref={gridRef2} rotation-x={-Math.PI / 2} position-z={-6}>
        <primitive object={createSquareGrid()} />
        <lineBasicMaterial color="#666666" transparent opacity={0.5} />
      </line>
    </group>
  );
};

const TextBehind = () => {
  const textGroupRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      textGroupRef.current.position,
      { y: -5 },
      { y: 2.5, duration: 1.5, ease: "power3.out" }
    );

    gsap.fromTo(
      textGroupRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: "power3.out" }
    );

    gsap.to(textGroupRef.current, {
      outlineColor: "#fff",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
    });
  }, []);

  return (
    <group ref={textGroupRef} position={[0, 1.5, 0]}>
      <Text
        fontSize={2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Rose
      </Text>
    </group>
  );
};

const Auth = () => {
  const formRef = useRef(null); 
  const [isRegister, setisRegister] = useState(true); 

  useGSAP(() => {
    gsap.fromTo(formRef.current, {
            x:'-100%',
          opacity: 0,
          ease: "power3.out", 
        }, 
        {
            x: 0, 
            duration: 1,
            opacity: 1,
            delay: 2,
            ease: "power3.out"
          }
    );
  })
  return (
    <div>
      <div className="h-dvh w-dvw fixed">
        <Canvas>
          <TextBehind />
          <Experience />
          <MovingGrid />
        </Canvas>
      </div>
      <div
      ref={formRef}
        className="flex w-[380px] bg-transparent justify-start pl-10 items-center h-dvh"
      >
        {isRegister ? <Register setisRegister={setisRegister}/> : <Login setisRegister={setisRegister}/> }
      </div>
    </div>
  );
};

export default Auth;
