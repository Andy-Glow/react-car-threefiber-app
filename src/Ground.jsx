import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import { RepeatWrapping, TextureLoader, LinearFilter } from "three"; // Добавили LinearFilter

export function Ground() {
  const [roughness, normal] = useLoader(TextureLoader, [
    "/textures/terrain-roughness.jpg",
    "/textures/terrain-normal.jpg",
  ]);

  useEffect(() => {
    [normal, roughness].forEach((t) => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.repeat.set(5, 5);

      // СВЕРХОПТИМИЗАЦИЯ ДЛЯ СТАРЫХ GPU:
      // Отключаем построение мип-мапов и переводим в легкий режим фильтрации.
      // Это убирает микроподёргивания при постоянном сдвиге офсета текстуры!
      t.generateMipmaps = false;
      t.minFilter = LinearFilter;
      t.magFilter = LinearFilter;
    });
  }, [normal, roughness]);

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
        blur={[1000, 400]}
        mixBlur={30}
        mixStrength={80}
        mixContrast={1}
        resolution={256} // НАША ОПТИМИЗАЦИЯ: снизили до 256 ради максимальной плавности
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
