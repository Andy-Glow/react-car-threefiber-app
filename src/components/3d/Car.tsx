import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
// Импортируем Mesh, MeshStandardMaterial и Group для точной типизации узлов модели
import { Mesh, MeshStandardMaterial, Group } from "three";
import { GLTF } from "three-stdlib";

export function Car(): React.JSX.Element | null {
  // Кастуем результат useGLTF к типу GLTF, чтобы TypeScript понимал структуру сцены
  const gltf = useGLTF("/models/car/scene.gltf") as unknown as GLTF;

  useEffect(() => {
    if (gltf && gltf.scene) {
      gltf.scene.scale.set(0.005, 0.005, 0.005);
      gltf.scene.position.set(0, -0.035, 0);

      // Указываем TypeScript, что каждый узел (object) при обходе дерева имеет тип Object3D
      gltf.scene.traverse((object) => {
        // Проверяем, является ли узел 3D-мешем и имеет ли он материал
        if (object instanceof Mesh && object.material) {
          // Убираем карты, которые вызывают краш WebGL
          if (object.material.aoMap) object.material.aoMap = null;
          if (object.material.lightMap) object.material.lightMap = null;

          // Проверяем, является ли материал тяжелым физическим (isMeshPhysicalMaterial)
          // и безопасно кастуем его к MeshStandardMaterial для оптимизации
          if (object.material.isMeshPhysicalMaterial) {
            const oldMat = object.material as import("three").MeshPhysicalMaterial;
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

          // Настраиваем тени
          object.castShadow = true;
          object.receiveShadow = true;

          // Комфортная яркость для бликов окружения
          object.material.envMapIntensity = 3;
        }
      });
    }
  }, [gltf]);

  // АНИМАЦИЯ ВРАЩЕНИЯ КОЛЕС
  useFrame((state) => {
    if (!gltf || !gltf.scene) return;

    const t = state.clock.getElapsedTime();

    // Добираемся до группы с колесами автора модели
    const group = gltf.scene.children[0]?.children[0]?.children[0] as
      | import("three").Group
      | undefined;

    if (group && group.children) {
      const c = group.children;
      if (c[0]) c[0].rotation.x = t * 2;
      if (c[2]) c[2].rotation.x = t * 2;
      if (c[4]) c[4].rotation.x = t * 2;
      if (c[6]) c[6].rotation.x = t * 2;
    }
  });

  if (!gltf) return null;

  // Используем primitive для вставки 3D-объекта в сцену Fiber
  return <primitive object={gltf.scene} />;
}

useGLTF.preload("/models/car/scene.gltf");
