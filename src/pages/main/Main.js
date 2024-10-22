import React, { useState, useEffect, useCallback } from "react";
import "./Main.css";
import words from "../../components/words.json";

const Home = () => {
  const [targetWord, setTargetWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState(["", "", "", "", "", ""]);
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [keyboardColors, setKeyboardColors] = useState({});

  // Memoized function to start a new game
  const startNewGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setTargetWord(words[randomIndex].toUpperCase());
    setCurrentGuess("");
    setGuesses(["", "", "", "", "", ""]);
    setCurrentRow(0);
    setGameOver(false);
    setMessage("");
    setShowMessage(false);
    setKeyboardColors({});
  }, []);

  // useEffect to start a new game on mount
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

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

  const updateKeyboardColors = useCallback(() => {
    const newColors = {};

    for (let row = 0; row < guesses.length; row++) {
      const guess = guesses[row];
      if (!guess) continue;

      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (letter === targetWord[i]) {
          newColors[letter] = "green";
        }
      }

      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (newColors[letter] === "green") continue;

        if (targetWord.includes(letter)) {
          if (!newColors[letter]) {
            newColors[letter] = "yellow";
          }
        } else {
          if (!newColors[letter]) {
            newColors[letter] = "grey";
          }
        }
      }
    }

    setKeyboardColors(newColors);
  }, [guesses, targetWord]);

  useEffect(() => {
    updateKeyboardColors();
  }, [guesses, updateKeyboardColors]);

  const handlePlayAgain = useCallback(() => {
    setGuesses(["", "", "", "", "", ""]);
    setCurrentRow(0);
    setCurrentGuess("");
    setGameOver(false);
    setMessage("");
    setKeyboardColors({});
  }, []);

  const handleLetterClick = useCallback(
    (letter) => {
      if (currentGuess.length < 5 && !gameOver) {
        setCurrentGuess(currentGuess + letter);
      }
    },
    [currentGuess, gameOver]
  );

  const handleBackspace = useCallback(() => {
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, []);

  const handleEnter = useCallback(() => {
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

    setCurrentRow((prev) => prev + 1);
    setCurrentGuess("");
  }, [currentGuess, currentRow, guesses, targetWord]);

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
  }, [handleEnter, handleBackspace, handleLetterClick, gameOver]);

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
        <div className={`message ${gameOver ? "success" : ""}`}>
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
          <button className="key wide-key" onClick={handleEnter} disabled={gameOver}>
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
          <button className="key" onClick={handleBackspace} disabled={gameOver}>
            ⌫
          </button>
        </div>
      </div>

      {gameOver && (
        <button className="play-again-btn" onClick={handlePlayAgain}>
          Play Again
        </button>
      )}
    </div>
  );
};

export default Home;
