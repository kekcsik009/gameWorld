import './App.css';
import { useState, useEffect } from 'react';

// Список слов для игры
const WORDS = [
  'РУЧКА', 'ЛАМПА', 'КНИГА', 'РАДИО', 'ОКНО', 'КОШКА', 'МЫШКА', 'ДИВАН', 'ТОПОР', 'ЗЕМЛЯ',
];

function App() {
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0); // Баллы
  const [usedLetters, setUsedLetters] = useState(new Set()); // Уже использованные буквы
  const [bonusPoints, setBonusPoints] = useState(0); // Бонусные очки
  const MAX_ATTEMPTS = 6;

  // Генерация случайного слова
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setSecretWord(WORDS[randomIndex]);
  }, []);

  // Обработка клавиатурного ввода
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameOver) return;
      if (/^[а-яА-ЯёË]$/.test(event.key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess(prev => prev + event.key.toUpperCase());
        }
      } else if (event.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (event.key === 'Enter') {
        if (currentGuess.length === 5) {
          checkGuess();
        } else {
          setMessage('Слово должно быть 5 букв!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameOver]);

  // Проверка слова
  const checkGuess = () => {
    const newGuess = [...guesses, currentGuess];
    setGuesses(newGuess);
    setCurrentGuess('');

    let roundScore = 0; // Оценка текущего раунда
    let correctCount = 0; // Кол-во правильно расположенных букв
    let partialCount = 0; // Кол-во частично совпадающих букв

    // Анализируем каждую букву
    for (let i = 0; i < currentGuess.length; i++) {
      const letter = currentGuess[i];
      if (secretWord[i] === letter && !usedLetters.has(letter)) {
        roundScore += 50; // Зеленая буква (+5 очков)
        usedLetters.add(letter); // Запоминаем использованную букву
        correctCount++;
      } else if (secretWord.includes(letter) && !usedLetters.has(letter)) {
        roundScore += 25; // Желтая буква (+2 очка)
        usedLetters.add(letter); // Запоминаем использованную букву
        partialCount++;
      }
    }

    setScore(prevScore => prevScore + roundScore); // Накапливаем общую оценку

    if (currentGuess === secretWord) {
      setBonusPoints(100); // Дополнительно наградить за победу
      setGameOver(true);
      setMessage(`Поздравляем, вы угадали слово! Ваш счёт: ${score + bonusPoints}.`);
    } else if (newGuess.length >= MAX_ATTEMPTS) {
      setGameOver(true);
      setMessage(`Вы проиграли! Загаданное слово было "${secretWord}". Ваш счёт: ${score}.`);
    }
  };

  // Получение цвета ячейки
  const getCellColor = (letter, index, word) => {
    if (!letter) return '';
    if (secretWord[index] === letter) return 'correct';
    if (secretWord.includes(letter)) return 'present';
    return 'absent';
  };

  // Новая игра
  const startNewGame = () => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setSecretWord(WORDS[randomIndex]);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setMessage('');
    setScore(0); // Сбрасываем счёт
    setUsedLetters(new Set()); // Сбрасываем использованные буквы
    setBonusPoints(0); // Сбрасываем бонусы
  };

  return (
    <div className="app">
      <header>
        <h1>Игра слов</h1>
        <p>Отгадай загаданное слово</p>
      </header>
      <div className="game-board">
        {guesses.map((guess, guessIndex) => (
          <div key={guessIndex} className="word-row">
            {Array.from({ length: 5 }).map((_, letterIndex) => (
              <div
                key={letterIndex}
                className={`letter-box ${getCellColor(guess[letterIndex], letterIndex, guess)}`}
              >
                {guess[letterIndex]}
              </div>
            ))}
          </div>
        ))}
        {!gameOver && guesses.length < MAX_ATTEMPTS && (
          <div className="word-row current">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="letter-box">
                {currentGuess[index] || ''}
              </div>
            ))}
          </div>
        )}
        {!gameOver &&
          Array.from({ length: MAX_ATTEMPTS - guesses.length - 1 }).map((_, rowIndex) => (
            <div key={rowIndex} className="word-row">
              {Array.from({ length: 5 }).map((_, letterIndex) => (
                <div key={letterIndex} className="letter-box"></div>
              ))}
            </div>
          ))}
      </div>
      {message && <div className="message">{message}</div>}
      {score > 0 && <div className="score">Баллы: {score + bonusPoints}</div>}
      {gameOver && <button className="new-game-btn" onClick={startNewGame}>Новая игра</button>}
      {!gameOver && <div>Enter проверить, Backspace удалить</div>}
    </div>
  );
}

export default App;