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

// ИНТЕРФЕЙС ПРОПСОВ: Описываем типы для входящего разрешения и пресета графики
interface GroundProps {
  resolution: number;
  quality: string;
}

export function Ground({ resolution, quality }: GroundProps): React.JSX.Element {
  // ТИПИЗАЦИЯ ЛОАДЕРА: Принудительно кастуем результат к массиву Texture[],
  // чтобы TypeScript понимал свойства и методы объектов normal и roughness
  const [roughness, normal] = useLoader(TextureLoader, [
    "/textures/terrain-roughness.jpg",
    "/textures/terrain-normal.jpg",
  ]) as Texture[];

  useEffect(() => {
    if (!normal || !roughness) return;

    [normal, roughness].forEach((t) => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.repeat.set(5, 5);

      // На LOW полностью выключаем мип-мапы ради экономии видеопамяти VRAM
      t.generateMipmaps = quality !== "low";

      // Динамическая аппаратная фильтрация текстур под выбранный пресет графики
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
        t.anisotropy = 16; // Ультра-четкость на HIGH для мощных ПК
      }

      // Наш главный хак для прогрузки без F5:
      // Принудительно обновляем текстуру в памяти GPU прямо сейчас
      t.needsUpdate = true;
    });
  }, [normal, roughness, quality]);

  useFrame((state) => {
    // Анимируем сдвиг текстур по оси Y, создавая эффект бешеного движения дороги
    const t = -state.clock.getElapsedTime() * 0.128;
    roughness.offset.set(0, t);
    normal.offset.set(0, t);
  });

  return (
    <mesh rotation-x={-Math.PI * 0.5} castShadow receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        envMapIntensity={0}
        normalMap={normal}
        normalScale={[0.15, 0.15]}
        roughnessMap={roughness}
        // @ts-ignore  Отключаем проверку TS, так как авторы drei забыли добавить dithered в тип
        dithered={true}
        color={[0.015, 0.015, 0.015]}
        roughness={0.7}
        blur={[1000, 400]}
        mixBlur={30}
        mixStrength={80}
        mixContrast={1}
        resolution={resolution}
        mirror={1}
        depthScale={0.01}
        minDepthThreshold={0.9}
        maxDepthThreshold={1}
        depthToBlurRatioBias={0.25}
        debug={0}
        reflectorOffset={0.2}
      />
    </mesh>
  );
}
