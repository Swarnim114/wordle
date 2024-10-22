import React, { useState, useEffect } from "react";
import "./Main.css"

const Home = () => {
  const targetWord = "REACT";
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState(["", "", "", "", "", ""]);
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [keyboardColors, setKeyboardColors] = useState({});

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        if (!gameOver) {
          setMessage("");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, gameOver]);

  useEffect(() => {
    updateKeyboardColors();
  }, [guesses]);

  const updateKeyboardColors = () => {
    const newColors = {};

    // Go through all submitted guesses
    for (let row = 0; row < guesses.length; row++) {
      const guess = guesses[row];
      if (!guess) continue;

      // First pass: mark green letters
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (letter === targetWord[i]) {
          newColors[letter] = "green";
        }
      }

      // Second pass: mark yellow and grey letters
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        // Skip if already marked green
        if (newColors[letter] === "green") continue;

        if (targetWord.includes(letter)) {
          // Only mark yellow if not already marked
          if (!newColors[letter]) {
            newColors[letter] = "yellow";
          }
        } else {
          // Only mark grey if not already marked
          if (!newColors[letter]) {
            newColors[letter] = "grey";
          }
        }
      }
    }

    setKeyboardColors(newColors);
  };

  const handleLetterClick = (letter) => {
    if (currentGuess.length < 5 && !gameOver) {
      setCurrentGuess(currentGuess + letter);
    }
  };

  const handleBackspace = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleEnter = () => {
    if (currentGuess.length !== 5) {
      setMessage("Word must be 5 letters!");
      return;
    }

    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    if (currentGuess === targetWord) {
      setMessage("You won! 🎉");
      setGameOver(true);
      return;
    }

    if (currentRow === 5) {
      setMessage(`Game Over! The word was ${targetWord}`);
      setGameOver(true);
      return;
    }

    setCurrentRow(currentRow + 1);
    setCurrentGuess("");
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameOver) return;

      if (event.key === "Enter") {
        handleEnter();
      } else if (event.key === "Backspace") {
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        handleLetterClick(event.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentGuess, currentRow, gameOver]);

  const getLetterColor = (rowIndex, position) => {
    if (rowIndex > currentRow) return "";
    if (rowIndex === currentRow && !guesses[rowIndex]) return "";

    const letter = guesses[rowIndex][position];

    if (letter === targetWord[position]) return "green";
    if (targetWord.includes(letter)) return "yellow";
    return "grey";
  };

  return (
    <div className="full-box">
      {showMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: gameOver ? "#4CAF50" : "#f44336",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          zIndex: 1000,
          transition: 'opacity 0.3s ease',
          opacity: showMessage ? 1 : 0,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <div className="wordle-grid">
        {[0, 1, 2, 3, 4, 5].map((rowIndex) => (
          <div key={rowIndex} className={`wordle-row-${rowIndex + 1}`}>
            {[0, 1, 2, 3, 4].map((position) => (
              <div
                key={position}
                className={`wordle-box ${getLetterColor(rowIndex, position)}`}
              >
                {rowIndex === currentRow
                  ? currentGuess[position]
                  : guesses[rowIndex][position]}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="keyboard">
        <div className="keyboard-row">
          {"QWERTYUIOP".split("").map((letter) => (
            <button
              key={letter}
              className={`key ${keyboardColors[letter] || ""}`}
              onClick={() => handleLetterClick(letter)}
              disabled={gameOver}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="keyboard-row">
          {"ASDFGHJKL".split("").map((letter) => (
            <button
              key={letter}
              className={`key ${keyboardColors[letter] || ""}`}
              onClick={() => handleLetterClick(letter)}
              disabled={gameOver}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="keyboard-row">
          <button
            className="key"
            onClick={handleEnter}
            disabled={gameOver}
            style={{ width: "4.5rem" }}
          >
            Enter
          </button>
          {"ZXCVBNM".split("").map((letter) => (
            <button
              key={letter}
              className={`key ${keyboardColors[letter] || ""}`}
              onClick={() => handleLetterClick(letter)}
              disabled={gameOver}
            >
              {letter}
            </button>
          ))}
          <button
            className="key"
            onClick={handleBackspace}
            disabled={gameOver}
            style={{ width: "4.5rem" }}
          >
            ←
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
