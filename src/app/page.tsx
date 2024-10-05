"use client"
import { useEffect, useState } from "react"
import poppins from "./fonts"

export default function Home()
{
    let [state, setState] = useState(
    [
        {
            user: true,
            text: "Example question"
        },
        {
            user: false,
            text: "Example response"
        },
        {
            user: true,
            text: "Example question again"
        },
        {
            user: false,
            text: "Example response again"
        }
    ])

    return (
        <div className="main">
            <div className="header">
                <span className={poppins.className}>BUSource</span>
            </div>
            <div className="body">
                <div className="body-main">
                    {
                        state.map((response, i) => (
                            <div className="response" key={i}>
                                {response.user ? <span className={poppins.className}>Me:</span> : ""}
                                <span className={poppins.className}>{response.text}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="footer">
                <div className="footer-body">
                    <form onSubmit={() => console.log("hi")}>
                            <input type="text" className={poppins.className} />
                            <input type="submit" value="Send" />
                    </form>
                </div>
            </div>
        </div>
    )
}
