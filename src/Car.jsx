import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial } from "three";

export function Car() {
  const gltf = useGLTF("/models/car/scene.gltf");

  useEffect(() => {
    if (gltf && gltf.scene) {
      gltf.scene.scale.set(0.005, 0.005, 0.005);
      gltf.scene.position.set(0, -0.035, 0);

      gltf.scene.traverse((object) => {
        if (object.isMesh && object.material) {
          // Убираем карты, которые вызывают краш WebGL (Shader Error 1282)
          if (object.material.aoMap) object.material.aoMap = null;
          if (object.material.lightMap) object.material.lightMap = null;

          // Наша надежная оптимизация: переводим тяжелые материалы в стабильный стандарт
          if (object.material.isMeshPhysicalMaterial) {
            const oldMat = object.material;
            object.material = new MeshStandardMaterial({
              color: oldMat.color,
              roughness: oldMat.roughness ?? 0.4,
              metalness: oldMat.metalness ?? 0.8,
              map: oldMat.map,
              normalMap: oldMat.normalMap,
              transparent: oldMat.transparent ?? false,
              opacity: oldMat.opacity ?? 1,
              name: `Safe_${oldMat.name}`,
            });
            oldMat.dispose();
          }

          // Возвращаем тени по уроку
          object.castShadow = true;
          object.receiveShadow = true;

          // Автор на видео выставил 20, но поскольку мы отключили Bloom,
          // оставляем комфортные 3, чтобы машина не пересвечивалась бликами
          object.material.envMapIntensity = 3;
        }
      });
    }
  }, [gltf]);

  // АНИМАЦИЯ ВРАЩЕНИЯ КОЛЕС ИЗ ВИДЕО (Строки 26-34)
  useFrame((state) => {
    if (!gltf || !gltf.scene) return;

    let t = state.clock.getElapsedTime();

    // Добираемся до группы с колесами по цепочке дочерних объектов автора
    let group = gltf.scene.children[0].children[0].children[0];

    // Вращаем колеса по их точным индексам в массиве модели Corvette C7
    if (group && group.children) {
      if (group.children[0]) group.children[0].rotation.x = t * 2;
      if (group.children[2]) group.children[2].rotation.x = t * 2;
      if (group.children[4]) group.children[4].rotation.x = t * 2;
      if (group.children[6]) group.children[6].rotation.x = t * 2;
    }
  });

  if (!gltf) return null;

  return <primitive object={gltf.scene} />;
}

useGLTF.preload("/models/car/scene.gltf");
