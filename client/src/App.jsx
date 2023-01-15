import './App.css';
import { ThemeProvider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import orange from '@material-ui/core/colors/orange';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import Main from './components/Main';
import { UserContext } from './context/UserContext';
import ModePick from './components/ModePick';
import { socket } from './socket/Socket';
import EndGame from './components/EndGame';
import WordChoose from './components/WordChoose';

function App() {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: blue[500],
      },
      secondary: {
        main: orange[500],
      },
    },
  });

  useEffect(() => {
    socket.on('connection', (data) => {
      setRole(data.role);
    });
    socket.on('game full', () => {
      setGameStatus(true);
    });
    socket.on('mode picked', () => {
      setModePicked(true);
    });
  }, []);

  const [fullName, setFullName] = useState('');
  const [nickName, setNickName] = useState('');
  const [role, setRole] = useState('');
  const [gameStatus, setGameStatus] = useState(false);
  const [words, setWords] = useState([]);
  const [word, setWord] = useState([]);
  const [mode, setMode] = useState('');
  const [modePicked, setModePicked] = useState(false);
  const [score, setScore] = useState(0);

  return (
    <Router>
      <UserContext.Provider
        value={{
          fullName,
          nickName,
          setFullName,
          setNickName,
          role,
          words,
          word,
          mode,
          modePicked,
          gameStatus,
          score,
        }}
      >
        <ThemeProvider theme={theme}>
          <Header gameStatus={gameStatus} />
          <Redirect to='/sign' />
          <Route exact path='/'>
            <Redirect to='/sign' />
          </Route>
          <Route
            path='/choose-word'
            component={() => <WordChoose setWord={setWord} />}
          />
          <Route path='/sign' component={() => <SignIn />} />
          <Route
            path='/mode'
            component={() => (
              <ModePick
                setWords={setWords}
                setModePicked={setModePicked}
                setMode={setMode}
              />
            )}
          />
          <Route
            path='/main'
            component={() => <Main setWord={setWord} setScore={setScore} />}
          />

          <Route path='/end' component={EndGame} />
        </ThemeProvider>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
