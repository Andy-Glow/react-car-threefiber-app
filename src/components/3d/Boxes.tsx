import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Mesh } from "three";

/* Внутренний компонент одного кубика.
Отвечает за собственную траекторию полета, покачивание по синусоиде и вращение. */
function Box(): React.JSX.Element {
  // Ссылка на 3D-меш объекта. Изначально null, связывается со сценой после рендеринга.
  const boxRef = useRef<Mesh | null>(null);

  /* Генерация безопасных начальных координат.
     Гарантирует, что кубы будут парить над землей и облетать Corvette стороной.
     Возвращает трехмерный вектор координат. */
  const getRandomPosition = (): Vector3 => {
    // Случайная позиция по ширине трассы (X от -5 до +5)
    let x = (Math.random() * 2 - 1) * 5;

    /* Зона безопасности: если куб летит по центру (X от -1.5 до 1.5),
       принудительно расталкиваем его влево или вправо, чтобы он не пролетал сквозь машину. */
    if (Math.abs(x) < 1.5) {
      x += x > 0 ? 1.8 : -1.8;
    }

    // Высота (Y): парение строго над асфальтом (минимум 0.45 от центра куба)
    const y = Math.random() * 2.0 + 0.45;

    // Глубина (Z): случайный разброс по длине хайвея на старте
    const z = (Math.random() * 2 - 1) * 15;

    return new Vector3(x, y, z);
  };

  // СОСТОЯНИЯ (STATES): Хранят уникальные физические свойства куба.
  // Используется ленивая инициализация функции () => для генерации значения ровно один раз при создании.
  const [v] = useState<Vector3>(() => getRandomPosition());
  const [time] = useState<number>(() => Math.random() * 100); // Индивидуальное смещение фазы синусоиды
  const [xRotSpeed] = useState<number>(() => Math.random() * 1.5 + 0.5); // Скорость вращения по X
  const [yRotSpeed] = useState<number>(() => Math.random() * 1.5 + 0.5); // Скорость вращения по Y
  const [scale] = useState<number>(() => Math.pow(Math.random(), 2) * 0.4 + 0.05); // Экспоненциальный масштаб размера

  /* Сброс позиции кубика. Вызывается, когда объект пролетает за спину камеры, возвращая его далеко вперед на трассу. */
  const resetPosition = (): void => {
    const freshPos = getRandomPosition();
    // Устанавливаем кубу новые координаты, возвращая его вперед (Z от 15 до 25 единиц)
    v.set(freshPos.x, freshPos.y, Math.random() * 10 + 15);
  };

  // ИГРОВОЙ ЦИКЛ (TICK): Вызывается 60+ раз в секунду синхронно с частотой обновления экрана.
  useFrame((state, delta) => {
    const mesh = boxRef.current;
    if (!mesh) return; // Страховка: если меш еще не смонтирован, пропускаем кадр

    const t = state.clock.getElapsedTime();

    // Движение вперед (навстречу камере): плавно уменьшаем координату Z.
    // Умножение на стабильный delta (время кадра) гарантирует одинаковую скорость (3 единицы в сек) на любом ПК.
    v.z -= delta * 3.0;

    // Применяем координаты. По оси Y добавляем покачивание на волнах синусоиды.
    mesh.position.set(v.x, v.y + Math.sin(t + time) * 0.2, v.z);

    // Вращение объекта вокруг осей со своей уникальной скоростью
    mesh.rotation.x += delta * xRotSpeed * 0.5;
    mesh.rotation.y += delta * yRotSpeed * 0.5;

    // Триггер сброса: если куб улетел глубоко за камеру (Z < -8), отправляем его на новый круг
    if (mesh.position.z < -8) {
      resetPosition();
    }
  });

  return (
    <mesh ref={boxRef} scale={[scale, scale, scale]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={[0.12, 0.12, 0.15]} roughness={1} metalness={0.2} />
    </mesh>
  );
}

/* Главный экспортный компонент-контейнер для всех кубов.
   Генерирует массив из 100 независимых кубиков для наполнения 3D-сцены. */
export function Boxes(): React.JSX.Element {
  return (
    <>
      {Array(100)
        .fill(0)
        .map((_, i) => (
          <Box key={i} />
        ))}
    </>
  );
}
