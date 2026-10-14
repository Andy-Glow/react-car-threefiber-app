import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color } from "three";

// Описываем типы для входящих пропсов. Указываем, что качество графики quality — это строго строка.
interface RingsProps {
  quality: string;
}

export function Rings({ quality }: RingsProps): React.JSX.Element {
  /* ТИПИЗАЦИЯ МАССИВА РЕФОВ:
     Создаем пустой массив рефов. Указываем TypeScript, что внутри будут лежать либо 3D-меши (Mesh), либо null.
     Это нужно, чтобы управлять каждым из 14 колец по отдельности прямо в коде анимации. */
  const itemsRef = useRef<(Mesh | null)[]>([]);

  /* ДИНАМИЧЕСКАЯ ГЕОМЕТРИЯ: Вычисляем количество сегментов кольца на лету.
     - На LOW кольца весят мало (40 сегментов) для высокого FPS на слабых устройствах.
     - На MID ставим сбалансированные 70 сегментов.
     - На HIGH делаем ультра-гладкие, идеально круглые кольца (120 сегментов) для мощных ПК. */
  const segments: number = quality === "low" ? 40 : quality === "mid" ? 70 : 120;

  // ИГРОВОЙ ЦИКЛ (Вызывается каждый кадр)
  useFrame((state) => {
    // Получаем общее время работы сцены в секундах
    const elapsed = state.clock.getElapsedTime();

    // Запускаем цикл, который по очереди берет каждое из 14 колец и рассчитывает его позицию
    for (let i = 0; i < itemsRef.current.length; i++) {
      const mesh = itemsRef.current[i];

      // Если кольцо уже создано и существует на сцене — анимируем его
      if (mesh) {
        /* Формула бесконечного полета: рассчитываем координату Z.
           Кольца плавно двигаются по направлению к камере, а за счет математического остатка от деления (%) 
           они вовремя телепортируются на горизонт, создавая иллюзию бесконечного тоннеля. */
        const z = (i - 7) * 3.5 + ((elapsed * 0.4) % 3.5) * 2;
        mesh.position.set(0, 0, -z);

        // МАСШТАБИРОВАНИЕ: Чем дальше кольцо улетает по оси Z, тем меньше оно становится в размерах
        const dist = Math.abs(z);
        mesh.scale.set(1 - dist * 0.04, 1 - dist * 0.04, 1 - dist * 0.04);

        /* ПЛАВНОЕ УГАСАНИЕ: Рассчитываем коэффициент яркости. 
           Кольца плавно растворяются в темноте и тумане по мере приближения к горизонту. */
        let colorScale = 1;
        if (dist > 2) {
          colorScale = 1 - (Math.min(dist, 12) - 2) / 10;
        }
        colorScale *= 0.5;

        // Принудительно говорим TypeScript, что у этого кольца стандартный материал.
        const material = mesh.material as import("three").MeshStandardMaterial;

        if (material) {
          /* Чередуем неоновые цвета: нечетные кольца красим в розовый, а четные — в синий.
             multiplyScalar умножает цвет на коэффициент угасания, делая дальние кольца блеклыми. */
          if (i % 2 === 1) {
            material.emissive = new Color(6, 0.15, 0.7).multiplyScalar(colorScale);
          } else {
            material.emissive = new Color(0.1, 0.7, 3).multiplyScalar(colorScale);
          }
        }
      }
    }
  });

  return (
    <>
      {Array(14) //Массив из 14 колец
        .fill(0)
        .map((_, i) => (
          <mesh
            castShadow
            receiveShadow
            position={[0, 0, 0]} // Базовая позиция в центре сцены (сдвиг настроен в useFrame)
            key={i}
            ref={(el) => {
              // Записываем ссылку на каждое отрендеренное кольцо в наш массив по его порядковому индексу
              itemsRef.current[i] = el;
            }}>
            <torusGeometry args={[3.35, 0.05, 16, segments]} />
            <meshStandardMaterial emissive={[0.5, 0.5, 0.5]} color={[0, 0, 0]} />
          </mesh>
        ))}
    </>
  );
}
