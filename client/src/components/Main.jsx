import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import Canvas from './Canvas';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import TextField from '@material-ui/core/TextField';
import { socket } from '../socket/Socket';
import { useHistory } from 'react-router-dom';

const Main = ({ setWord, setScore }) => {
  const { role, nickName, word, words, gameStatus, modePicked, mode, score } =
    useContext(UserContext);
  const [changeWord, setChangeWord] = useState(false);
  const [guess, setGuess] = useState('');
  const [secondUser, setSecondUser] = useState('');
  const history = useHistory();
  const scoreMap = {
    easy: 1,
    normal: 3,
    hard: 5,
  };
  useEffect(() => {
    // Generate random word
    if (role === 'draw' && changeWord) {
      const numberIndex = words.findIndex((currWord) => currWord === word);
      const ind = numberIndex + 1 >= words.length ? 0 : numberIndex + 1;
      const nextWord = words[ind];
      setWord(nextWord);
      socket.emit('clear');
    }
  }, [changeWord]);

  useEffect(() => {
    socket.on('check answer', (data) => {
      if (data.guess === word.toLocaleLowerCase()) {
        socket.emit('right answer', score + scoreMap[mode]);
        setScore(score + scoreMap[mode]);
        setChangeWord((prevState) => !prevState);
        setSecondUser(data.nickName);
      }
    });
    socket.on('end game', () => history.push('/end'));
    return () => {
      socket.off('check answer');
      socket.off('end game');
    };
  }, [word]);

  useEffect(() => {
    socket.on('right answer', (score) => {
      setChangeWord((prevState) => !prevState);
      setScore(score);
    });
    socket.on('mode picked', () => setScore(0));
    return () => {
      socket.off('right answer');
    };
  }, []);

  const handleGuess = () => {
    socket.emit('check answer', { guess: guess.toLocaleLowerCase(), nickName });
  };

  return (
    <div className='content'>
      {gameStatus && modePicked ? (
        <>
          {role === 'draw' ? <h2>Draw - {word}</h2> : ''}
          <h3 style={{ marginBottom: '10px' }}>Score : {score}</h3>
          <Canvas
            user2={secondUser}
            score={score}
            changeWord={changeWord}
            setChangeWord={setChangeWord}
          />
        </>
      ) : (
        <div className='waiting'>
          <AccessTimeIcon fontSize='large' />
          <Typography paragraph align='center' variant='h2'>
            Waiting For 2nd Player...
          </Typography>
          <AccessTimeIcon fontSize='large' />
        </div>
      )}
      {role === 'guess' && gameStatus && modePicked ? (
        <>
          <TextField
            onChange={(e) => setGuess(e.target.value)}
            value={guess}
            id='standard-basic'
            label='Place Your Guess Here !'
          />
          <Button
            onClick={handleGuess}
            variant='contained'
            color='secondary'
            style={{ marginTop: '20px' }}
          >
            Submit Your Answer
          </Button>
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default Main;
