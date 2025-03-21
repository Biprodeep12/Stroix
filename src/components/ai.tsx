import { Mic, MoveRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const SpeechRecognitionAPI: typeof SpeechRecognition | undefined =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export default function Ai() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Fetch available microphones
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter((device) => device.kind === 'audioinput');
      setMicrophones(mics);
      if (mics.length > 0) setSelectedMic(mics[0].deviceId);
    });
  }, []);

  // Adjust textarea height dynamically
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
      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Get user media with the selected microphone
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

  return (
    <div className='flex justify-center items-center flex-col gap-2'>
      <div className='text-5xl font-bold'>Your AI Study Companion</div>
      <div className='text-[#696969] mb-3'>
        Experience AI-Powered Study Assistance
      </div>

      <div className='w-[35%] border-[1px] border-[#c5c5c5] rounded-xl grid grid-rows-[auto_45px] relative mb-3'>
        <button
          aria-label='Submit'
          className={`absolute right-4 top-4 bg-blue-500 p-2 rounded cursor-pointer hover:bg-blue-600 ${
            text.trim().length > 0 ? 'arBtn' : 'goBtn'
          }`}>
          <MoveRight color='white' size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          className='outline-none p-4 pr-25 min-h-[80px] resize-none overflow-hidden'
          placeholder='How can your StudyBuddy help you today?'
        />

        <div className='flex flex-row px-3 pb-3 relative'>
          <button
            aria-label='Pomodoro Mode'
            className='focus:bg-blue-400 px-1.5 rounded focus:text-white text-[#ccc] border-1 border-[#ccc] cursor-pointer hover:bg-gray-100'>
            Pomodoro Mode
          </button>

          <button
            aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
            onClick={isListening ? stopListening : startListening}
            className={`cursor-pointer px-2 rounded ml-auto flex items-center justify-center micCont ${
              isListening ? 'bg-red-500' : 'bg-blue-400'
            }`}>
            <Mic color='white' className='mic' />

            <select
              className='border -bottom-[50px] border-gray-300 rounded px-2 py-1 text-sm absolute micSel'
              onChange={(e) => setSelectedMic(e.target.value)}
              value={selectedMic || ''}>
              {microphones.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                </option>
              ))}
            </select>
          </button>
        </div>
      </div>

      <div className='text-[#8686ff] font-bold max-w-[500px] text-center text-xl'>
        Get instant help with any subject, track your progress, and master
        difficult concepts with our AI-powered study platform.
      </div>
    </div>
  );
}
