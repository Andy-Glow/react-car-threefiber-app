// Добавили useFrame в импорт на первой строке
import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import { RepeatWrapping, TextureLoader } from "three";

export function FloatingGrid() {
  const diffuse = useLoader(TextureLoader, "/textures/grid-texture.png");

  useEffect(() => {
    diffuse.wrapS = RepeatWrapping;
    diffuse.wrapT = RepeatWrapping;
    diffuse.anisotropy = 4;
    diffuse.repeat.set(30, 30);
    diffuse.offset.set(0, 0);
  }, [diffuse]);

  // АНИМАЦИЯ ИЗ ВИДЕО (с исправлением опечатки автора):
  useFrame((state) => {
    // Получаем чистое время работы сцены
    let t = -state.clock.getElapsedTime() * 0.68;
    // Сдвигаем текстуру по оси Y (для плоскости это направление движения "вперед-назад")
    diffuse.offset.set(0, t);
  });

  return (
    <>
      <mesh rotation-x={-Math.PI * 0.5} position={[0, 0.425, 0]}>
        <planeGeometry args={[35, 35]} />
        <meshBasicMaterial
          color={[1, 1, 1]}
          opacity={0.15}
          map={diffuse}
          alphaMap={diffuse}
          transparent={true}
        />
      </mesh>
    </>
  );
}
