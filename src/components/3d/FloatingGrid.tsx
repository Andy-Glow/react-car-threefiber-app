import React, { useEffect } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { RepeatWrapping, TextureLoader, Texture } from "three";

// Описываем типы для входящих пропсов. Указываем, что качество quality — это строго строка.
interface FloatingGridProps {
  quality: string;
}

export function FloatingGrid({ quality }: FloatingGridProps): React.JSX.Element {
  /* Загружаем картинку сетки из папки public.
     С помощью "as Texture" говорим TypeScript, что это объект 3D-текстуры Three.js. */
  const diffuse = useLoader(TextureLoader, "/textures/grid-texture.png") as Texture;

  useEffect(() => {
    if (!diffuse) return;

    // Включаем режим бесконечного повторения (зацикливания) текстуры по осям X и Y
    diffuse.wrapS = RepeatWrapping;
    diffuse.wrapT = RepeatWrapping;

    // Заставляем картинку размножиться (замоститься) 30 раз по горизонтали и вертикали
    diffuse.repeat.set(30, 30);
    diffuse.offset.set(0, 0);

    /* АНИЗОТРОПНАЯ ФИЛЬТРАЦИЯ (Четкость): 
       На лету настраиваем четкость линий вдалеке под выбранный пользователем пресет.
       На LOW отключаем (1), на MID ставим стандарт (4), на HIGH выкручиваем на максимум (16) для ПК! */
    diffuse.anisotropy = quality === "low" ? 1 : quality === "mid" ? 4 : 16;

    /* Принудительно приказываем видеокарте загрузить и применить текстуру,
       чтобы сетка не исчезала и не лагала при первой загрузке. */
    diffuse.needsUpdate = true;
  }, [diffuse, quality]);

  // ИГРОВОЙ ЦИКЛ (Вызывается каждый кадр)
  useFrame((state) => {
    // Берем время и рассчитываем сдвиг. Минус означает, что текстура ползет назад, создавая иллюзию того, что машина едет вперед.
    const t = -state.clock.getElapsedTime() * 0.68;

    // Сдвигаем картинку по оси Y. За счет включенного RepeatWrapping она бесконечно бежит по кругу
    diffuse.offset.set(0, t);
  });

  return (
    <mesh rotation-x={-Math.PI * 0.5} position={[0, 0.425, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial
        color={[1, 1, 1]}
        opacity={0.35}
        map={diffuse}
        alphaMap={diffuse}
        transparent={true}
      />
    </mesh>
  );
}
