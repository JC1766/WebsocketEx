import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const rooms = ["room1", "room2"];
  const [state, setState] = useState({ message: '', name: '' });
  const [room, setRoom] = useState("general");
  // const [chat, setChat] = useState([]);
  // // object of roomname: array of objects
  const [chat, setChat] = useState({});

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('/');
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socketRef.current.on('message', ({ name, message }) => {
      let c = chat;
      c[room] = [...c[room], { name, message } ];
      setChat(c);
    });
    // socketRef.current.on('user_join', function (data) {
    //   setChat([
    //     ...chat,
    //     { name: 'ChatBot', message: `${data} has joined the chat` }
    //   ]);
    // });
    socketRef.current.on('user_join', function (data) {
      let c = chat;
      if (!c[room]){
        c[room] = [];
      }
      c[room] = [...c[room], { name: 'ChatBot', message: `${data} has joined the chat` } ];
      console.log(c);
      setChat(c);
      console.log(chat);
    });

    socketRef.current.on('room_join', function (data) {
      let c = chat;
      if (!c[room]){
        c[room] = [];
      }
      c[room] = [...c[room], { name: 'ChatBot', message: `${data} has joined the chat` } ];
      setChat(c);
    });
  }, [chat,room]);

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
    }, room);
    e.preventDefault();
    setState({ message: '', name: state.name });
    msgEle.value = '';
    msgEle.focus();
  };

  const onRoomChange = (e) => {
    let roomEle = document.getElementById()
    console.log([roomEle.name], roomEle.value);
    let oldRoom = room;
    setRoom(newroom);
    socketRef.current.emit("room_join", state.name, newroom, oldRoom);
  };

  const renderChat = () => {
    if (!chat[room]){
      return ;
    }
    else{
      console.log(chat);
      return chat[room].map(({ name, message }, index) => 
      (
        <div key={index}>
          <h3>
            {name}: <span>{message}</span>
          </h3>
        </div>
      ));
    }
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
      {state.name && (
        <div className="card">
          <div className="render-chat">
            <h1>#{room}</h1>
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
          <div>
            {rooms.map((r, i) => 
              <button onClick={() => onRoomChange(r)} key={i}>{r}</button>
            )}
          </div>
        </div>
      )}

      {!state.name && (
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