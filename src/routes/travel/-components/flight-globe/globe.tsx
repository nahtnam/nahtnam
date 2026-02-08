import { OrbitControls } from "@react-three/drei";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { Color, PerspectiveCamera } from "three";
import ThreeGlobe from "three-globe";
import countries from "@/data/globe.json";
import type { AirportData, ArcData } from "../../-lib/types";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElements["mesh"] & {
      new (): ThreeGlobe;
    };
  }
}

const ASPECT = 1.2;
const CAMERA_Z = 300;

interface FlightGlobeInnerProps {
  arcs: ArcData[];
  airportPoints: AirportData[];
}

interface GlobeConfig {
  atmosphereAltitude: number;
  atmosphereColor: string;
  emissive: string;
  emissiveIntensity: number;
  globeColor: string;
  polygonColor: string;
  shininess: number;
  showAtmosphere: boolean;
}

const globeConfig: GlobeConfig = {
  atmosphereAltitude: 0.1,
  atmosphereColor: "#ffffff",
  emissive: "#d1d5db",
  emissiveIntensity: 5,
  globeColor: "#d1d5db",
  polygonColor: "#e5e7eb",
  shininess: 0,
  showAtmosphere: false,
};

export function FlightGlobeInner(props: FlightGlobeInnerProps) {
  return (
    <div className="aspect-square w-full max-w-[600px]">
      <Canvas camera={new PerspectiveCamera(50, ASPECT, 1, 1800)}>
        <RendererConfig />
        <ambientLight color="#ffffff" intensity={1.5} />
        <GlobeObject airportPoints={props.airportPoints} arcs={props.arcs} />
        <OrbitControls
          autoRotate={true}
          autoRotateSpeed={1}
          enablePan={false}
          enableZoom={false}
          maxDistance={CAMERA_Z}
          maxPolarAngle={Math.PI - Math.PI / 3}
          minDistance={CAMERA_Z}
          minPolarAngle={Math.PI / 3.5}
        />
      </Canvas>
    </div>
  );
}

function RendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xff_aa_ff, 0);
  }, [gl, size]);

  return null;
}

interface GlobeObjectProps {
  arcs: ArcData[];
  airportPoints: AirportData[];
}

function GlobeObject(props: GlobeObjectProps) {
  const { arcs, airportPoints } = props;
  const globeRef = useRef<ThreeGlobe | null>(null);
  const groupRef = useRef<Group>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!globeRef.current && groupRef.current) {
      globeRef.current = new ThreeGlobe();
      groupRef.current.add(globeRef.current);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }
    if (!isInitialized) {
      return;
    }

    const material = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    material.color = new Color(globeConfig.globeColor);
    material.emissive = new Color(globeConfig.emissive);
    material.emissiveIntensity = globeConfig.emissiveIntensity;
    material.shininess = globeConfig.shininess;
  }, [isInitialized]);

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }
    if (!isInitialized) {
      return;
    }

    globeRef.current
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.2)
      .hexPolygonColor(() => globeConfig.polygonColor)
      .showAtmosphere(globeConfig.showAtmosphere)
      .atmosphereColor(globeConfig.atmosphereColor)
      .atmosphereAltitude(globeConfig.atmosphereAltitude);

    globeRef.current
      .arcsData(arcs)
      .arcStartLat((d) => (d as ArcData).startLat)
      .arcStartLng((d) => (d as ArcData).startLng)
      .arcEndLat((d) => (d as ArcData).endLat)
      .arcEndLng((d) => (d as ArcData).endLng)
      .arcColor(() => "#3b82f6")
      .arcStroke(0.3)
      .arcDashLength(0.3)
      .arcDashGap(0.7)
      .arcDashAnimateTime((d) => (d as ArcData).animateTime);

    const points = airportPoints.map((p) => ({
      color: "#3b82f6",
      lat: p.lat,
      lng: p.lng,
    }));

    const filteredPoints = points.filter(
      (v, i, a) =>
        a.findIndex((v2) => v2.lat === v.lat && v2.lng === v.lng) === i
    );

    globeRef.current
      .pointsData(filteredPoints)
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(false)
      .pointAltitude(0.006)
      .pointRadius(0.25);
  }, [isInitialized, arcs, airportPoints]);

  return <group ref={groupRef} />;
}
