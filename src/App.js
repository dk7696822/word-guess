import React, { useState, useEffect } from 'react';
import { words } from 'popular-english-words';
import './App.css';

const getCommonFiveLetterWords = () => {
  const popularWords = words.getMostPopular(10000);
  const fiveLetterWords = popularWords.filter(word => {
    return word.length === 5 && new Set(word).size === 5;
  });
  return fiveLetterWords;
};

const App = () => {
  const [secretWord, setSecretWord] = useState('');
  const [inputs, setInputs] = useState(Array(5).fill(''));
  const [guesses, setGuesses] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const inputRefs = React.useRef([]);

  console.log("secret word", secretWord);

  useEffect(() => {
    const allWords = getCommonFiveLetterWords();
    const uniqueWords = allWords.filter(word => new Set(word).size === 5);
    setSecretWord(uniqueWords[Math.floor(Math.random() * uniqueWords.length)].toUpperCase());
  }, []);

  const handleChange = (index, value) => {
    if (/^[A-Za-z]?$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = value.toUpperCase();
      setInputs(newInputs);

      if (value && index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !inputs[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (event.key === 'Enter' && inputs.every(input => input)) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const word = inputs.join('');
    if (new Set(word).size !== 5) {
      setError('Duplicate letters not allowed');
      return;
    }
    if (!getCommonFiveLetterWords().includes(word.toLowerCase())) {
      setError('Word does not exist');
      return;
    }
    setError('');
    const guessResult = calculateResult(word);
    setGuesses([...guesses, { word, ...guessResult }]);
    setInputs(Array(5).fill(''));

    if (guessResult.correct === 5) {
      setShowModal(true);
    } else if (guesses.length === 9) {
      setShowModal(true);
    }
    inputRefs.current[0].focus();
  };

  const calculateResult = (word) => {
    let correct = 0;
    let misplaced = 0;
    const secretArray = secretWord.split('');
    const wordArray = word.split('');

    wordArray.forEach((letter, index) => {
      if (letter === secretArray[index]) {
        correct++;
        secretArray[index] = null;
        wordArray[index] = null;
      }
    });

    wordArray.forEach((letter) => {
      if (letter && secretArray.includes(letter)) {
        misplaced++;
        secretArray[secretArray.indexOf(letter)] = null;
      }
    });

    return { correct, misplaced };
  };

  const resetGame = () => {
    const words = getCommonFiveLetterWords();
    const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    setSecretWord(randomWord);
    setInputs(Array(5).fill(''));
    setGuesses([]);
    setError('');
    setShowModal(false);
  };

  return (
    <div className="game-container">
      <h1>Word Guess Game</h1>
      <div className="guesses-container">
        {guesses.map((guess, index) => (
          <div key={index} className="guess-row">
            <span>{guess.word}</span>
            <div className="result-circles">
              {guess.correct > 0 && <span className="circle green">{guess.correct}</span>}
              {guess.misplaced > 0 && <span className="circle yellow">{guess.misplaced}</span>}
              {guess.correct === 0 && guess.misplaced === 0 && (
                <span className="circle red">0</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="input-container">
        {inputs.map((letter, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            value={letter}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength="1"
          />
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {guesses[guesses.length - 1]?.correct === 5 ? (
              <h2>Congratulations! 🎉 You are a genius!</h2>
            ) : (
              <h2>Try Again! The correct word was: {secretWord}</h2>
            )}
            <button onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
