import React from 'react';
import "../css/componentCss/ChatModal.css"

const ChatModal = ({ message, onMessageChange, onSendMessage, onClose }) => {
  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <h3>Send Message</h3>
        <textarea
          value={message}
          onChange={onMessageChange}
          placeholder="Type your message here..."
        />
        <button onClick={onSendMessage}>Send</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChatModal;
