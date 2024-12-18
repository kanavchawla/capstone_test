import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { HfInference } from "@huggingface/inference";

// Web Speech API
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US"; // Set recognition language to English

const synth = window.speechSynthesis;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const inference = new HfInference("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");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const botResponseChunks = [];

      for await (const chunk of inference.chatCompletionStream({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [{ role: "user", content: input }],
        max_tokens: 500,
      })) {
        const botMessageChunk = chunk.choices[0]?.delta?.content || "";
        botResponseChunks.push(botMessageChunk);

        const streamingResponse = botResponseChunks.join("");
        setMessages([
          ...newMessages,
          { sender: "bot", text: streamingResponse },
        ]);
      }

      const botResponse = botResponseChunks.join("");

      const utterance = new SpeechSynthesisUtterance(botResponse);
      utterance.lang = "en-US"; // Set TTS language to English
      synth.speak(utterance);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "An error occurred. Please try again later." },
      ]);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const voiceInput = event.results[0][0].transcript;
      setInput(voiceInput);
      setIsListening(false);
    };
    recognition.onspeechend = () => {
      recognition.stop();
      handleSend();
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px",
          backgroundColor: "rgb(102, 118, 146)",
          color: "white",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {isOpen ? "Close" : "💬"}
      </button>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            width: "320px",
            height: "400px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "rgb(102, 118, 146)",
              color: "white",
              padding: "12px",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              fontWeight: "bold",
            }}
          >
            Chatbot
          </div>
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  margin: "8px 0",
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor:
                    message.sender === "user"
                      ? "rgb(173, 216, 230)"
                      : "#f3f4f6",
                  textAlign: message.sender === "user" ? "right" : "left",
                }}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              borderTop: "1px solid #ccc",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type or use voice..."
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
                backgroundColor: "rgb(102, 118, 146)",
                color: "white",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
