import React, { useState } from "react";
import { Html } from "@react-three/drei";

/* Описываем структуру объекта для каждой точки на машине (id, 3D-позиция, текст) */
interface HotspotItem {
  id: number;
  position: [number, number, number]; // Фиксированный массив ровно из 3-х чисел [X, Y, Z]
  title: string;
  description: string;
}

/* Описываем пропсы, которые этот компонент обязан принимать из родительского App.tsx */
interface HotspotsProps {
  isVisible: boolean; // Флаг: показывать ли маркеры на машине в данный момент
}

// База данных информационных точек с их координатами на кузове автомобиля
const hotspotsData: HotspotItem[] = [
  {
    id: 1,
    position: [0, 0.45, 0.9], // Точка на капоте (двигатель)
    title: "Двигатель V8",
    description:
      "Под капотом Corvette C7 установлен легендарный 6.2-литровый LT1 V8 мощностью 455 лошадиных сил.",
  },
  {
    id: 2,
    position: [0.85, 0.2, 0.65], // Точка над правым крылом (тормоза)
    title: "Тормозная система",
    description:
      "Вентилируемые тормозные диски Brembo и спортивные суппорты обеспечивают идеальное замедление на треке.",
  },
  {
    id: 3,
    position: [0.9, 0.45, -0.2], // Точка на двери кузова (карбон)
    title: "Облегченный кузов",
    description:
      "Панели кузова выполнены из композитных материалов и углеволокна для снижения веса и идеальной развесовки 50:50.",
  },
];

export function Hotspots({ isVisible }: HotspotsProps): React.JSX.Element | null {
  /* Стейт хранит ID открытой сейчас плашки (число). Если всё закрыто, в нем лежит null. */
  const [activeId, setActiveId] = useState<number | null>(null);

  /* Если глобальная кнопка "Скрыть точки" активна — полностью выгружаем маркеры из 3D-пространства */
  if (!isVisible) return null;

  return (
    <>
      {/* Пробегаемся циклом по базе данных и расставляем точки на виртуальном автомобиле */}
      {hotspotsData.map((spot) => {
        const isOpen = activeId === spot.id; // Проверяем, открыто ли окно конкретно этого маркера

        return (
          /* group — невидимый 3D-контейнер Three.js, который удерживает всю точку в нужных координатах */
          <group key={spot.id} position={spot.position}>
            {/* Маленький интерактивный 3D-шарик на кузове машины */}
            <mesh
              onClick={(e) => {
                e.stopPropagation(); // Останавливаем всплытие клика в 3D, чтобы сцена не дергала камеру
                setActiveId(isOpen ? null : spot.id); // Открываем плашку или закрываем её, если она уже открыта
              }}>
              {/* Геометрия шарика радиусом 0.04 виртуальных метра */}
              <sphereGeometry args={[0.04, 16, 16]} />
              {/* Меняем цвет шарика на неоново-розовый при открытии, в обычном режиме — красный */}
              <meshBasicMaterial color={isOpen ? "#ff0055" : "#ff3333"} />
            </mesh>

            {/* Drei-компонент <Html> берет обычные плоские HTML-теги 
                и заставляет их "приклеиться" к 3D-шарику, двигаясь синхронно с вращением камеры */}
            <Html
              position={[0, 0.08, 0]} // Слегка приподнимаем HTML-разметку над 3D-шариком по оси Y
              center // Выравниваем HTML-элемент строго по центру 3D-точки
              distanceFactor={4} // Умный зум: заставляет текст уменьшаться или увеличиваться при отдалении камеры
              style={{
                pointerEvents: "auto", // Разрешаем браузеру ловить клики по тексту и кнопкам внутри Canvas
                transition: "all 0.3s ease",
                opacity: isOpen ? 1 : 0.8,
              }}>
              {/* Если плашка закрыта, рендерим маленькую круглую HTML-кнопку с цифрой-номером */}
              {!isOpen && (
                <button
                  onClick={() => setActiveId(spot.id)}
                  style={{
                    background: "rgba(255, 51, 51, 0.8)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    boxShadow: "0 0 10px #ff3333",
                  }}>
                  {spot.id}
                </button>
              )}

              {/* Если плашка открыта, рендерим полноценное информационное окно */}
              {isOpen && (
                <div className='hotspot-card'>
                  <h4>{spot.title}</h4>
                  <p>{spot.description}</p>

                  {/* Кнопка-крестик в углу для закрытия окна */}
                  <button onClick={() => setActiveId(null)} className='btn-hotspot-close'>
                    ✕
                  </button>
                </div>
              )}
            </Html>
          </group>
        );
      })}
    </>
  );
}
