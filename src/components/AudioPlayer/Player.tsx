"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./Player.module.css";

export interface Track {
    artist: string;
    track: string;
    src: string;
}

interface AudioPlayerProps {
    tracks: Track[];
    initialIndex?: number;
}

function fmt(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

type VolIconLevel = "muted" | "low" | "mid" | "high";

function getVolLevel(v: number): VolIconLevel {
    if (v === 0) return "muted";
    if (v <= 33) return "low";
    if (v <= 66) return "mid";
    return "high";
}

function VolumeIcon({ level }: { level: VolIconLevel }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            {level === "muted" && (
                <>
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </>
            )}
            {(level === "low" || level === "mid" || level === "high") && (
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            )}
            {(level === "mid" || level === "high") && (
                <path d="M18 4a11 11 0 0 1 0 16" />
            )}
        </svg>
    );
}

// Singleton AudioContext shared across renders
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
        sharedAudioCtx = new AudioContext();
    }
    return sharedAudioCtx;
}

export default function AudioPlayer({ tracks, initialIndex = 0 }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number | null>(null);

    // Web Audio API nodes
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const [trackIndex, setTrackIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [mutedPrev, setMutedPrev] = useState<number | null>(null);

    const currentTrack = tracks[trackIndex];

    // Set up Web Audio API analyser lazily on first play (must be inside a user gesture)
    const setupAudioGraph = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || sourceNodeRef.current) return; // already set up

        const ctx = getAudioContext();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        source.connect(analyser);
        analyser.connect(ctx.destination);

        sourceNodeRef.current = source;
        analyserRef.current = analyser;
    }, []);

    // Draw the FFT spectrum on every animation frame
    const drawSpectrum = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount; // fftSize / 2 = 128
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // We only show the lower ~60% of bins (the audible/interesting range)
        const binsToShow = Math.floor(bufferLength * 0.6);
        const barW = (W / binsToShow) * 0.7;
        const gap = (W / binsToShow) * 0.3;

        for (let i = 0; i < binsToShow; i++) {
            const value = dataArray[i] / 255; // 0–1
            const barH = value * H;
            const x = i * (barW + gap);

            // Gradient-style coloring: low freqs warm, high freqs cool
            const t = i / binsToShow; // 0 = bass, 1 = treble
            if (value > 0.02) {
                // Played / active bar: interpolate #e8503a → #7a2d80 → #1a5fa8
                let r: number, g: number, b: number;
                if (t < 0.5) {
                    const u = t * 2;
                    r = Math.round(232 + (122 - 232) * u);
                    g = Math.round(80 + (45 - 80) * u);
                    b = Math.round(58 + (128 - 58) * u);
                } else {
                    const u = (t - 0.5) * 2;
                    r = Math.round(122 + (26 - 122) * u);
                    g = Math.round(45 + (95 - 45) * u);
                    b = Math.round(128 + (168 - 128) * u);
                }
                ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
            } else {
                // Silent bin: dim placeholder
                ctx.fillStyle = "rgba(255,255,255,0.08)";
            }

            ctx.fillRect(x, H - barH, barW, Math.max(barH, 2));
        }

        rafRef.current = requestAnimationFrame(drawSpectrum);
    }, []);

    // Start / stop the draw loop based on playback state
    useEffect(() => {
        if (isPlaying) {
            rafRef.current = requestAnimationFrame(drawSpectrum);
        } else {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            // Draw a quiet idle state
            const canvas = canvasRef.current;
            const analyser = analyserRef.current;
            if (canvas && analyser) {   
                const ctx2d = canvas.getContext("2d");
                if (ctx2d) {
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);
                    analyser.getByteFrequencyData(dataArray);
                    const W = canvas.width;
                    const H = canvas.height;
                    ctx2d.clearRect(0, 0, W, H);
                    const binsToShow = Math.floor(bufferLength * 0.6);
                    const barW = (W / binsToShow) * 0.7;
                    const gap = (W / binsToShow) * 0.3;
                    for (let i = 0; i < binsToShow; i++) {
                        ctx2d.fillStyle = "rgba(255,255,255,0.08)";
                        ctx2d.fillRect(i * (barW + gap), H - 4, barW, 4);
                    }
                }
            }
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying, drawSpectrum]);

    // Progress tracking via RAF when playing
    const tickProgress = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || audio.paused) return;
        const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        setProgress(p);
        requestAnimationFrame(tickProgress);
    }, []);

    const goToTrack = (index: number) => {
        setTrackIndex(index);
    };

    const goPrev = () => {
        goToTrack(trackIndex > 0 ? trackIndex - 1 : tracks.length - 1);
    };

    const goNext = () => {
        goToTrack(trackIndex < tracks.length - 1 ? trackIndex + 1 : 0);
    };

    // When track changes: reset state and auto-play if already playing
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        setProgress(0);
        setDuration(0);
        audio.load();
        if (isPlaying) {
            audio.play().catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackIndex]);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Set up Web Audio graph on first play (requires user gesture)
            setupAudioGraph();
            const ctx = getAudioContext();
            if (ctx.state === "suspended") await ctx.resume();
            audio.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        const val = Number(e.target.value);
        setProgress(val);
        if (audio && audio.duration) {
            audio.currentTime = (val / 100) * audio.duration;
        }
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setVolume(val);
        setMutedPrev(null);
        if (audioRef.current) audioRef.current.volume = val / 100;
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (mutedPrev === null) {
            setMutedPrev(volume);
            setVolume(0);
            if (audio) audio.volume = 0;
        } else {
            setVolume(mutedPrev);
            if (audio) audio.volume = mutedPrev / 100;
            setMutedPrev(null);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleEnded = () => {
        if (trackIndex < tracks.length - 1) {
            goNext();
        } else {
            setIsPlaying(false);
            setProgress(0);
        }
    };

    const handlePlay = () => {
        requestAnimationFrame(tickProgress);
    };

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const seekGradient = (p: number) =>
        `linear-gradient(to right, #1a5fa8 0%, #7a2d80 ${p * 0.5}%, #e8503a ${p}%, rgba(255,255,255,0.12) ${p}%, rgba(255,255,255,0.12) 100%)`;

    const volGradient = (v: number) =>
        `linear-gradient(to right, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) ${v}%, rgba(255,255,255,0.12) ${v}%, rgba(255,255,255,0.12) 100%)`;

    const volLevel = getVolLevel(volume);
    const currentSec = (progress / 100) * duration;

    return (
        <div className={styles.player}>
            <audio
                ref={audioRef}
                src={currentTrack.src}
                crossOrigin="anonymous"
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onPlay={handlePlay}
            />

            {/* Track counter */}
            <div className={styles.header}>
                <span className={styles.tag}>Now Playing</span>
                <span className={styles.counter}>
                    {trackIndex + 1} / {tracks.length}
                </span>
            </div>

            <p className={styles.artist}>{currentTrack.artist}</p>
            <p className={styles.track}>{currentTrack.track}</p>

            {/* FFT Frequency Spectrum Canvas */}
            <canvas
                ref={canvasRef}
                className={styles.spectrumCanvas}
                width={496}
                height={64}
            />

            {/* Seek row */}
            <div className={styles.progressRow}>
                <span className={styles.time}>{fmt(currentSec)}</span>
                <input
                    className={styles.seek}
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    style={{ background: seekGradient(progress) }}
                />
                <span className={`${styles.time} ${styles.timeRight}`}>{fmt(duration)}</span>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                {/* Left: volume */}
                <div className={styles.volGroup}>
                    <button className={styles.btn} onClick={toggleMute} aria-label="Toggle mute">
                        <VolumeIcon level={volLevel} />
                    </button>
                    <input
                        className={styles.volSlider}
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={volume}
                        onChange={handleVolume}
                        style={{ background: volGradient(volume) }}
                    />
                </div>

                {/* Center: playback */}
                <div className={styles.playback}>
                    <button
                        className={`${styles.btn} ${trackIndex === 0 ? styles.btnDisabled : ""}`}
                        onClick={goPrev}
                        aria-label="Previous track"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                        </svg>
                    </button>

                    <button
                        className={styles.playBtn}
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className={`${styles.btn} ${trackIndex === tracks.length - 1 ? styles.btnDisabled : ""}`}
                        onClick={goNext}
                        aria-label="Next track"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                        </svg>
                    </button>
                </div>

                {/* Right: empty balancer */}
                <div aria-hidden="true" />
            </div>

            {/* Track list */}
            <div className={styles.trackList}>
                {tracks.map((t, i) => (
                    <button
                        key={i}
                        className={`${styles.trackItem} ${i === trackIndex ? styles.trackItemActive : ""}`}
                        onClick={() => goToTrack(i)}
                    >
                        <span className={styles.trackItemDot} />
                        <span className={styles.trackItemArtist}>{t.artist}</span>
                        <span className={styles.trackItemName}>{t.track}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}