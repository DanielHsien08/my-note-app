import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

const ChatRoom = () => {
  return (
    <div className="fixed bottom-6 right-6">
      <button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                   shadow-lg hover:shadow-xl transition-all duration-300 
                   flex items-center justify-center"
      >
        <FontAwesomeIcon 
          icon={faRobot} 
          className="text-white text-2xl"
        />
      </button>
    </div>
  );
};

export default ChatRoom;
