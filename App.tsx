import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Briefcase, MessageSquare, Globe } from 'lucide-react';
import { startChatSession, sendTextResponse } from './services/geminiService';
import FeedbackCard from './components/FeedbackCard';
import { GeminiInterviewResponse, Message } from './types';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for inputs
  const [industry, setIndustry] = useState("");
  const [language, setLanguage] = useState("Malayalam"); // Default to Malayalam
  const [inputText, setInputText] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim()) return;

    setIsLoading(true);
    try {
      const response = await startChatSession(industry, language);
      // Pass true to indicate this is the initial message (no feedback)
      await handleAIResponse(response, true);
      setIsStarted(true);
    } catch (error) {
      console.error("Failed to start interview", error);
      alert("Failed to start. Please check your API key and connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIResponse = async (response: GeminiInterviewResponse, isInitial: boolean = false) => {
    const newMessage: Message = {
      role: 'model',
      text: response.next_question,
      // Only show feedback if it's NOT the initial message and feedback exists
      feedback: (!isInitial && response.feedback) ? {
        score: response.feedback.score,
        critique: response.feedback.critique,
        improvementTip: response.feedback.improvement_tip,
        grammarCorrection: response.feedback.grammar_correction
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText(""); // Clear input
    setIsProcessing(true);

    try {
      // Add user message to UI
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

      const response = await sendTextResponse(userMessage);
      // Pass false (default) to show feedback for subsequent messages
      await handleAIResponse(response);

    } catch (error) {
      console.error("Error processing text:", error);
      alert("Error getting response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AI Interviewer Coach</h1>
              <p className="text-xs text-indigo-400 font-medium">Professional Edition</p>
            </div>
          </div>
          {isStarted && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">
               <Briefcase className="w-4 h-4 text-indigo-400" />
               <span className="font-medium text-white">{industry}</span>
               <span className="w-1 h-1 bg-slate-500 rounded-full mx-1"></span>
               <span className="text-xs uppercase tracking-wider">{language}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        
        {!isStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-12">
             <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center animate-pulse border border-slate-700 shadow-xl shadow-indigo-900/20">
                <MessageSquare className="w-10 h-10 text-indigo-400" />
             </div>
             <div className="max-w-md space-y-3">
               <h2 className="text-3xl font-bold text-white">Ready to Ace Your Interview?</h2>
               <p className="text-slate-400 text-lg">
                 Practice tailored interview scenarios. Select your industry and preferred language to get started.
               </p>
             </div>
             
             <form onSubmit={handleStartInterview} className="w-full max-w-sm space-y-6 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
               <div className="text-left space-y-2">
                 <label htmlFor="language" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                   <Globe className="w-4 h-4 text-indigo-400" />
                   Interview Language
                 </label>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage('Malayalam')}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        language === 'Malayalam' 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Malayalam
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('English')}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        language === 'English' 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      English
                    </button>
                 </div>
               </div>

               <div className="text-left space-y-2">
                 <label htmlFor="industry" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                   <Briefcase className="w-4 h-4 text-indigo-400" />
                   Target Industry / Job Role
                 </label>
                 <input
                   type="text"
                   id="industry"
                   required
                   placeholder="e.g. IT, Marketing, Accountant"
                   value={industry}
                   onChange={(e) => setIndustry(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                 />
               </div>

               <button
                 type="submit"
                 disabled={isLoading || !industry.trim()}
                 className="w-full group relative inline-flex items-center justify-center px-8 py-3.5 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-500 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 mt-2"
               >
                 {isLoading ? (
                   <Loader2 className="w-6 h-6 animate-spin mr-2" />
                 ) : (
                   <Send className="w-5 h-5 mr-2" />
                 )}
                 {isLoading ? "Preparing..." : "Start Interview"}
               </button>
             </form>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 space-y-6 pb-32">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    msg.role === 'model' 
                      ? 'bg-indigo-600/20 border border-indigo-500/30' 
                      : 'bg-slate-700 border border-slate-600'
                  }`}>
                    {msg.role === 'model' ? <Bot className="w-6 h-6 text-indigo-400" /> : <User className="w-6 h-6 text-slate-300" />}
                  </div>
                  
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm text-lg leading-relaxed ${
                      msg.role === 'model' 
                        ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none malayalam-text' 
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10'
                    }`}>
                      {msg.text}
                    </div>

                    {msg.role === 'model' && msg.feedback && (
                      <div className="w-full mt-2">
                        <FeedbackCard feedback={msg.feedback} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                    <Bot className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                     <span className="text-slate-400 text-sm">Reviewing your answer...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 p-4 shadow-2xl backdrop-blur-md">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                   <div className="flex-1">
                     <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Type your answer in ${language}...`}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-[60px] max-h-[120px]"
                        disabled={isProcessing}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                     />
                   </div>
                   <button
                     type="submit"
                     disabled={!inputText.trim() || isProcessing}
                     className="h-[60px] px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/20"
                   >
                     {isProcessing ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                       <Send className="w-6 h-6" />
                     )}
                   </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;