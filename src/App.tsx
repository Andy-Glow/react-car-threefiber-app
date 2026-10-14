import React, { Suspense, useState, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, CubeCamera, Environment } from "@react-three/drei";

import { Ground } from "./components/3d/Ground";
import { Car } from "./components/3d/Car";
import { Rings } from "./components/3d/Rings";
import { Boxes } from "./components/3d/Boxes";
import { FloatingGrid } from "./components/3d/FloatingGrid";

import { Hotspots } from "./components/ui/Hotspots";
import { MusicPlayer } from "./components/ui/MusicPlayer";

/* Описываем типы для входящих данных 3D-сцены: пресет графики и видимость точек */
interface CarShowProps {
  quality: string;
  isHotspotsVisible: boolean;
}

/* МЕМОИЗАЦИЯ 3D-СЦЕНЫ: 
   Мы обернули весь CarShow в функцию memo(). Это ключевой элемент оптимизации.
   React будет перерисовывать 3D-сцену только тогда, когда изменятся пропсы quality или видимость точек.
   Клик по кнопке музыки или громкости не повлияет на Canvas! */
const MemoizedCarShow = memo(function CarShow({
  quality,
  isHotspotsVisible,
}: CarShowProps): React.JSX.Element {
  const isLow = quality === "low";
  const isMid = quality === "mid";
  const isHigh = quality === "high";

  /* Проверяем, зашел ли пользователь со смартфона (экран уже 768px) */
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* УМНАЯ НАСТРОЙКА ПАРАМЕТРОВ ПОД ПРЕСЕТЫ И УСТРОЙСТВА:
     - groundResolution (Разрешение зеркала пола): на LOW ставим 256, на MID на смартфонах занижаем до 256 
       ради спасения GPU, а на ПК даем четкие 512. На HIGH выкручиваем ультра-текстуру 1024.
     - cubeCameraFrames (Кадры обновления отражений на кузове): на MID зеркало автомобиля делает 
       всего 2 снимка при старте и засыпает, а на HIGH пересчитывает отражения бесконечно (Infinity).
     - shadowMapSize (Разрешение теней прожекторов): 1024 на MID и 2048 на максималках.
     - dynamicFOV (Угол обзора камеры): на мобилках расширяем до 75 градусов, чтобы Corvette 
       и кольца не обрезались по бокам узкого экрана. На ПК держим фокус в 50 градусов. */
  const groundResolution: number = isLow ? 256 : isMid ? (isMobile ? 256 : 512) : 1024;
  const cubeCameraFrames: number = isHigh ? Infinity : 2;
  const shadowMapSize: number = isMid ? 1024 : 2048;
  const dynamicFOV = isMobile ? 75 : 50;

  return (
    <>
      {/* Мягкий черный туман, который плавно растворяет края 3D-дороги в темноте горизонта */}
      <fog attach='fog' args={["#05050a", 6, 15]} />

      {/* OrbitControls позволяет крутить мышкой вокруг машины, maxPolarAngle запрещает камере падать под пол */}
      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} enablePan={false} />

      {/* Главная 3D-камера сцены с нашим приближенным ракурсом на Corvette C7 */}
      <PerspectiveCamera makeDefault fov={dynamicFOV} position={[5.6, 2.45, 5.6]} />

      {/* Глубокий ночной темно-синий фон сцены, идеально сливающийся с туманом */}
      <color args={["#05050a"]} attach='background' />

      {/* ОПТИМИЗАЦИЯ LOW: На слабом пресете мы полностью убираем тяжелую динамическую камеру отражений,
          заменяя её легким готовым пресетом ночного неба. Видеокарта вздыхает с облегчением! */}
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

      {/* Подключаем наши 3D-объекты и прокидываем в них уровень качества графики */}
      <Rings quality={quality} />
      <Boxes />
      <FloatingGrid quality={quality} />

      {/* Интерактивные точки на кузове автомобиля */}
      <Hotspots isVisible={isHotspotsVisible} />

      {/* Базовый мягкий рассеянный свет в сцене */}
      <ambientLight intensity={0.2} />

      {/* Розовый прожектор сзади-справа от автомобиля. На LOW отключаем расчет теней. */}
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

      {/* Синий прожектор спереди-слева от автомобиля */}
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
  /* Главные стейты приложения: выбранный пресет качества и видимость 3D-маркеров */
  const [quality, setQuality] = useState<string>("low");
  const [isHotspotsVisible, setIsHotspotsVisible] = useState<boolean>(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* УПРАВЛЕНИЕ СГЛАЖИВАНИЕМ ЭКРАНА (DPR):
     На смартфонах жестко зажимаем dpr в единицу на low/mid пресетах. Это спасает телефон от рендеринга 
     сцены в безумном 4K разрешении экрана смартфона (Retina/AMOLED) и убирает перегрев! */
  const dynamicDPR: [number, number] | number = isMobile
    ? quality === "high"
      ? [1, 1.2]
      : 1
    : quality === "low"
      ? [1, 1.2]
      : [1, 1.5];

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 2D HTML-ИНТЕРФЕЙС УПРАВЛЕНИЯ ГРАФИКОЙ (Слева вверху). 
          Все классы разложены по файлам-модулям в styles! */}
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

      {/* Музыкальный плеер (Справа вверху) */}
      <MusicPlayer />

      {/* Suspense удерживает на экране наш неоновый лоадер до тех пор, 
          пока тяжелая модель Corvette и все текстуры полностью не загрузятся в видеокарту */}
      <Suspense
        fallback={
          <div className='loader-container'>
            <div className='loader-text'>Загрузка текстур...</div>
          </div>
        }>
        {/* Canvas — это окно в мир WebGL/Three.js. Все, что внутри него, обрабатывает видеокарта. */}
        <Canvas shadows={quality !== "low"} dpr={dynamicDPR}>
          <MemoizedCarShow quality={quality} isHotspotsVisible={isHotspotsVisible} />
        </Canvas>
      </Suspense>
    </div>
  );
}
