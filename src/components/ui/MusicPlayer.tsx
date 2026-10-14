import React, { useState, useRef, ChangeEvent } from "react";

export function MusicPlayer(): React.JSX.Element {
  /* Состояния для работы плеера: играет ли музыка сейчас и уровень громкости */
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);

  /* Ссылка на встроенный плеер браузера. Использование useRef защищает музыку 
     от прерывания и сброса на начало при каждом изменении громкости. */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* Функция включения и выключения музыки */
  const toggleMusic = (): void => {
    /* Создаем объект аудио только при первом клике, чтобы не качать файл впустую */
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/moon-chrome-auto.mp3");
      audioRef.current.loop = true; // Зацикливаем трек
      audioRef.current.volume = volume; // Передаем стартовую громкость
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      /* Запуск аудио возвращает Promise. Мы ловим ошибку .catch, так как современные 
         браузеры запрещают включать звук без прямого действия (клика) пользователя. */
      audioRef.current.play().catch((err: unknown) => {
        console.log("Браузер заблокировал автовоспроизведение:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  /* Функция отслеживания ползунка громкости. ChangeEvent указывает, что событие идет от HTML-инпута. */
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    /* Если плеер уже создан, мгновенно меняем ему уровень громкости */
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    /* Все стили плеера мы разложили по полочкам в изолированном файле _music.scss */
    <div className='music-container music-controls'>
      <button onClick={toggleMusic} className={`btn-music ${isPlaying ? "playing" : ""}`}>
        {isPlaying ? "📻 Music: ON" : "🔇 Music: OFF"}
      </button>

      {/* Ползунок регулировки появляется на экране только после включения музыки */}
      {isPlaying && (
        <input
          type='range'
          min='0'
          max='1'
          step='0.01'
          value={volume}
          onChange={handleVolumeChange}
          className='volume-slider'
        />
      )}
    </div>
  );
}
