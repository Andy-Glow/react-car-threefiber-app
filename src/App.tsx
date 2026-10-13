import React, { Suspense, useState, memo } from "react";
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

// ИНТЕРФЕЙС ПРОПСОВ ДЛЯ СЦЕНЫ: Описываем входящие типы данных для мемоизированного компонента
interface CarShowProps {
  quality: string;
  isHotspotsVisible: boolean;
}

// Мемоизированная 3D-сцена с явным указанием возвращаемого JSX-элемента
const MemoizedCarShow = memo(function CarShow({
  quality,
  isHotspotsVisible,
}: CarShowProps): React.JSX.Element {
  const isLow = quality === "low";
  const isMid = quality === "mid";
  const isHigh = quality === "high";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Разрешение зеркала пола адаптируется под ПК/Смартфон
  const groundResolution: number = isLow ? 256 : isMid ? (isMobile ? 256 : 512) : 1024;
  const cubeCameraFrames: number = isHigh ? Infinity : 2;
  const shadowMapSize: number = isMid ? 1024 : 2048;

  return (
    <>
      <fog attach='fog' args={["#05050a", 6, 15]} />

      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <PerspectiveCamera makeDefault fov={50} position={[5.6, 2.45, 5.6]} />
      <color args={["#05050a"]} attach='background' />

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

      <Hotspots isVisible={isHotspotsVisible} />

      <ambientLight intensity={0.2} />

      <spotLight
        color={[1, 0.25, 0.7]}
        intensity={380}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow={!isLow}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0002}
      />

      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={540}
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
});

export default function App(): React.JSX.Element {
  // Явно типизируем стейты: качество (строка) и видимость точек (булево)
  const [quality, setQuality] = useState<string>("low");
  const [isHotspotsVisible, setIsHotspotsVisible] = useState<boolean>(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // ТИПИЗАЦИЯ DPR: Указываем тип, который принимает свойство dpr компонента Canvas
  const dynamicDPR: [number, number] | number = isMobile
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

        <button
          onClick={() => setIsHotspotsVisible(!isHotspotsVisible)}
          className={`btn-toggle-hotspots ${!isHotspotsVisible ? "hidden-mode" : ""}`}>
          {isHotspotsVisible ? "👁 Скрыть точки" : "👁 Показать точки"}
        </button>
      </div>

      <MusicPlayer />

      <Suspense
        fallback={
          <div className='loader-container'>
            <div className='loader-text'>Загрузка текстур...</div>
          </div>
        }>
        <Canvas shadows={quality !== "low"} dpr={dynamicDPR}>
          <MemoizedCarShow quality={quality} isHotspotsVisible={isHotspotsVisible} />
        </Canvas>
      </Suspense>
    </div>
  );
}
