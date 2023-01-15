import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';

const WordChoose = ({ setWord }) => {
  const { words } = useContext(UserContext);
  const history = useHistory();

  const handleClick = (word) => {
    setWord(word);
    history.push('/main');
  };
  return (
    <Container
      component='main'
      maxWidth='xs'
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '40px',
      }}
    >
      <Typography component='h1' variant='h5'>
        Choose Word
      </Typography>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '10px',
          gap: '10px',
        }}
      >
        {words.map((word) => (
          <Button
            key={word}
            type='submit'
            variant='contained'
            color='primary'
            onClick={() => handleClick(word)}
          >
            {word}
          </Button>
        ))}
      </div>
    </Container>
  );
};

export default WordChoose;
