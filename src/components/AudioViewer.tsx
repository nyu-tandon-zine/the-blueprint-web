"use client"

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./AudioPlayer.module.css";

interface AudioPlayerProps {
    artist: string;
    track: string;
    src: string;
}

export default function AudioPlayer({ artist, track, src }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showVolume, setShowVolume] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((current / duration) * 100);
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(Number(e.target.value));
    }

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newVolume = Number(e.target.value);
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
    }

    const getVolumeIcon = () => {
        if (volume === 0) return "/quiet.svg";
        if (volume < 0.5) return "/louder.svg";
        return "/loudest.svg";
    }

    return (
        <div className={styles.player}>
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} src={src} />
            
            <p className={styles.trackInfo}>{artist} - {track}</p>

            <div className={styles.controls}>
                <button className={styles.button} onClick={togglePlay}>
                    <Image
                        src={isPlaying ? "/pause.svg" : "/play.svg"}
                        alt={isPlaying ? "Pause" : "Play"}
                        width={24}
                        height={24}
                    />
                </button>

                <input
                    className={styles.progressBar}
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    style={{
                        background: `linear-gradient(to right, #808080 ${progress}%, #d0d0d0 ${progress}%)`
                    }}
                />

                <div className={styles.volumeWrapper}>
                    {showVolume && (
                        <input
                            className={styles.volumeBar}
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolume}
                            style={{
                                background: `linear-gradient(to right, #808080 ${volume * 100}%, #d0d0d0 ${volume * 100}%)`
                            }}
                        />
                    )}
                    <button className={styles.button} onClick={() => setShowVolume(!showVolume)}>
                        <Image
                            src={getVolumeIcon()}
                            alt="Volume"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}