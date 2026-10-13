import { useState, useRef } from "react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/moon-chrome-auto.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
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

  return (
    <div className='music-container'>
      <button onClick={toggleMusic} className={`btn-music ${isPlaying ? "playing" : ""}`}>
        {isPlaying ? "📻 Music: ON" : "🔇 Music: OFF"}
      </button>
    </div>
  );
}
