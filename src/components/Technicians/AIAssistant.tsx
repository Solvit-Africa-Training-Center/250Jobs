import { useEffect, useRef, useState } from "react";
import { LuTv, LuSend } from "react-icons/lu";
import { MdLightbulbOutline, MdOutlineWorkOutline } from "react-icons/md";
import { CiFilter, CiStar, CiSearch } from "react-icons/ci";
import { listJobs } from "../../api/jobs";
import type { Job } from "../../types/job";

type Msg = { id: string; role: "assistant" | "user"; text: string; at: string };

function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{
    id: "m1",
    role: "assistant",
    text: "Hi there! I’m your AI job assistant. Tell me what you’re looking for (skills, location, pay, type) and I’ll help you discover matching roles.",
    at: new Date().toLocaleTimeString(),
  }]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const suggestions = [
    "Find electrical jobs in Kigali",
    "Show me high-paying HVAC positions",
    "I want full-time maintenance jobs",
    "Find jobs that match my skills",
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const genId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

  const send = async (text?: string) => {
    const val = (text ?? input).trim();
    if (!val) return;
    const now = new Date().toLocaleTimeString();
    setMessages((m) => [...m, { id: genId(), role: "user", text: val, at: now }]);
    setInput("");
    setTyping(true);
    try {
      // Try a direct search against jobs endpoint using the user's text
      const res = await listJobs({ search: val, page_size: 5 });
      const items: Job[] = (res?.results || []) as Job[];
      let reply: string;
      if (items.length > 0) {
        const top = items.slice(0, 5);
        const lines = top.map((j, i) => `${i + 1}. ${j.title} — ${j.location} • ${j.currency} ${j.budget}`);
        reply = `I found ${res.count ?? items.length} matching jobs. Here are a few:\n\n${lines.join("\n")}\n\nAsk me to refine by location, budget, or type.`;
      } else {
        reply = `I couldn't find jobs for "${val}" right now. Try being more specific, or include a location or category.`;
      }
      setMessages((m) => [...m, { id: genId(), role: "assistant", text: reply, at: new Date().toLocaleTimeString() }]);
    } catch (e: any) {
      const reply = `Here are some tips while I search:\n• Use specific skills (e.g., Electrician, HVAC)\n• Add a city or region\n• Mention pay or job type\n\n(I couldn't reach the search service right now.)`;
      setMessages((m) => [...m, { id: genId(), role: "assistant", text: reply, at: new Date().toLocaleTimeString() }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 md:px-8 pb-24 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 mb-6 shadow-md">
          <div className="flex items-center gap-3">
            <LuTv className="text-3xl" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">AI Assistant</h2>
              <p className="opacity-90 text-sm md:text-base">Discover job opportunities tailored to your skills and preferences</p>
            </div>
          </div>
        </div>

        {/* Chat and sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat panel */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'items-start' : 'items-end justify-end'}`}>
                  {msg.role === 'assistant' && (
                    <div className="mr-2 shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">AI</div>
                  )}
                  <div className={`${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'} px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-line leading-relaxed shadow-sm`}>
                    {msg.text}
                    <div className={`text-[10px] mt-2 ${msg.role === 'assistant' ? 'text-gray-500' : 'text-blue-100'}`}>{msg.at}</div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="ml-2 shrink-0 w-8 h-8 rounded-full bg-[#2984df] text-white flex items-center justify-center">U</div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">AI</div>
                  <div className="bg-gray-100 rounded-full px-4 py-2">
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-gray-200 p-3 md:p-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                  placeholder="Ask anything… e.g. ‘Show me electrical jobs in Kigali with good pay’"
                  className="flex-1 bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <button
                  onClick={() => send()}
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white transition flex items-center justify-center"
                  aria-label="Send"
                >
                  <LuSend />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions/sidebar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <MdLightbulbOutline className="text-yellow-500 text-lg" />
              </div>
              <h3 className="text-gray-800 text-sm font-semibold">Quick suggestions</h3>
            </div>
            <div className="space-y-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => send(s)}
                  className="w-full text-left flex items-center gap-2 border border-gray-300 font-semibold px-3 py-2 rounded-md hover:bg-blue-50 transition"
                >
                  <CiStar className="text-gray-500" /> {s}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-full text-gray-700"><CiSearch /> Natural search</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-full text-gray-700"><CiFilter /> Smart filter</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-full text-gray-700"><CiStar /> AI picks</span>
            </div>
          </div>
        </div>

        {/* Popular searches */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
          <div className="flex gap-4 overflow-x-auto">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-start gap-3 border border-gray-300 rounded-md p-4 min-w-[250px] bg-white shadow-sm">
                <div className="bg-blue-50 p-2 rounded-full">
                  <MdOutlineWorkOutline className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">High-Paying Electrical Jobs</p>
                  <p className="text-gray-500 text-sm">Kigali area</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
