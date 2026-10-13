import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import { RepeatWrapping, TextureLoader } from "three";

export function FloatingGrid({ quality }) {
  const diffuse = useLoader(TextureLoader, "/textures/grid-texture.png");

  useEffect(() => {
    if (!diffuse) return;
    diffuse.wrapS = RepeatWrapping;
    diffuse.wrapT = RepeatWrapping;
    diffuse.repeat.set(30, 30);
    diffuse.offset.set(0, 0);

    // Анизотропия: 1 на low, 4 на mid, 16 на high
    diffuse.anisotropy = quality === "low" ? 1 : quality === "mid" ? 4 : 16;
  }, [diffuse, quality]);

  useFrame((state) => {
    let t = -state.clock.getElapsedTime() * 0.68;
    diffuse.offset.set(0, t);
  });

  return (
    <mesh rotation-x={-Math.PI * 0.5} position={[0, 0.425, 0]}>
      {/* ИСПРАВЛЕНИЕ: Поставили размеры плоскости 30 на 30 */}
      <planeGeometry args={[30, 30]} />

      <meshBasicMaterial
        // ИСПРАВЛЕНИЕ: Поставили белый цвет RGB, чтобы текстура отображалась корректно
        color={[1, 1, 1]}
        opacity={0.15}
        map={diffuse}
        alphaMap={diffuse}
        transparent={true}
      />
    </mesh>
  );
}
