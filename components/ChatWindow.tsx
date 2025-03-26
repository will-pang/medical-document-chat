"use client";

import { useState } from "react";


export function Chatbot(props: { 
  initialText: string;
  fetchText: () => Promise<void>;
  sessionId: string;
}) {

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "User", text: input }]);
      setInput("");

      try {
        const response = await fetch(`/api/py/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input, context_from_file: props.initialText, session_id: props.sessionId}),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response from server");
        }

        const data = await response.json();
        
        // Assuming the response is an object with a 'response' key containing the text
        const botResponse = data.response.content; // Adjust this line based on your actual response structure

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "Bot", text: botResponse },
        ]);
      } catch (error) {
        console.error("Error fetching response:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-5 rounded-l-lg bg-gray-700"
          placeholder="Ask me about the medical document!"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-gray-100 text-black rounded-r-lg"
        >
          Send
        </button>
      </div>
      <div className="flex-grow overflow-auto p-4 rounded-lg shadow-md">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.sender === "User" ? "text-right" : "text-left"}`}>
            {message.sender === "Bot" ? (
              <div className="space-y-2">
                <span className="inline-block p-2 rounded-lg bg-gray-300 text-black">
                  {message.text.split(/<quote>[\s\S]*?<\/quote>/)}
                </span>
                {message.text.match(/<quote>([\s\S]*?)<\/quote>/) && (
                  <div className="flex items-center gap-2 p-2">
                    <span className="text-blue-500 text-xl">💡</span>
                    <span className="text-gray-200">
                      {message.text.match(/<quote>([\s\S]*?)<\/quote>/)![1]}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="inline-block p-2 rounded-lg bg-gray-700 text-white">
                {message.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
