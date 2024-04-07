"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEffect, useState, useRef } from 'react';
import tmi from 'tmi.js';

// Define a type for the chat messages
interface ChatMessageProps {
    id: string;
    user: string;
    message: string;
}

// Create a component for chat messages
const ChatMessage: React.FC<ChatMessageProps> = ({ id, user, message }) => {
    return (
        <Card>
            <CardContent className='pt-3 pb-3'>
            <Label>{user}: </Label>
            {message}
            </CardContent>
        </Card>
    );
}

export default function Home() {
    const [messages, setMessages] = useState<ChatMessageProps[]>([]);
    const [channel, setChannel] = useState('');
    const [connectedChannel, setConnectedChannel] = useState('');
    const messageIds = useRef(new Set<string>());

    useEffect(() => {
        if (connectedChannel !== '') {
            const client = new tmi.Client({
                channels: [connectedChannel]
            });

            client.connect();

            client.on('message', (channel, tags, message, self) => {
                // Check if a message with the same id already exists
                if (!messageIds.current.has(tags.id)) {
                    // Add the id to the Set
                    messageIds.current.add(tags.id);

                    // Add the new message to the state
                    setMessages(prevMessages => [...prevMessages, { id: tags.id, user: tags.username, message }]);
                }
            });

            // Cleanup function to disconnect when the component is unmounted
            return () => {
                client.disconnect();
            };
        }
    }, [connectedChannel]);

    const handleChannelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChannel(event.target.value);
    };

    const handleConnect = () => {
        setConnectedChannel(channel);
    };

    return (
        <main className=" max-h-screen overflow-hidden p-4">
            <input type="text" value={channel} onChange={handleChannelChange} />
            <button onClick={handleConnect}>Connect</button>
            <div id="chat">
                {connectedChannel === '' && <p>No channel connected.</p>}
                {messages.map((message, index) => (
                    <ChatMessage key={index} id={message.id} user={message.user} message={message.message} />
                ))}
            </div>
        </main>
    );
}