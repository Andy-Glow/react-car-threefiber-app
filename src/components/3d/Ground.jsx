import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import {
  RepeatWrapping,
  TextureLoader,
  LinearFilter,
  NearestFilter,
  LinearMipmapLinearFilter,
} from "three"; // Добавили фильтры Three

export function Ground({ resolution, quality }) {
  const [roughness, normal] = useLoader(TextureLoader, [
    "/textures/terrain-roughness.jpg",
    "/textures/terrain-normal.jpg",
  ]);

  useEffect(() => {
    [normal, roughness].forEach((t) => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.repeat.set(5, 5);

      // ДИНАМИЧЕСКОЕ УПРАВЛЕНИЕ ТЯЖЕСТЬЮ ТЕКСТУР:
      if (quality === "low") {
        t.generateMipmaps = false; // Отключаем дубликаты текстуры в памяти
        t.minFilter = NearestFilter; // Аппаратно сбрасываем разрешение текстуры (Ультра-скорость)
        t.magFilter = NearestFilter;
        t.anisotropy = 1;
      } else if (quality === "mid") {
        t.generateMipmaps = true;
        t.minFilter = LinearFilter; // Среднее сглаживание
        t.magFilter = LinearFilter;
        t.anisotropy = 4;
      } else {
        t.generateMipmaps = true;
        t.minFilter = LinearMipmapLinearFilter; // Максимальное трилинейное сглаживание для ПК
        t.magFilter = LinearFilter;
        t.anisotropy = 16; // Ультра-четкость вдалеке
      }
    });
  }, [normal, roughness, quality]);

  useFrame((state) => {
    let t = -state.clock.getElapsedTime() * 0.128;
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
        dithered={true}
        color={[0.015, 0.015, 0.015]}
        roughness={0.7}
        blur={[0, 0]}
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
