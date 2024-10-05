import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const reqBody = await request.json();

	console.log(reqBody);

	const pplxReqBody = {
		model: "llama-3.1-sonar-large-128k-online",
		messages: [
			{
				role: "system",
				content:
					"You are a helpful Boston University assistant tasked with giving helpful tips to BU Students.",
			},
			...reqBody,
		],
	};

	// console.log(process.env.PPLX_KEY);
	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.PPLX_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(pplxReqBody),
	};

	try {
		const response = await fetch(
			"https://api.perplexity.ai/chat/completions",
			options
		);
		const result = await response.json();
		console.log(result);

		const message = result.choices[0].message.content;
		console.log(message);
		return Response.json({ message });
	} catch (err) {
		console.error(err);
		return Response.json({ error: "Error from Perplexity API" });
	}
}
