import { useState } from "react";
import { Html } from "@react-three/drei";

const hotspotsData = [
  {
    id: 1,
    position: [0, 0.45, 0.9],
    title: "Двигатель V8",
    description:
      "Под капотом Corvette C7 установлен легендарный 6.2-литровый LT1 V8 мощностью 455 лошадиных сил.",
  },
  {
    id: 2,
    position: [0.85, 0.2, 0.65],
    title: "Тормозная система",
    description:
      "Вентилируемые тормозные диски Brembo и спортивные суппорты обеспечивают идеальное замедление на треке.",
  },
  {
    id: 3,
    position: [0.9, 0.45, -0.2],
    title: "Облегченный кузов",
    description:
      "Панели кузова выполнены из композитных материалов и углеволокна для снижения веса и идеальной развесовки 50:50.",
  },
];

export function Hotspots() {
  // ИЗОЛЯЦИЯ: Стейты живут внутри компонента и не перерендеривают машину!
  const [activeId, setActiveId] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {/* Выводим HTML-кнопку строго под меню графики */}
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "58px", // Смещение вниз, чтобы встать аккуратно под LOW/MID/HIGH
            left: "20px",
            width: "232px", // Идеальная суммарная ширина трех кнопок графики со всеми отступами
            pointerEvents: "auto",
          }}>
          <button
            onClick={() => {
              setIsVisible(!isVisible);
              setActiveId(null); // Закрываем окна при скрытии
            }}
            className={`btn-toggle-hotspots ${!isVisible ? "hidden-mode" : ""}`}>
            {isVisible ? "👁 Скрыть точки" : "👁 Показать точки"}
          </button>
        </div>
      </Html>

      {/* 3D-маркеры рендерятся только еслиisVisible === true */}
      {isVisible &&
        hotspotsData.map((spot) => {
          const isOpen = activeId === spot.id;

          return (
            <group key={spot.id} position={spot.position}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveId(isOpen ? null : spot.id);
                }}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={isOpen ? "#ff0055" : "#ff3333"} />
              </mesh>

              <Html
                position={[0, 0.08, 0]}
                center
                distanceFactor={4}
                style={{
                  pointerEvents: "auto",
                  transition: "all 0.3s ease",
                  opacity: isOpen ? 1 : 0.8,
                }}>
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
                    }}>
                    <h4 style={{ margin: "0 0 6px 0", color: "#ff3333", fontSize: "14px" }}>
                      {spot.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.4", color: "#cccccc" }}>
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
                      }}>
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
