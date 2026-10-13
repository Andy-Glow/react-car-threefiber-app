import { useState, useRef } from "react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  // Стейт для громкости (от 0 до 1), по дефолту 0.4 (40%)
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/moon-chrome-auto.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = volume; // Применяем текущую громкость при создании
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.log("Браузер заблокировал автовоспроизведение:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  // Функция изменения громкости на лету
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className='music-container music-controls'>
      <button onClick={toggleMusic} className={`btn-music ${isPlaying ? "playing" : ""}`}>
        {isPlaying ? "📻 Music: ON" : "🔇 Music: OFF"}
      </button>

      {/* Ползунок громкости, который появляется только когда музыка играет */}
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
