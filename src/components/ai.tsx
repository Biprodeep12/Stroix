import { ChevronDown, Mic, MoveRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const SpeechRecognitionAPI: typeof SpeechRecognition | undefined =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

interface Props {
  openSidebar: boolean;
}

export default function Ai({ openSidebar }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [text, setText] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [isAi, setIsAi] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [micDisplay, setMicDisplay] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.warn('Media Devices API not supported');
      return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter((device) => device.kind === 'audioinput');
      setMicrophones(mics);
      if (mics.length > 0) setSelectedMic(mics[0].deviceId);
    });
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const startListening = async () => {
    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
      });
      mediaStreamRef.current = stream;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) =>
        console.error('Speech error:', event.error);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.trim();
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    const userMessage = { role: 'user' as const, content: text };
    setMessages((prev) => [...prev, userMessage]);

    setText('');
    setLoading(true);
    setIsAi(false);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('AI response failed');

      const data = await response.json();
      const aiMessage = {
        role: 'assistant' as const,
        content: data.choices[0]?.message?.content || 'No response',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`h-screen w-full flex items-center relative
       flex-col ${isAi ? 'gap-2  justify-center' : 'justify-start'}`}>
      <nav
        className={`van top-0 absolute w-full flex ${
          openSidebar ? 'pl-5' : 'pl-15'
        } py-2 items-center text-3xl font-bold transition-all duration-300 ease`}>
        Drake
      </nav>
      {isAi ? (
        <>
          <div className='text-5xl font-bold text-center mx-1'>
            Your AI Study Companion
          </div>
          <div className='text-[#696969] mb-3 mx-1'>
            Experience AI-Powered Study Assistance
          </div>
        </>
      ) : (
        <>
          <div
            ref={messagesEndRef}
            className='w-full rounded p-3 overflow-y-scroll mesCont max-w-[800px]'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-black'
                }`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className='text-gray-500 italic flex items-center'>
                AI is typing...
              </div>
            )}
          </div>
          <div className='caut absolute bottom-0 text-[13px] text-[#606060]'>
            Drake can make mistakes.
          </div>
        </>
      )}

      <div
        className={`${
          isAi ? 'max-w-[480px]' : 'max-w-[680px] mt-auto'
        }  transition-all duration-500 w-full border-[1px] border-[#c5c5c5] rounded-xl grid grid-rows-[auto_45px] mb-5 relative aiBox
        `}>
        <button
          aria-label='Submit'
          className={`absolute right-4 top-4 bg-blue-500 p-2 rounded cursor-pointer hover:bg-blue-600 ${
            text.trim().length > 0 ? 'arBtn' : 'goBtn'
          }`}
          onClick={handleSendMessage}>
          <MoveRight color='white' size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className='outline-none p-4 pr-25 min-h-[80px] resize-none overflow-hidden aiArea'
          placeholder='How can your StudyBuddy help you today?'
        />

        <div className='flex flex-row px-3 pb-3'>
          <button
            aria-label='Pomodoro Mode'
            className='focus:bg-blue-400 px-1.5 rounded focus:text-white text-[#ccc] border-1 border-[#ccc] cursor-pointer hover:bg-gray-100'>
            Pomodoro Mode
          </button>

          <button
            aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
            onClick={isListening ? stopListening : startListening}
            className={`cursor-pointer px-2 rounded ml-auto flex items-center justify-center relative micCont ${
              isListening ? 'bg-red-500' : 'bg-blue-500'
            }`}>
            <Mic color='white' className='mic' />
            <div
              className='absolute bg-blue-500 -right-2 -bottom-2 border-2 border-white rounded-2xl z-10'
              onClick={() => setMicDisplay((prev) => !prev)}>
              <ChevronDown color='white' size={17} />
            </div>
            {micDisplay && (
              <select
                className='-bottom-[35px] border border-[#ccc] bg-white rounded px-2 py-1 text-sm absolute micSel'
                onChange={(e) => setSelectedMic(e.target.value)}
                value={selectedMic || ''}>
                {microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                  </option>
                ))}
              </select>
            )}
          </button>
        </div>
      </div>

      {isAi && (
        <div className='text-[#8686ff] font-bold max-w-[500px] text-center text-xl mx-1'>
          Get instant help with any subject, track your progress, and master
          difficult concepts with our AI-powered study platform.
        </div>
      )}
    </div>
  );
}
