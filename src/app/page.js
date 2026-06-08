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
  const [showResult, setShowResult] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const breakAudioRef = useRef(null);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    // Unlock audio on first user interaction to bypass autoplay restrictions
    const unlockAudio = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log("Still prevented", e));
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
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
      if (!isMuted && breakAudioRef.current) {
        breakAudioRef.current.currentTime = 0;
        breakAudioRef.current.play().catch(e => console.log("Break audio prevented:", e));
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
      setStatus("broken");
      
      // Wait 1.5s before showing the result overlay so the broken stick is visible
      setTimeout(() => {
        setShowResult(true);
      }, 1500);
      
    } catch (error) {
      setResult("The magic faded... Please try again.");
      setStatus("broken");
      setTimeout(() => setShowResult(true), 1500);
    }
  };

  const shareResult = async () => {
    const textToShare = `I wished for "${wish}"\n\n...but the Wishing Willow had other plans: "${result}"\n\nDare to make your own wish? Try it yourself at https://willow.doodle2dollars.com`;

    try {
      if (navigator.share) {
        try {
          const response = await fetch("/share-image.png");
          const blob = await response.blob();
          const file = new File([blob], "wishing-willow.png", { type: blob.type });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Wishing Willow',
              text: textToShare,
              files: [file]
            });
            return;
          }
        } catch (e) {
          console.error("Failed to share image, falling back to text", e);
        }

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
    setShowResult(false);
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
      <audio ref={audioRef} src="/bg-music.mp3" loop autoPlay />
      <audio ref={breakAudioRef} src="/breaking-sound.wav" preload="auto" />
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
          <button className={styles.actionButton} onClick={() => textareaRef.current?.focus()}>
            MAKE YOUR WISH HAPPEN!
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <h1 className={styles.title}>YOU ONLY HAVE<br/>ONE WISH</h1>
        <p className={styles.subtitle}>— I WISH FOR... —</p>
        
        <div className={styles.inputWrapper}>
          <textarea 
            ref={textareaRef}
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
          onClick={() => {
            if (!wish.trim()) {
              alert("Please enter a wish first!");
            } else {
              handleWish();
            }
          }}
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
      <div className={`${styles.resultText} ${showResult ? styles.visible : ""}`}>
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
