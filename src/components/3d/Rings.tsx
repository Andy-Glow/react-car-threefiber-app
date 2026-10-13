import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color } from "three";

// ИНТЕРФЕЙС ПРОПСОВ: Типизируем входящую строку графики
interface RingsProps {
  quality: string;
}

export function Rings({ quality }: RingsProps): React.JSX.Element {
  // ТИПИЗАЦИЯ МАССИВА РЕФОВ:
  // Указываем TypeScript, что внутри рефа лежит массив, содержащий либо 3D-меши (Mesh), либо null
  const itemsRef = useRef<(Mesh | null)[]>([]);

  // На лету вычисляем количество сегментов тора под выбранный пресет графики
  const segments: number = quality === "low" ? 40 : quality === "mid" ? 70 : 120;

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    for (let i = 0; i < itemsRef.current.length; i++) {
      const mesh = itemsRef.current[i];

      // Если меш существует в этой итерации цикла — анимируем его
      if (mesh) {
        const z = (i - 7) * 3.5 + ((elapsed * 0.4) % 3.5) * 2;
        mesh.position.set(0, 0, -z);

        // Масштабируем кольца по мере их отдаления
        const dist = Math.abs(z);
        mesh.scale.set(1 - dist * 0.04, 1 - dist * 0.04, 1 - dist * 0.04);

        // Плавное угасание яркости у горизонта
        let colorScale = 1;
        if (dist > 2) {
          colorScale = 1 - (Math.min(dist, 12) - 2) / 10;
        }
        colorScale *= 0.5;

        // Важно: Принудительно кастуем материал к MeshStandardMaterial,
        // чтобы TypeScript знал, что у этого материала есть свойство 'emissive'
        const material = mesh.material as import("three").MeshStandardMaterial;

        if (material) {
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
      {Array(14)
        .fill(0)
        .map((_, i) => (
          <mesh
            castShadow
            receiveShadow
            position={[0, 0, 0]}
            key={i}
            // Записываем каждый отрендеренный меш в наш типизированный массив по индексу
            ref={(el) => {
              itemsRef.current[i] = el;
            }}>
            <torusGeometry args={[3.35, 0.05, 16, segments]} />
            <meshStandardMaterial emissive={[0.5, 0.5, 0.5]} color={[0, 0, 0]} />
          </mesh>
        ))}
    </>
  );
}
