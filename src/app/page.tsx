"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import poppins from "./fonts";
import Markdown from "react-markdown";

import Device, { ComputePass, ComputePipeline, LoadOperation, RenderPass, RenderPipeline, VertexFormat } from "./lib/Device"
import { Color3, Color4, Vector2 } from "./lib/Math"
import { Buffer, BufferFormat, Sampler, SamplerFilterMode, Shader, Texture, TextureFormat } from "./lib/Resource"

import textureCode from "./lib/shaders/texture"
import fluidSimulationCode from "./lib/shaders/fluid-simulation"

let mouse: Vector2 = Vector2.ZERO
let button: boolean = false

function mousemove(e: MouseEvent) { mouse = new Vector2(e.clientX, e.clientY) }
function mousedown(e: MouseEvent) { if (e.button === 0) button = true }
function mouseup(e: MouseEvent) { if (e.button === 0) button = false }

function touchmove(e: TouchEvent) { mouse = new Vector2(e.touches[0].clientX, e.touches[0].clientY) }
function touchstart(_: TouchEvent) { button = true }
function touchend(_: TouchEvent) { button = false }

let canvas!: HTMLCanvasElement
let init = false

export default function Home() {
	let [input, setInput] = useState("");
	let [isSystemThinking, setIsSystemThinking] = useState(false);
	let [messages, setMessages] = useState([
		{
			user: false,
			text: "Hi! I am your helpful BU assistant. How can I help you today?",
		},
	]);

    let canvasRef = useRef(null)
	useEffect(() =>
	{
        if (init) return
        init = true
        
        window.addEventListener("mousemove", mousemove)
        window.addEventListener("touchmove", touchmove)
        window.addEventListener("mousedown", mousedown)
        window.addEventListener("touchstart", touchstart)
        window.addEventListener("mouseup", mouseup)
        window.addEventListener("touchend", touchend)

        canvas = canvasRef.current!

		let timer: NodeJS.Timeout | null = null
		window.addEventListener("resize", () =>
		{
			if (timer !== null) clearTimeout(timer)
			timer = setTimeout(() =>
			{
				timer = null
				resize()
			}, 100)
		})

		function resize()
		{
			console.log("hi")
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}
	}, [])

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
			<canvas ref={canvasRef}></canvas>
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
