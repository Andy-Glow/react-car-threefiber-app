import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import "./index.css";
import { OrbitControls, PerspectiveCamera, CubeCamera, Environment } from "@react-three/drei";
import { Ground } from "./Ground";
import { Car } from "./Car";
import { Rings } from "./Rings";
import { Boxes } from "./Boxes";
import { FloatingGrid } from "./FloatingGrid";
import { Hotspots } from "./Hotspots";

function CarShow({ quality }) {
  // Определяем флаги для каждого уровня графики
  const isLow = quality === "low";
  const isMid = quality === "mid";
  const isHigh = quality === "high";

  // Динамическое разрешение для отражений пола (передаем в Ground)
  const groundResolution = isLow ? 256 : isMid ? 512 : 1024;

  // Режим работы CubeCamera: 2 кадра для экономии или Infinity для честного реального времени
  const cubeCameraFrames = isHigh ? Infinity : 2;

  return (
    <>
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
      <color args={[0, 0, 0]} attach='background' />

      {/* Переключаем frames динамически: 2 или Infinity */}
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

      {/* Включаем тени (castShadow) только на Mid и High пресетах */}
      <spotLight
        color={[1, 0.25, 0.7]}
        intensity={150}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow={!isLow}
        shadow-bias={-0.0001}
      />

      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={200}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
        castShadow={!isLow}
        shadow-bias={-0.0001}
      />

      {/* Передаем динамическое разрешение в компонент пола */}
      <Ground resolution={groundResolution} />
    </>
  );
}

export default function App() {
  // По дефолту ставим low. На мощном ПК мы сможем переключить на Mid и High!
  const [quality, setQuality] = useState("low");

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* СТИЛЬНОЕ НЕОНОВОЕ МЕНЮ НАСТРОЕК ГРАФИКИ */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
          display: "flex",
          gap: "10px",
          fontFamily: "sans-serif",
        }}>
        {["low", "mid", "high"].map((q) => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            style={{
              padding: "8px 16px",
              background: quality === q ? "#ff3333" : "rgba(15, 15, 25, 0.8)",
              color: "white",
              border: quality === q ? "1px solid #ff3333" : "1px solid #555",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "12px",
              letterSpacing: "1px",
              boxShadow: quality === q ? "0 0 10px #ff3333" : "none",
              transition: "all 0.2s ease",
            }}>
            {q}
          </button>
        ))}
      </div>

      <Suspense
        fallback={<div style={{ color: "white", padding: "20px" }}>Загрузка текстур...</div>}>
        {/* Canvas активирует тени, только если выбран режим mid или high */}
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
