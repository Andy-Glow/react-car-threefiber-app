import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Mesh } from "three";

// ВНУТРЕННИЙ КОМПОНЕНТ ОДНОГО КУБИКА
function Box(): React.JSX.Element {
  // ТИПИЗАЦИЯ REF: Указываем TypeScript, что внутри рефа будет лежать 3D-меш (Mesh)
  const boxRef = useRef<Mesh | null>(null);

  // Функция генерации безопасной позиции (чтобы кубы облетали Corvette стороной)
  const getRandomPosition = (): Vector3 => {
    // Генерируем X от -5 до +5
    let x = (Math.random() * 2 - 1) * 5;

    // ХАК ДЛЯ ОБЛЕТА МАШИНЫ: Если куб летит прямо по центру (где стоит машина),
    // принудительно сдвигаем его влево или вправо на 1.8 единицы от центра
    if (Math.abs(x) < 1.5) {
      x += x > 0 ? 1.8 : -1.8;
    }

    const y = Math.random() * 2.0 + 0.45;
    const z = (Math.random() * 2 - 1) * 15;
    return new Vector3(x, y, z);
  };

  const [v] = useState<Vector3>(() => getRandomPosition());
  const [time] = useState<number>(() => Math.random() * 100);

  const [xRotSpeed] = useState<number>(() => Math.random() * 1.5 + 0.5);
  const [yRotSpeed] = useState<number>(() => Math.random() * 1.5 + 0.5);
  const [scale] = useState<number>(() => Math.pow(Math.random(), 2) * 0.4 + 0.05);

  const resetPosition = (): void => {
    const freshPos = getRandomPosition();
    // Возвращаем куб далеко вперед на хайвей (на дистанцию от 15 до 25 единиц)
    v.set(freshPos.x, freshPos.y, Math.random() * 10 + 15);
  };

  // В useFrame вторым аргументом достаем стабильное дельта-время кадра (delta)
  useFrame((state, delta) => {
    const mesh = boxRef.current;
    if (!mesh) return;

    const t = state.clock.getElapsedTime();

    // СТАБИЛЬНАЯ ФИЗИКА: Умножаем на delta. Теперь скорость постоянна во времени!
    // Кадр сдвигает куб на фиксированные 6 единиц в секунду
    v.z -= delta * 3.0;
    mesh.position.set(v.x, v.y + Math.sin(t + time) * 0.2, v.z);

    // Вращение теперь тоже идеально плавное и не разгоняется
    mesh.rotation.x += delta * xRotSpeed * 0.5;
    mesh.rotation.y += delta * yRotSpeed * 0.5;

    // Если кубик пролетел за камеру (спину игрока) — плавно отправляем его на новый круг
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

// ГЛАВНЫЙ КОМПОНЕНТ-ОБЕРТКА ДЛЯ ВСЕХ КУБОВ
export function Boxes(): React.JSX.Element {
  return (
    <>
      {/* Рендерим массив из 100 независимых анимированных кубиков */}
      {Array(100)
        .fill(0)
        .map((_, i) => (
          <Box key={i} />
        ))}
    </>
  );
}
