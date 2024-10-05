"use client";
import { FormEvent, useEffect, useState } from "react";
import poppins from "./fonts";
import Markdown from "react-markdown";

export default function Home() {
	let [input, setInput] = useState("");
	let [isSystemThinking, setIsSystemThinking] = useState(false);
	let [messages, setMessages] = useState([
		{
			user: false,
			text: "Hi! I am your helpful BU assistant. How can I help you today?",
		},
	]);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setIsSystemThinking(true);
		setInput("");
		const userMsg = { user: true, text: input };
		setMessages([...messages, userMsg]);
		let systemMsg;
		try {
			const response = await fetch("/api/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					[...messages, userMsg].slice(1).map((msg) => ({
						role: msg.user ? "user" : "assistant",
						content: msg.text,
					}))
				),
			});
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
				<div className={"body-main " + poppins.className}>
					{messages.map((msg, i) => (
						<div className="response" key={i}>
							{msg.user ? <span className={poppins.className}>Me:</span> : ""}
							<Markdown>{msg.text}</Markdown>
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
