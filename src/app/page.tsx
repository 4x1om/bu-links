"use client";
import { FormEvent, useEffect, useState } from "react";
import poppins from "./fonts";

export default function Home() {
	let [input, setInput] = useState("");
	let [isSystemThinking, setIsSystemThinking] = useState(false);
	let [messages, setMessages] = useState([
		{
			user: false,
			text: "Hi! How can I help you today?",
		},
	]);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setIsSystemThinking(true);
        setInput("")
		const userMsg = { user: true, text: input };
		setMessages([...messages, userMsg]);
		let systemMsg;
		try {
			const response = await fetch("/api/query?user=" + input);
			const json = await response.json();
			systemMsg = { user: false, text: json.message };
		} catch (err) {
			console.error(err);
			systemMsg = { user: false, text: "An error occurred." };
		}

		setMessages([...messages, userMsg, systemMsg]);
		setIsSystemThinking(false);
	}

	return (
		<div className="main">
			<div className="header">
				<span className={poppins.className}>BUSource</span>
			</div>  
			<div className="body">
                <div className="body-main">
                    {messages.map((msg, i) => (
                        <div className="response" key={i}>
                            {msg.user ? <span className={poppins.className}>Me:</span> : ""}
                            <span className={poppins.className}>{msg.text}</span>
                        </div>
                    ))}
                </div>
			</div>
			<div className="footer">
				<div className="footer-body">
					<form onSubmit={onSubmit}>
						<input
							type="text"
							className={poppins.className}
							value={input}
							onChange={(e) => setInput(e.target.value)}
						/>
						<input type="submit" disabled={isSystemThinking} value="Send" />
					</form>
				</div>
			</div>
		</div>
	);
}
