import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import "./styles/index.scss";
import { OrbitControls, PerspectiveCamera, CubeCamera, Environment } from "@react-three/drei";

import { Ground } from "./components/3d/Ground";
import { Car } from "./components/3d/Car";
import { Rings } from "./components/3d/Rings";
import { Boxes } from "./components/3d/Boxes";
import { FloatingGrid } from "./components/3d/FloatingGrid";

import { Hotspots } from "./components/ui/Hotspots";
import { MusicPlayer } from "./components/ui/MusicPlayer";

function CarShow({ quality }) {
  const isLow = quality === "low";
  const isMid = quality === "mid";
  const isHigh = quality === "high";

  const groundResolution = isLow ? 256 : isMid ? 512 : 1024;
  const cubeCameraFrames = isHigh ? Infinity : 2;

  return (
    <>
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
      <color args={[0, 0, 0]} attach='background' />

      <CubeCamera resolution={128} frames={cubeCameraFrames}>
        {(texture) => (
          <>
            <Environment map={texture} />
            <Car />
          </>
        )}
      </CubeCamera>

      <Rings />
      <Boxes />
      <FloatingGrid />
      <Hotspots />

      <ambientLight intensity={0.2} />

      <spotLight
        color={[1, 0.25, 0.7]}
        intensity={280}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow={!isLow}
        shadow-bias={-0.0001}
      />

      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={340}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
        castShadow={!isLow}
        shadow-bias={-0.0001}
      />

      <Ground resolution={groundResolution} />
    </>
  );
}

export default function App() {
  const [quality, setQuality] = useState("low");

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* МЕНЮ НАСТРОЕК ГРАФИКИ */}
      <div className='ui-container'>
        {["low", "mid", "high"].map((q) => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            className={`btn-quality ${quality === q ? "active" : ""}`}>
            {q}
          </button>
        ))}
      </div>

      <MusicPlayer />

      <Suspense
        fallback={<div style={{ color: "white", padding: "20px" }}>Загрузка текстур...</div>}>
        <Canvas
          shadows={quality !== "low"}
          gl={{ legacy: false }}
          dpr={[1, quality === "low" ? 1.2 : 1.5]}>
          <CarShow quality={quality} />
        </Canvas>
      </Suspense>
    </div>
  );
}
