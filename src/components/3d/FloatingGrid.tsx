import React, { useEffect } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { RepeatWrapping, TextureLoader, Texture } from "three";

// ИНТЕРФЕЙС ПРОПСОВ: Описываем строку качества графики, которую принимает сетка
interface FloatingGridProps {
  quality: string;
}

export function FloatingGrid({ quality }: FloatingGridProps): React.JSX.Element {
  // ТИПИЗАЦИЯ ЛОАДЕРА: Указываем дженериком Texture, чтобы TS понимал свойства объекта diffuse
  const diffuse = useLoader(TextureLoader, "/textures/grid-texture.png") as Texture;

  useEffect(() => {
    if (!diffuse) return;
    diffuse.wrapS = RepeatWrapping;
    diffuse.wrapT = RepeatWrapping;
    diffuse.repeat.set(30, 30);
    diffuse.offset.set(0, 0);

    // Анизотропия: на лету подставляем четкость под выбранный пресет
    diffuse.anisotropy = quality === "low" ? 1 : quality === "mid" ? 4 : 16;
  }, [diffuse, quality]);

  useFrame((state) => {
    // Двигаем сетку назад, создавая эффект движения машины
    const t = -state.clock.getElapsedTime() * 0.68;
    diffuse.offset.set(0, t);
  });

  return (
    <mesh rotation-x={-Math.PI * 0.5} position={[0, 0.425, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial
        color={[1, 1, 1]}
        opacity={0.35}
        map={diffuse}
        alphaMap={diffuse}
        transparent={true}
      />
    </mesh>
  );
}
