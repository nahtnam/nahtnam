/* oxlint-disable react/no-unknown-property */
import {
  Environment,
  MeshReflectorMaterial,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import type { Group, MeshStandardMaterial } from "three";

const MODEL_PATH = "/assets/models/golf-r/scene.gltf";

function GolfRModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    scene.traverse((child) => {
      if (!("isMesh" in child && child.isMesh)) {
        return;
      }

      const mesh = child as unknown as { material: MeshStandardMaterial };

      if (mesh.material.name !== "CarPaint") {
        return;
      }

      mesh.material.color = new Color("#e8e8e8");
      mesh.material.metalness = 0.4;
      mesh.material.roughness = 0.2;
      mesh.material.needsUpdate = true;
    });
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]} scale={[64, 64, 64]}>
      <primitive object={scene} />
    </group>
  );
}

function Ground() {
  return (
    <mesh position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        color="#f2f2f2"
        depthScale={1.2}
        maxDepthThreshold={1.4}
        metalness={0.35}
        minDepthThreshold={0.4}
        mirror={0.25}
        mixBlur={1}
        mixStrength={18}
        resolution={512}
        roughness={0.9}
      />
    </mesh>
  );
}

export function CarSceneInner() {
  return (
    <div className="h-[320px] w-full md:h-[390px]">
      <Canvas
        shadows
        camera={{ far: 100, fov: 35, near: 0.1, position: [0.15, 0.8, 3.1] }}
      >
        <fog args={["#f2f2f2", 8, 25]} attach="fog" />
        <ambientLight intensity={1.3} />
        <spotLight
          castShadow
          angle={0.5}
          intensity={70}
          penumbra={1}
          position={[5, 8, 5]}
        />
        <spotLight
          angle={0.5}
          color="#4f46e5"
          intensity={18}
          penumbra={1}
          position={[-5, 6, -5]}
        />
        <GolfRModel />
        <Ground />
        <OrbitControls
          autoRotate={false}
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
