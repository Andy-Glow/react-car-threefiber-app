import React, { useEffect } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import {
  RepeatWrapping,
  TextureLoader,
  LinearFilter,
  LinearMipmapLinearFilter,
  Texture,
} from "three";

// Описываем типы для входящих данных: разрешение зеркала (число) и уровень графики (строка)
interface GroundProps {
  resolution: number;
  quality: string;
}

export function Ground({ resolution, quality }: GroundProps): React.JSX.Element {
  /* Загружаем картинки рельефа (карту нормалей) и шероховатости мокрого асфальта.
     С помощью "as Texture[]" объясняем TypeScript, что на выходе получаем массив готовых 3D-текстур. */
  const [roughness, normal] = useLoader(TextureLoader, [
    "textures/terrain-roughness.jpg",
    "textures/terrain-normal.jpg",
  ]) as Texture[];

  useEffect(() => {
    if (!normal || !roughness) return;

    // Проходим циклом по обеим текстурам дороги и настраиваем их поведение
    [normal, roughness].forEach((t) => {
      // Включаем бесконечный повтор асфальта, чтобы трасса никогда не заканчивалась
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;

      // Размножаем узор асфальта 5 на 5 раз на плоскости, чтобы текстура дороги не выглядели слишком растянутой
      t.repeat.set(5, 5);

      /* ОПТИМИЗАЦИЯ ПАМЯТИ: На низких настройках (LOW) отключаем мип-мапы (копии картинок разного размера),
         чтобы освободить ценные мегабайты в видеопамяти ноутбука или смартфона. */
      t.generateMipmaps = quality !== "low";

      /* УМНАЯ ФИЛЬТРАЦИЯ ПОД ПРЕСЕТЫ:
         - LOW: Базовое сглаживание без анизотропии (скорость для слабых устройств)
         - MID: Сбалансированный режим с четкостью 4х
         - HIGH: Включаем трилинейное сглаживание и выкручиваем анизотропию на максимум (16х)  */
      if (quality === "low") {
        t.minFilter = LinearFilter;
        t.magFilter = LinearFilter;
        t.anisotropy = 1;
      } else if (quality === "mid") {
        t.minFilter = LinearFilter;
        t.magFilter = LinearFilter;
        t.anisotropy = 4;
      } else {
        t.minFilter = LinearMipmapLinearFilter;
        t.magFilter = LinearFilter;
        t.anisotropy = 16;
      }

      //Принудительно заставляем видеокарту обновить и применить текстуру на первом же кадре.
      t.needsUpdate = true;
    });
  }, [normal, roughness, quality]);

  // ИГРОВОЙ ЦИКЛ (Вызывается каждый кадр)
  useFrame((state) => {
    // Рассчитываем сдвиг асфальта со скоростью 0.128. "Минус" для перемещения текстуры назад, что бы создать эффект движения.
    const t = -state.clock.getElapsedTime() * 0.128;
    roughness.offset.set(0, t);
    normal.offset.set(0, t);
  });

  return (
    // Большой плоский меш, развернутый горизонтально, который принимает на себя тени от машины
    <mesh rotation-x={-Math.PI * 0.5} castShadow receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        envMapIntensity={0} // Выключаем свечение неба на полу, нам нужны только неоновые отражения
        normalMap={normal} // Подключаем карту нормалей (дает асфальту объемные неровности и трещины)
        normalScale={[0.15, 0.15]} // Сила выдавливания рельефа (делаем легкой, чтобы дорога не казалась бугристой)
        roughnessMap={roughness} // Карта шероховатости (указывает, где асфальт сухой, а где блестит вода)
        // @ts-ignore - Отключаем строгую проверку TS для этой строчки, так как авторы библиотеки забыли добавить ее в типы
        dithered={true} // Дизеринг: убирает некрасивые пиксельные полосы на отражениях света в темноте
        color={[0.015, 0.015, 0.015]} // Угольно-черный цвет асфальта
        roughness={0.7} // Общая гладкость покрытия
        blur={[1000, 400]} // Размытие отражений по горизонтали и вертикали, имитирующее слой воды
        mixBlur={30} // Сила смешивания размытия с четкими гранями
        mixStrength={80} // Общая интенсивность отражений (насколько пол работает как зеркало)
        mixContrast={1} // Контрастность отражающихся неоновых огней
        resolution={resolution} // Тяжелый параметр разрешения зеркала: динамически меняется (256 / 512 / 1024)
        mirror={1} // Коэффициент зеркальности покрытия
        depthScale={0.01} // Масштаб глубины отражения
        minDepthThreshold={0.9} // Минимальный порог глубины
        maxDepthThreshold={1} // Максимальный порог глубины
        depthToBlurRatioBias={0.25} // Смещение размытия в зависимости от расстояния до машины
        debug={0}
        reflectorOffset={0.2} // Смещение отражения относительно плоскости меша
      />
    </mesh>
  );
}
