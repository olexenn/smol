import Head from "next/head";
import { useEffect, useRef, useState } from "react";

const Frequencies = [
  { note: "A1", value: 55.0 },
  { note: "A#1", value: 58.27 },
  { note: "B1", value: 61.74 },
  { note: "C2", value: 65.41 },
  { note: "C#2", value: 69.3 },
  { note: "D2", value: 73.42 },
  { note: "D#2", value: 77.78 },
  { note: "E2", value: 82.41 },
  { note: "F2", value: 87.31 },
  { note: "F#2", value: 92.5 },
  { note: "G2", value: 98.0 },
  { note: "G#2", value: 103.81 },
  { note: "A2", value: 110.0 },
  { note: "A#2", value: 116.54 },
  { note: "B2", value: 123.47 },
  { note: "C3", value: 130.81 },
  { note: "C#3", value: 138.59 },
  { note: "D3", value: 146.83 },
  { note: "D#3", value: 155.56 },
  { note: "E3", value: 164.81 },
  { note: "F3", value: 174.61 },
  { note: "F#3", value: 185.0 },
  { note: "G3", value: 196.0 },
  { note: "G#3", value: 207.65 },
  { note: "A3", value: 220.0 },
  { note: "A#3", value: 233.08 },
  { note: "B3", value: 246.94 },
  { note: "C4", value: 261.63 },
  { note: "C#4", value: 277.18 },
  { note: "D4", value: 293.66 },
  { note: "D#4", value: 311.13 },
  { note: "E4", value: 329.63 },
  { note: "F4", value: 349.23 },
  { note: "F#4", value: 369.99 },
  { note: "G4", value: 392.0 },
  { note: "G#4", value: 415.3 },
  { note: "A4", value: 440.0 },
  { note: "A#4", value: 466.16 },
  { note: "B4", value: 493.88 },
  { note: "C5", value: 523.25 },
  { note: "C#5", value: 554.37 },
  { note: "D5", value: 587.33 },
  { note: "D#5", value: 622.25 },
  { note: "E5", value: 659.25 },
];

const initialNotes = [
  { id: 1, name: "A2" },
  { id: 1.5, name: "A#2" },
  { id: 2, name: "B2" },
  { id: 3, name: "C3" },
  { id: 3.5, name: "C#3" },
  { id: 4, name: "D3" },
  { id: 4.5, name: "D#3" },
  { id: 5, name: "E3" },
  { id: 6, name: "F3" },
  { id: 6.5, name: "F#3" },
  { id: 7, name: "G3" },
  { id: 7.5, name: "G#3" },
  { id: 8, name: "A3" },
  { id: 8.5, name: "A#3" },
  { id: 9, name: "B3" },
  { id: 10, name: "C4" },
  { id: 10.5, name: "C#4" },
  { id: 11, name: "D4" },
  { id: 11.5, name: "D#4" },
  { id: 12, name: "E4" },
];

const keyMaps = [
  { key: "KeyA", id: 1 },
  { key: "KeyW", id: 1.5 },
  { key: "KeyS", id: 2 },
  { key: "KeyD", id: 3 },
  { key: "KeyR", id: 3.5 },
  { key: "KeyF", id: 4 },
  { key: "KeyT", id: 4.5 },
  { key: "KeyG", id: 5 },
  { key: "KeyH", id: 6 },
  { key: "KeyU", id: 6.5 },
  { key: "KeyJ", id: 7 },
  { key: "KeyI", id: 7.5 },
  { key: "KeyK", id: 8 },
  { key: "KeyO", id: 8.5 },
  { key: "KeyL", id: 9 },
  { key: "Semicolon", id: 10 },
  { key: "BracketLeft", id: 10.5 },
  { key: "Quote", id: 11 },
  { key: "BracketRight", id: 11.5 },
  { key: "Backslash", id: 12 },
];

function isInt(n) {
  return n % 1 === 0;
}

let audioContext;
let currentOscillator;
let analyzer;

const Stylophone = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [notes, setNotes] = useState(initialNotes);
  const [activeButton, setActiveButton] = useState(2);
  const [isVibrato, setVibrato] = useState(false);
  const [isLandscape, setLandscape] = useState(false);

  useEffect(() => {
    if (window.innerHeight < window.innerWidth) setLandscape(true);
    else setLandscape(false);
    window.addEventListener("resize", detect, false);

    return () => window.removeEventListener("resize", detect, false);
  }, []);

  const detect = () => {
    if (window.innerHeight < window.innerWidth) setLandscape(true);
    else setLandscape(false);
  };

  useEffect(() => {
    if (!isLandscape) return;

    // Thanks Apple for a different support for iOS audio
    if (typeof AudioContext !== "undefined") {
      audioContext = new AudioContext();
    } else if (typeof window.webkitAudioContext !== "undefined") {
      audioContext = new window.webkitAudioContext();
    }

    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;

    containerRef.current.focus();

    const ctx = canvasRef.current.getContext("2d");

    let animationFrame;

    function render() {
      const frequencyBinCountArray = new Uint8Array(analyzer.frequencyBinCount);
      const barCount = canvasRef.current.width / 2;

      analyzer.getByteFrequencyData(frequencyBinCountArray);

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = "#5d9e7e";

      for (let i = 0; i < barCount; i++) {
        const barPosition = i * 4;
        const barWidth = 2;

        const barHeight = -(frequencyBinCountArray[i] / 2);

        ctx.fillRect(
          barPosition,
          canvasRef.current.height,
          barWidth,
          barHeight
        );
      }

      animationFrame = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (currentOscillator) currentOscillator.disconnect();
      analyzer.disconnect();
      window.removeEventListener("resize", detect, false);
    };
  }, [notes, isVibrato, isLandscape]);

  // sound section
  const vibrato = (frequency) => {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 7; // 7hz as in original oscillator

    const gain = audioContext.createGain();
    gain.gain.value = 5;

    oscillator.connect(gain).connect(frequency);
    oscillator.start();
  };

  const playFrequency = (frequency) => {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    if (currentOscillator) currentOscillator.disconnect();

    osc.type = "sawtooth";
    osc.frequency.value = frequency;
    gainNode.gain.value = 0.15;

    osc.connect(gainNode);
    gainNode.connect(analyzer);
    analyzer.connect(audioContext.destination);

    currentOscillator = osc;

    if (isVibrato) vibrato(osc.frequency);

    osc.start(0);
  };

  const stopNote = () => {
    if (currentOscillator) {
      currentOscillator.stop(0);
      currentOscillator.disconnect();
    }
  };

  // controls

  const handleNote = (mode) => {
    let noteCursor = `A${mode}`;
    let index = Frequencies.findIndex((f) => f.note === noteCursor);

    const newNotes = notes.map((note) => {
      const newNote = Frequencies[index++];
      return { ...note, name: newNote.note };
    });
    setActiveButton(mode);
    setNotes(newNotes);
  };

  const toggleVibrato = () => {
    setVibrato(!isVibrato);
  };

  // mouse events
  let isClicking = false;

  const handleMouseDown = (e, note) => {
    isClicking = true;
    const frequency = Frequencies.find((f) => f.note === note);
    if (frequency) playFrequency(frequency.value);
  };

  const handleMouseUp = () => {
    isClicking = false;
    stopNote();
  };

  const handleMouseOver = (e, note) => {
    if (isClicking) {
      const frequency = Frequencies.find((f) => f.note === note);
      if (frequency) playFrequency(frequency.value);
    }
  };

  const handleMouseLeave = () => {
    stopNote();
    return;
  };

  // keyboard events
  const pressedKeys = [];
  const handleKeyDown = (e) => {
    e.preventDefault();

    const { code: c } = e;

    switch (c) {
      case "Digit1":
        if (activeButton === 1) break;
        pressedKeys = [];
        stopNote();
        handleNote(1);
        return;
      case "Digit2":
        if (activeButton === 2) break;
        pressedKeys = [];
        stopNote();
        handleNote(2);
        return;
      case "Digit3":
        if (activeButton === 3) break;
        pressedKeys = [];
        stopNote();
        handleNote(3);
        return;
      case "KeyV":
        pressedKeys = [];
        stopNote();
        toggleVibrato();
        return;
    }

    if (pressedKeys.find((key) => key === c)) return;

    const keyMap = keyMaps.find((key) => key.key === c);
    if (!keyMap) return;
    const note = notes.find((n) => n.id === keyMap.id);
    const frequency = Frequencies.find((f) => f.note === note.name);
    pressedKeys.push(c);
    playFrequency(frequency.value);
  };

  const handleKeyUp = (e) => {
    e.preventDefault();

    const { code: c } = e;
    const index = pressedKeys.indexOf(c);
    if (index > -1) pressedKeys.splice(index, 1);
    if (pressedKeys.length === 0) stopNote();
  };

  // touch events
  let lastTouched = null;

  const handleTouchStart = (e, note) => {
    if (lastTouched) stopNote();

    lastTouched = e.touches[0]?.target || null;

    if (lastTouched) {
      handleMouseDown(e, note);
    }
  };

  const handleTouchEnd = (e) => {
    console.log(e);
    lastTouched = null;
    audioContext.resume();
    handleMouseUp();
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    if (!touch) return;

    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!target || target === lastTouched || !target.classList.contains("key"))
      return;

    const noteId = target.id.replace("key-", "");
    const note = notes.find((n) => n.id === Number(noteId));

    lastTouched = target;

    handleMouseOver(e, note.name);
  };
  return (
    <>
      <Head>
        <title>Stylophone</title>
      </Head>

      <div
        ref={containerRef}
        tabIndex={0}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {!isLandscape ? (
          <div className="no-landscape">
            <h1>Stylophone</h1>
            <div className="container-portrait">
              <img
                src="rotate.png"
                alt="rotate phone"
                className="rotate-image"
              />
              <h2>Rotate Your Phone To Use Stylophone</h2>
            </div>
          </div>
        ) : (
          <div className="stylophone">
            <div>
              <div>
                <div className="controls">
                  <div>
                    <h1 className="title">Stylophone</h1>
                    <button
                      className={
                        activeButton === 1
                          ? "stylo-btn stylo-btn-active"
                          : "stylo-btn"
                      }
                      onClick={() => handleNote(1)}
                    >
                      1
                    </button>
                    <button
                      className={
                        activeButton === 2
                          ? "stylo-btn stylo-btn-active"
                          : "stylo-btn"
                      }
                      onClick={() => handleNote(2)}
                    >
                      2
                    </button>
                    <button
                      className={
                        activeButton === 3
                          ? "stylo-btn stylo-btn-active"
                          : "stylo-btn"
                      }
                      onClick={() => handleNote(3)}
                    >
                      3
                    </button>
                    <button
                      className={
                        isVibrato ? "stylo-btn stylo-btn-active" : "stylo-btn"
                      }
                      onClick={toggleVibrato}
                    >
                      <svg viewBox="0 0 24 24" className="vibrato-icon">
                        <path
                          fill="currentColor"
                          d="M20,12H22V14H20C18.62,14 17.26,13.65 16,13C13.5,14.3 10.5,14.3 8,13C6.74,13.65 5.37,14 4,14H2V12H4C5.39,12 6.78,11.53 8,10.67C10.44,12.38 13.56,12.38 16,10.67C17.22,11.53 18.61,12 20,12M20,6H22V8H20C18.62,8 17.26,7.65 16,7C13.5,8.3 10.5,8.3 8,7C6.74,7.65 5.37,8 4,8H2V6H4C5.39,6 6.78,5.53 8,4.67C10.44,6.38 13.56,6.38 16,4.67C17.22,5.53 18.61,6 20,6M20,18H22V20H20C18.62,20 17.26,19.65 16,19C13.5,20.3 10.5,20.3 8,19C6.74,19.65 5.37,20 4,20H2V18H4C5.39,18 6.78,17.53 8,16.67C10.44,18.38 13.56,18.38 16,16.67C17.22,17.53 18.61,18 20,18Z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width="657"
                    className="stylo-canvas"
                  ></canvas>
                </div>
              </div>
              <div
                className="keyboard"
                onContextMenu={(e) => e.preventDefault()}
              >
                <ul
                  className="keys"
                  onMouseLeave={handleMouseLeave}
                  onTouchEnd={handleTouchEnd}
                >
                  {notes.map((note) => {
                    const key = keyMaps.find((k) => k.id === note.id);
                    let hint = "";

                    switch (key.key) {
                      case "Semicolon":
                        hint = ";";
                        break;
                      case "BracketLeft":
                        hint = "[";
                        break;
                      case "Quote":
                        hint = "'";
                        break;
                      case "BracketRight":
                        hint = "]";
                        break;
                      case "Backslash":
                        hint = "\\";
                        break;
                      default:
                        hint = key.key.replace("Key", "");
                    }

                    return (
                      <li
                        className={isInt(note.id) ? "key" : "key black"}
                        id={`key-${note.id}`}
                        key={note.id}
                        onMouseDown={(e) => handleMouseDown(e, note.name)}
                        onMouseOver={(e) => handleMouseOver(e, note.name)}
                        onTouchStart={(e) => handleTouchStart(e, note.name)}
                        onTouchMove={handleTouchMove}
                      >
                        <span>{note.name}</span>
                        <span>{hint}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Stylophone;
