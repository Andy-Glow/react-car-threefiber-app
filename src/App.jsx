import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import "./index.css";
import {
  OrbitControls,
  PerspectiveCamera,
  CubeCamera,
  Environment,
} from "@react-three/drei";
import { Ground } from "./Ground";
import { Car } from "./Car";
import { Rings } from "./Rings";
import { Boxes } from "./Boxes";
import { FloatingGrid } from "./FloatingGrid";
import { Hotspots } from "./Hotspots";

// УБРАЛИ ТЯЖЕЛЫЕ ИМПОРТЫ ПОСТПРОЦЕССИНГА, ЧТОБЫ ОНИ НЕ СМУЩАЛИ СБОРЩИК

function CarShow() {
  return (
    <>
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />

      <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />

      <color args={[0, 0, 0]} attach="background" />

      {/* Оставляем CubeCamera - она давала крутые отражения на полу и работала! */}
      <CubeCamera resolution={128} frames={Infinity}>
        {(texture) => (
          <>
            <Environment map={texture} />
            <Car />
          </>
        )}
      </CubeCamera>

      <Rings />
      <Boxes />

      <ambientLight intensity={0.2} />

      {/* Розовый прожектор */}
      <spotLight
        color={[1, 0.25, 0.7]}
        intensity={150}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
      />

      {/* Синий прожектор */}
      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={200}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
      />

      <Hotspots />
      <Ground />
      <FloatingGrid />

      {/* ПОЛНОСТЬЮ УДАЛИЛИ БЛОК <EffectComposer> */}
    </>
  );
}

function App() {
  return (
    <Suspense
      fallback={
        <div style={{ color: "white", padding: "20px" }}>
          Загрузка текстур...
        </div>
      }
    >
      {/* Возвращаем базовые настройки Canvas, без теней для максимального FPS */}
      <Canvas shadows={false} gl={{ legacy: false }} dpr={[1, 1.5]}>
        <CarShow />
      </Canvas>
    </Suspense>
  );
}

export default App;
