import { useState } from "react";
import { Html } from "@react-three/drei";

// Данные о интерактивных точках
const hotspotsData = [
  {
    id: 1,
    position: [0, 0.45, 0.9], // Капот
    title: "Двигатель V8",
    description:
      "Под капотом Corvette C7 установлен легендарный 6.2-литровый LT1 V8 мощностью 455 лошадиных сил.",
  },
  {
    id: 2,
    position: [0.85, 0.2, 0.65], // Переднее колесо
    title: "Тормозная система",
    description:
      "Вентилируемые тормозные диски Brembo и спортивные суппорты обеспечивают идеальное замедление на треке.",
  },
  {
    id: 3,
    position: [0.9, 0.45, -0.2], // Дверь водителя
    title: "Облегченный кузов",
    description:
      "Панели кузова выполнены из композитных материалов и углеволокна для снижения веса и идеальной развесовки 50:50.",
  },
];

export function Hotspots() {
  // Стейт для хранения ID открытого в данный момент хотспота
  const [activeId, setActiveId] = useState(null);

  return (
    <>
      {hotspotsData.map((spot) => {
        const isOpen = activeId === spot.id;

        return (
          <group key={spot.id} position={spot.position}>
            {/* 1. Сам 3D-маркер (красный светящийся шарик) */}
            <mesh
              onClick={(e) => {
                e.stopPropagation(); // Чтобы клик не проваливался сквозь шарик на OrbitControls
                setActiveId(isOpen ? null : spot.id);
              }}
            >
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color={isOpen ? "#ff0055" : "#ff3333"} />
            </mesh>

            {/* 2. Текстовое HTML-окошко, привязанное к шарику */}
            <Html
              position={[0, 0.08, 0]} // Смещение HTML чуть выше шарика
              center
              distanceFactor={4} // Масштабирует окошко при приближении/удалении камеры
              style={{
                pointerEvents: "auto", // Разрешаем клики внутри HTML
                transition: "all 0.3s ease",
                opacity: isOpen ? 1 : 0.8,
              }}
            >
              {/* Круглая кнопка с цифрой поверх 3D-шарика */}
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
                  }}
                >
                  {spot.id}
                </button>
              )}

              {/* Всплывающее информационное окно при клике */}
              {isOpen && (
                <div
                  style={{
                    background: "rgba(15, 15, 25, 0.95)",
                    color: "white",
                    fontFamily: "sans-serif",
                    padding: "12px",
                    borderRadius: "8px",
                    width: "200px",
                    border: "1px solid #ff3333",
                    boxShadow: "0 0 15px rgba(255, 51, 51, 0.4)",
                    position: "relative",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      color: "#ff3333",
                      fontSize: "14px",
                    }}
                  >
                    {spot.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      lineHeight: "1.4",
                      color: "#cccccc",
                    }}
                  >
                    {spot.description}
                  </p>
                  <button
                    onClick={() => setActiveId(null)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "none",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
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
