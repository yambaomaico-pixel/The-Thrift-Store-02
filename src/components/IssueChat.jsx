import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Input from './ui/Input';
import Button from './ui/Button';

const IssueChat = ({ orderId, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, `orders/${orderId}/chats`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chat:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, `orders/${orderId}/chats`), {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.fullName || currentUser.email,
        senderRole: currentUser.role,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '400px',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-bg)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-3)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>Issue Chat</h3>
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: 'var(--spacing-4)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)'
      }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading chat...</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: 'auto', marginBottom: 'auto' }}>
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '2px', padding: '0 4px' }}>
                  {msg.senderName} {msg.senderRole === 'admin' && '(Admin)'}
                </span>
                <div style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isMe ? 'white' : 'var(--color-text)',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomRightRadius: isMe ? '4px' : 'var(--radius-lg)',
                  borderBottomLeftRadius: !isMe ? '4px' : 'var(--radius-lg)',
                  border: isMe ? 'none' : '1px solid var(--color-border)'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          gap: 'var(--spacing-2)',
          padding: 'var(--spacing-3)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div style={{ flex: 1 }}>
          <Input 
            placeholder="Type your message..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default IssueChat;
