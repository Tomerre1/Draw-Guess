import { Button } from '@material-ui/core';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { TwitterPicker } from 'react-color';
import DeleteIcon from '@material-ui/icons/Delete';
import { useWindowSize } from '@react-hook/window-size';
import { UserContext } from '../context/UserContext';
import { socket } from '../socket/Socket';
import { useHistory } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';

const Canvas = ({ changeWord, setChangeWord }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const [open, setOpen] = useState(false);
  const [winWidth, winHeight] = useWindowSize();
  const { role } = useContext(UserContext);
  const history = useHistory();
  const canvasHeightRatio = 0.6;
  const canvasWidthRatio = 0.9;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = winHeight * canvasHeightRatio;
    canvas.width = winWidth * canvasWidthRatio;
    const context = canvas.getContext('2d');
    context.scale(1, 1);
    context.lineCap = 'round';
    context.lineWidth = 3;
    contextRef.current = context;
  }, [winWidth, winHeight]);

  useEffect(() => {
    socket.on('start draw', ({ x, y }) => {
      if (!contextRef.current) return;
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    });
    socket.on('draw', (data) => {
      if (!contextRef.current) return;
      contextRef.current.lineTo(data.x, data.y);
      contextRef.current.strokeStyle = data.color.hex;
      contextRef.current.stroke();
    });
    socket.on('finish draw', () => {
      if (!contextRef.current) return;
      contextRef.current.closePath();
    });
    socket.on('clear', () => {
      if (!contextRef.current) return;
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    });
    socket.on('right answer', () => {
      if (!contextRef.current) return;
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    });
    socket.on('mode picked', () => {
      if (!contextRef.current) return;
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    });
  }, []);
  const startDrawing = (e) => {
    if (role === 'guess') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    contextRef.current.beginPath();
    contextRef.current.moveTo(touch.clientX - rect.x, touch.clientY - rect.y);
    setIsDrawing(true);
    socket.emit('start draw', {
      x: touch.clientX - rect.x,
      y: touch.clientY - rect.y,
    });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (role === 'guess') return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    contextRef.current.strokeStyle = color.hex;
    contextRef.current.lineTo(touch.clientX - rect.x, touch.clientY - rect.y);
    contextRef.current.stroke();
    socket.emit('draw', {
      x: touch.clientX - rect.x,
      y: touch.clientY - rect.y,
      color,
    });
  };

  const finishDrawing = () => {
    if (role === 'guess') return;
    contextRef.current.closePath();
    setIsDrawing(false);
    socket.emit('finish draw');
  };

  // const startDrawing = (e) => {
  //   if (role === 'guess') return;
  //   const rect = canvasRef.current.getBoundingClientRect();
  //   contextRef.current.beginPath();
  //   contextRef.current.moveTo(e.clientX - rect.x, e.clientY - rect.y);
  //   setIsDrawing(true);
  //   socket.emit('start draw', {
  //     x: e.clientX - rect.x,
  //     y: e.clientY - rect.y,
  //   });
  // };

  // const draw = (e) => {
  //   if (!isDrawing) return;
  //   if (role === 'guess') return;
  //   const rect = canvasRef.current.getBoundingClientRect();
  //   contextRef.current.strokeStyle = color.hex;
  //   contextRef.current.lineTo(e.clientX - rect.x, e.clientY - rect.y);
  //   contextRef.current.stroke();
  //   socket.emit('draw', {
  //     x: e.clientX - rect.x,
  //     y: e.clientY - rect.y,
  //     color,
  //   });
  // };

  // const finishDrawing = () => {
  //   if (role === 'guess') return;
  //   contextRef.current.closePath();
  //   setIsDrawing(false);
  //   socket.emit('finish draw');
  // };

  const clear = () => {
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    socket.emit('clear');
  };

  const endGame = () => {
    history.push('/end');
    socket.emit('end game');
  };

  return (
    <>
      <div className='canvas' style={{ marginBottom: '20px' }}>
        <canvas
          id='canvas'
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchMove={draw}
          ref={canvasRef}
        />
      </div>
      {role === 'draw' ? (
        <>
          {' '}
          <TwitterPicker color={color} onChange={setColor} />
          <div className='gameButtons'>
            <Button
              variant='contained'
              color='secondary'
              startIcon={<AddIcon />}
              style={{ marginTop: '20px' }}
              onClick={() => setChangeWord(!changeWord)}
            >
              Generate New Word
            </Button>
            <Button
              variant='contained'
              color='secondary'
              startIcon={<DeleteIcon />}
              style={{ marginTop: '20px' }}
              onClick={clear}
            >
              Clear Canvas
            </Button>

            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              open={open}
              onClose={() => setOpen(false)}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title='Score Submited'
            >
              <Button
                variant='contained'
                color='secondary'
                className='endGame'
                startIcon={<SentimentVeryDissatisfiedIcon />}
                style={{ marginTop: '20px' }}
                onClick={endGame}
              >
                End Game
              </Button>
            </Tooltip>
          </div>{' '}
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default Canvas;
