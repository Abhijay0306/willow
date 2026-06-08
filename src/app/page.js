"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

const placeholders = [
  "A Billion Dollars",
  "True Love",
  "World Peace",
  "To Be King",
  "Eternal Youth",
  "A Perfect Score",
  "A Brand New Ferrari"
];

export default function Home() {
  const [wish, setWish] = useState("");
  const [status, setStatus] = useState("idle"); // idle, shaking, broken
  const [result, setResult] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // keep background music subtle
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented"));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted]);

  const playRumble = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(40, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch(e) {}
  };

  const playSnap = () => {
    try {
      if (!isMuted) {
        const breakAudio = new Audio("/breaking-sound.wav");
        breakAudio.volume = 1.0;
        breakAudio.play().catch(e => console.log("Break audio prevented:", e));
      }
    } catch(e) {}
  };

  const handleWish = async () => {
    if (!wish.trim()) return;

    setStatus("shaking");
    playRumble();
    
    try {
      const response = await fetch("/api/wish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wish }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setResult("The willow ignored your wish: " + data.error);
      } else {
        setResult(data.result);
      }
      playSnap();
    } catch (error) {
      setResult("The magic faded... Please try again.");
    } finally {
      setStatus("broken");
    }
  };

  const shareResult = async () => {
    const textToShare = `I wished for "${wish}"\nand this happened "${result}"`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wishing Willow',
          text: textToShare,
        });
      } else {
        await navigator.clipboard.writeText(textToShare);
        alert("Result copied to clipboard!");
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  const reset = () => {
    setStatus("idle");
    setWish("");
    setResult("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWish();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="app-container">
      <audio ref={audioRef} src="/bg-music.mp3" loop autoPlay muted={isMuted} />
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>WISHING<br/>WILLOW</span>
          {/* Leaf SVG approximation */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21C12 21 8 13 4 13C4 13 8 9 12 9C12 9 16 5 20 5" />
            <path d="M12 21C12 21 16 13 20 13" />
            <path d="M12 21V9" />
          </svg>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.actionButton} onClick={toggleMute} style={{ padding: '10px 15px' }}>
            {isMuted ? "🔇 UNMUTE" : "🔊 MUTE"}
          </button>
          <button className={styles.actionButton}>MAKE YOUR WISH HAPPEN!</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <h1 className={styles.title}>YOU ONLY HAVE<br/>ONE WISH</h1>
        <p className={styles.subtitle}>— I WISH FOR... —</p>
        
        <div className={styles.inputWrapper}>
          <textarea 
            className={styles.textarea}
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            disabled={status !== "idle"}
          />
        </div>

        <button 
          className={styles.wishButton}
          onClick={handleWish}
          disabled={status !== "idle"}
        >
          WISH
        </button>

        <div className={styles.stickWrapper}>
          {status === "idle" || status === "shaking" ? (
            <img src="/Full.png" alt="Stick" className={`${styles.stickImage} ${status === "shaking" ? styles.shaking : ""}`} />
          ) : (
            <img src="/Broken.png" alt="Broken Stick" className={styles.stickImage} />
          )}
        </div>
      </main>

      {/* Full overlay for the result */}
      <div className={`${styles.resultText} ${status === "broken" ? styles.visible : ""}`}>
        <h2 className={styles.resultTitle}>YOUR WISH IS GRANTED... BUT:</h2>
        <p className={styles.resultMessage}>{result}</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button className={styles.actionButton} onClick={reset}>TRY AGAIN?</button>
          <button className={styles.actionButton} onClick={shareResult}>SHARE</button>
        </div>
      </div>
    </div>
  );
}
