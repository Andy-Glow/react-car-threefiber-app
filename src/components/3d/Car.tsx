import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial, Group } from "three";
import { GLTF } from "three-stdlib";

export function Car(): React.JSX.Element | null {
  /* Загружаем 3D-модель машины из папки public. 
     Используем "as unknown as GLTF", чтобы TypeScript понимал внутреннюю структуру этой 3D-сцены. */
  const gltf = useGLTF("models/car/scene.gltf") as unknown as GLTF;

  useEffect(() => {
    if (gltf && gltf.scene) {
      /* Задаем масштаб модели (уменьшаем, так как исходный файл автора огромный) 
         и слегка опускаем её, чтобы колеса ровно касались асфальта */
      gltf.scene.scale.set(0.005, 0.005, 0.005);
      gltf.scene.position.set(0, -0.035, 0);

      /* traverse — это цикл, который по цепочке перебирает вообще все детали внутри 3D-модели:
         от кузова и стекол до мелких винтиков в салоне. */
      gltf.scene.traverse((object) => {
        /* Проверяем, является ли текущая деталь видимым 3D-объектом (мешем) с материалом */
        if (object instanceof Mesh && object.material) {
          /* Для стабильности убираем карты запеченного света (aoMap, lightMap).
             Они были неправильно настроены автором модели и приводили к вылету WebGL с ошибкой Shader Error 1282. */
          if (object.material.aoMap) object.material.aoMap = null;
          if (object.material.lightMap) object.material.lightMap = null;

          /* ОПТИМИЗАЦИЯ МАТЕРИАЛОВ:
             Если деталь использует тяжелый физический материал (например, лак кузова или стекло фар),
             мы принудительно переводим его в более легкий стандартный формат (MeshStandardMaterial).
             Это экономит кучу ресурсов видеокарты, сохраняя красивый визуал! */
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

            // Очищаем оперативную память от старого тяжелого материала
            oldMat.dispose();
          }

          // Разрешаем деталям автомобиля отбрасывать тени от прожекторов и принимать их на себя
          object.castShadow = true;
          object.receiveShadow = true;

          // Задаем яркость отражений окружения на кузове, чтобы неоновые кольца сочно блестели на металле
          object.material.envMapIntensity = 3;
        }
      });
    }
  }, [gltf]);

  // АНИМАЦИЯ ВРАЩЕНИЯ КОЛЕС (Вызывается каждый кадр)
  useFrame((state) => {
    if (!gltf || !gltf.scene) return;

    // Берем стабильное время работы приложения
    const t = state.clock.getElapsedTime();

    /* Спускаемся по иерархии папок 3D-модели, которую создал автор, 
       чтобы найти скрытую группу, в которой лежат колеса автомобиля */
    const group = gltf.scene.children[0]?.children[0]?.children[0] as
      | import("three").Group
      | undefined;

    // Вращаем колеса по их точным порядковым номерам (индексам) в массиве модели Corvette C7
    if (group && group.children) {
      const c = group.children;
      if (c[0]) c[0].rotation.x = t * 2; // Переднее левое
      if (c[2]) c[2].rotation.x = t * 2; // Переднее правое
      if (c[4]) c[4].rotation.x = t * 2; // Заднее левое
      if (c[6]) c[6].rotation.x = t * 2; // Заднее правое
    }
  });

  // Пока модель скачивается, ничего не рендерим (будет видна надпись "Загрузка текстур...")
  if (!gltf) return null;

  // primitive — специальный тег RTF, который берет готовый чистый 3D-объект Three.js и внедряет его в виртуальный мир
  return <primitive object={gltf.scene} />;
}

// Vite начинает скачивать модель заранее, до того как построится Canvas
useGLTF.preload("models/car/scene.gltf");
