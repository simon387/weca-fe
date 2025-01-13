import {useEffect, useRef, useState} from 'react';
import {Terminal} from 'lucide-react';

interface Message {
	id: string;
	message: string;
	ip: string;
	creationTime: string;
}

function App() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	// const baseUrl = 'http://localhost:8080/api/message';
	const baseUrl = 'http://151.65.1.207:8080/api/message'; // senza http per errori mixed cors

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
	};

	useEffect(() => {
		fetchMessages();
		const interval = setInterval(fetchMessages, 5000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const fetchMessages = async () => {
		try {
			const response = await fetch(baseUrl);
			const data: Message[] = await response.json();
			setMessages(data);
		} catch (error) {
			console.error('Error fetching messages:', error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		setLoading(true);
		try {
			await fetch(baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({message: newMessage}),
			});

			await fetchMessages();
			setNewMessage('');
		} catch (error) {
			console.error('Error sending message:', error);
		}
		setLoading(false);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString();
	};

	return (
		<div className="min-h-screen bg-black p-4 text-green-500 font-mono">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-2 mb-4 border-b border-green-500 pb-2">
					<Terminal className="w-6 h-6"/>
					<h1 className="text-xl font-bold">TERMINAL_CHAT v1.0</h1>
				</div>

				{/* Messages Container */}
				<div className="bg-black/50 rounded border border-green-500 p-4 mb-4 h-[60vh] overflow-y-auto">
					{messages.map((msg) => (
						<div key={msg.id} className="mb-3 hover:bg-green-500/10 p-2 rounded transition-colors">
							<div className="flex items-center gap-2 text-sm text-green-300">
								<span className="text-green-400">[{formatDate(msg.creationTime)}]</span>
								<span className="text-yellow-500">{msg.ip}</span>
							</div>
							<div className="ml-4 mt-1">
								<span className="text-green-500">$ {msg.message}</span>
							</div>
						</div>
					))}
					<div ref={messagesEndRef}/>
				</div>

				{/* Input Form */}
				<form onSubmit={handleSubmit} className="flex gap-2">
					<div className="flex-1 relative">
						<span className="absolute left-2 top-2 text-green-500">$</span>
						<input
							type="text"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							className="w-full bg-black border border-green-500 rounded px-6 py-2 text-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
							placeholder="Type your message..."
							disabled={loading}
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 transition-colors disabled:opacity-50"
					>
						{loading ? 'SENDING...' : 'SEND'}
					</button>
				</form>

				{/* Status Bar */}
				<div className="mt-4 text-sm text-green-400">
					<span>[STATUS]: {loading ? 'PROCESSING...' : 'READY'}</span>
					<span className="ml-4">[MESSAGES]: {messages.length}</span>
				</div>
			</div>
		</div>
	);
}

export default App;