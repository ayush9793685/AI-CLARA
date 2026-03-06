import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function JsonViewer({ data, className }: { data: unknown; className?: string }) {
  const [copied, setCopied] = useState(false);
  
  const jsonString = JSON.stringify(data, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]", className)}>
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur transition-all"
          title="Copy JSON"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 sm:p-5 text-sm leading-relaxed text-blue-300 custom-scrollbar overflow-x-auto">
        <code dangerouslySetInnerHTML={{
          __html: jsonString
            .replace(/"(.*?)":/g, '<span class="text-blue-400">"$1"</span>:') // keys
            .replace(/: "(.*?)"/g, ': <span class="text-green-400">"$1"</span>') // string values
            .replace(/: ([0-9]+)/g, ': <span class="text-orange-400">$1</span>') // numbers
            .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>') // booleans
            .replace(/: (null)/g, ': <span class="text-red-400">$1</span>') // null
        }} />
      </pre>
    </div>
  );
}
