import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const rooms = ["room1", "room2"];
  const [state, setState] = useState({ message: '', name: '' });
  const [room, setRoom] = useState(null);
  const [chat, setChat] = useState([]);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('/');
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socketRef.current.emit('room_join', ({name, room}) => {
      setRoom(room);
    })
  }, [room]);

  useEffect(() => {
    socketRef.current.on('message', ({ name, message }) => {
      setChat([...chat, { name, message }]);
    });
    socketRef.current.on('user_join', function (data) {
      setChat([
        ...chat,
        { name: 'ChatBot', message: `${data} has joined the chat` }
      ]);
    });
  }, [chat]);

  const userjoin = (name) => {
    socketRef.current.emit('user_join', name);
  };

  const onMessageSubmit = (e) => {
    let msgEle = document.getElementById('message');
    console.log([msgEle.name], msgEle.value);
    setState({ ...state, [msgEle.name]: msgEle.value });
    socketRef.current.emit('message', {
      name: state.name,
      message: msgEle.value
    });
    e.preventDefault();
    setState({ message: '', name: state.name });
    msgEle.value = '';
    msgEle.focus();
  };

  const onRoomChange = (e) => {
    let roomEle = e.target;
    console.log([roomEle.name], roomEle.value);
    setRoom(roomEle.value);
    socketRef.current.on("room_join", {
      name: state.name,
    }, room);
  };

  const renderChat = () => {
    return chat.map(({ name, message }, index) => (
      <div key={index}>
        <h3>
          {name}: <span>{message}</span>
        </h3>
      </div>
    ));
  };

  return (
    <div>
      {state.name && room && (
        <div className="card">
          <div className="render-chat">
            <h1>Chat Log</h1>
            {renderChat()}
          </div>
          <form onSubmit={onMessageSubmit}>
            <h1>Messenger</h1>
            <div>
              <input
                name="message"
                id="message"
                variant="outlined"
                label="Message"
              />
            </div>
            <button>Send Message</button>
          </form>
        </div>
      )}

      {state.name && !room && (
        <div className="card">
          <h1>Which room would you like to join?</h1>
          <button onClick={onRoomChange} id="roomSelect1" name="room1">Room 1</button>
          <button onClick={onRoomChange} id="roomSelect2" name="room2">Room 2</button>
        </div>
      )}

      {!state.name && !room && (
        <form
          className="form"
          onSubmit={(e) => {
            console.log(document.getElementById('username_input').value);
            e.preventDefault();
            setState({ name: document.getElementById('username_input').value });
            userjoin(document.getElementById('username_input').value);
            // userName.value = '';
          }}
        >
          <div className="form-group">
            <label>
              User Name:
              <br />
              <input id="username_input" />
            </label>
          </div>
          <br />

          <br />
          <br />
          <button type="submit"> Click to join</button>
        </form>
      )}
    </div>
  );
}

export default App;