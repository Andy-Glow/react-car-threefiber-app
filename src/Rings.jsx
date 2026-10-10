import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color } from "three"; // Строка 3 у автора

export function Rings() {
  const itemsRef = useRef([]);

  useFrame((state) => {
    let elapsed = state.clock.getElapsedTime(); // Строка 9 у автора

    for (let i = 0; i < itemsRef.current.length; i++) {
      let mesh = itemsRef.current[i];

      if (mesh) {
        // ФИНАЛЬНАЯ ФОРМУЛА ДВИЖЕНИЯ ИЗ ВИДЕО (Строка 15)
        let z = (i - 7) * 3.5 + ((elapsed * 0.4) % 3.5) * 2;
        mesh.position.set(0, 0, -z);

        // Масштабирование в перспективу (Строка 18-19)
        let dist = Math.abs(z);
        mesh.scale.set(1 - dist * 0.04, 1 - dist * 0.04, 1 - dist * 0.04);

        // Плавное угасание цвета на горизонте (Строка 21-25)
        let colorScale = 1;
        if (dist > 2) {
          colorScale = 1 - (Math.min(dist, 12) - 2) / 10;
        }
        colorScale *= 0.5;

        // Настройка сочных неоновых цветов (Строка 27-31)
        if (i % 2 === 1) {
          mesh.material.emissive = new Color(6, 0.15, 0.7).multiplyScalar(
            colorScale,
          );
        } else {
          mesh.material.emissive = new Color(0.1, 0.7, 3).multiplyScalar(
            colorScale,
          );
        }
      }
    }
  });

  return (
    <>
      {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((v, i) => (
        <mesh
          castShadow
          receiveShadow
          position={[0, 0, 0]}
          key={i}
          ref={(el) => (itemsRef.current[i] = el)}
        >
          {/* НАША ОПТИМИЗАЦИЯ: 40 сегментов вместо 100 для плавной работы GPU */}
          <torusGeometry args={[3.35, 0.05, 16, 40]} />
          <meshStandardMaterial emissive={[0.5, 0.5, 0.5]} color={[0, 0, 0]} />
        </mesh>
      ))}
    </>
  );
}
