import React, { useState, useRef, ChangeEvent } from "react";

export function MusicPlayer(): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);

  // ТИПИЗАЦИЯ REF: Указываем TypeScript, что внутри рефа лежит объект HTMLAudioElement (или null на старте)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = (): void => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/moon-chrome-auto.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err: unknown) => {
        console.log("Браузер заблокировал автовоспроизведение:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  // ТИПИЗАЦИЯ СОБЫТИЯ: Указываем ChangeEvent для ползунка громкости (HTMLInputElement)
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>): void => {
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
