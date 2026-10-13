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

  // МОБИЛЬНЫЙ ХАК: Проверяем, зашел ли пользователь с экрана телефона (меньше 768px)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Динамическое разрешение пола:
  // На ПК: low = 256, mid = 512, high = 1024
  // На СМАРТФОНЕ: для MID снижаем разрешение до 256, чтобы не греть GPU, но сохраняем тени!
  const groundResolution = isLow ? 256 : isMid ? (isMobile ? 256 : 512) : 1024;

  const cubeCameraFrames = isHigh ? Infinity : 2;
  const shadowMapSize = isMid ? 1024 : 2048;

  return (
    <>
      <fog attach='fog' args={["#05050a", 6, 15]} />

      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <PerspectiveCamera makeDefault fov={50} position={[8, 3.5, 8]} />
      <color args={["#05050a"]} attach='background' />

      {/* На LOW полностью выключаем CubeCamera.
          На MID на мобилках она сделает 2 легких снимка при загрузке и уснет */}
      {isLow ? (
        <>
          <Environment preset='night' />
          <Car />
        </>
      ) : (
        <CubeCamera resolution={128} frames={cubeCameraFrames}>
          {(texture) => (
            <>
              <Environment map={texture} />
              <Car />
            </>
          )}
        </CubeCamera>
      )}

      <Rings quality={quality} />
      <Boxes />
      <FloatingGrid quality={quality} />
      <Hotspots />

      <ambientLight intensity={0.2} />

      <spotLight
        color={[1, 0.25, 0.7]}
        intensity={380} // Усиленная яркость
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow={!isLow}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0002}
      />

      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={540} // Усиленная яркость
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
        castShadow={!isLow}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0002}
      />

      <Ground resolution={groundResolution} quality={quality} />
    </>
  );
}

export default function App() {
  const [quality, setQuality] = useState("low");

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // УПРАВЛЕНИЕ РАЗРЕШЕНИЕМ ЭКРАНА (DPR):
  // Если это мобилка, жестко держим dpr={1} на low/mid, чтобы не рендерить сцену в 4К разрешении экрана телефона.
  // На ПК оставляем четкие [1, 1.5]
  const dynamicDPR = isMobile
    ? quality === "high"
      ? [1, 1.2]
      : 1
    : quality === "low"
      ? [1, 1.2]
      : [1, 1.5];

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div className='ui-container'>
        <div className='quality-row'>
          {["low", "mid", "high"].map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`btn-quality ${quality === q ? "active" : ""}`}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <MusicPlayer />

      <Suspense
        fallback={
          <div className='loader-container'>
            <div className='loader-text'>Загрузка текстур...</div>
          </div>
        }>
        <Canvas shadows={quality !== "low"} gl={{ legacy: false }} dpr={dynamicDPR}>
          <CarShow quality={quality} />
        </Canvas>
      </Suspense>
    </div>
  );
}
