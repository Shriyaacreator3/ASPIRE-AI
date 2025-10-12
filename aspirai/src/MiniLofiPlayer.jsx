import { useState, useEffect, useRef } from "react";

const songs = ["/audio/lofi1.mp3", "/audio/lofi2.mp3", "/audio/lofi3.mp3"];

const MiniLoFiPlayer = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(new Audio(songs[0]));

  useEffect(() => {
    audioRef.current.pause();
    audioRef.current = new Audio(songs[currentSongIndex]);
    if (isPlaying) {
      audioRef.current.play();
    }

    const handleEnded = () => {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    };
    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      audioRef.current.removeEventListener("ended", handleEnded);
      audioRef.current.pause();
    };
  }, [currentSongIndex, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) =>
      prev === 0 ? songs.length - 1 : prev - 1
    );
  };

  return (
    <div className="lofi-player">
      <h3>Mini LoFi Player 🎵</h3>
      <p>Now Playing: Song {currentSongIndex + 1}</p>
      <button onClick={prevSong}>⏮ Prev</button>
      <button onClick={togglePlay}>{isPlaying ? "⏸ Pause" : "▶️ Play"}</button>
      <button onClick={nextSong}>⏭ Next</button>
    </div>
  );
};

export default MiniLoFiPlayer;