import { motion } from "framer-motion";
import {
  Plus, MessageSquare, Search, LogOut,
  Sparkles, User, Settings, Trash, // Import Trash icon
} from "lucide-react";
import { Button } from ".././ui/button";
import { Input } from ".././ui/input";
import type { Prompt } from "../DashboardPage";

interface LeftSidebarProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  onPromptSelect: (prompt: Prompt) => void;
  onNewPrompt: () => void;
  onLogoutClick: () => void;
  onArchivePrompt: (promptId: string) => void; // Add prop for archiving
}

export const LeftSidebar = ({ prompts, selectedPrompt, onPromptSelect, onNewPrompt, onLogoutClick, onArchivePrompt }: LeftSidebarProps) => {

  console.log("selectedPrompt = ", selectedPrompt);
  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="relative w-80 bg-white/80 backdrop-blur-xl border-r border-emerald-200/50 shadow-xl z-20 flex flex-col"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-emerald-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-50"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          </div>
          <h2 className="text-lg font-bold text-emerald-900">PromptVault</h2>
        </div>
        <Button onClick={onNewPrompt} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"><Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />New Prompt</Button>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          <Input placeholder="Search prompts..." className="pl-9 bg-white/90 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
        </div>
      </div>
      {/* Prompts List */}
      <div className="flex-1 overflow-y-auto p-2">
        {prompts.map((prompt) => (
          <motion.div
            key={prompt.id}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 mb-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${selectedPrompt?.id === prompt.id ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300" : "bg-white/60 hover:bg-white/80 border border-transparent"}`}
          >
            <div className="flex items-center gap-3 flex-grow min-w-0" onClick={() => onPromptSelect(prompt)}> {/* Wrap content in a div for click handling */}
              <MessageSquare className={`w-5 h-5 mt-0.5 ${selectedPrompt?.id === prompt.id ? "text-emerald-600" : "text-emerald-500"}`} />
              <div className="flex gap-4 min-w-0 flex-grow"> {/* Allow title to grow */}
                <h3 className="text-sm font-semibold text-emerald-900 truncate">{prompt.title}</h3>
                <p className="text-xs text-emerald-600/70 mt-0.5 whitespace-nowrap"> {/* Prevent timestamp from wrapping */}
                  {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>
            </div>
            {/* Delete Icon */}
            <Trash
              className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700 ml-2 flex-shrink-0" // Added ml-2 for spacing and flex-shrink-0 to prevent shrinking
              onClick={(e) => {
                e.stopPropagation(); // Prevent prompt selection when clicking delete
                onArchivePrompt(prompt.id);
              }}
            />
          </motion.div>
        ))}
      </div>
      {/* User Profile */}
      <div className="p-4 border-t border-emerald-200/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
          <div className="flex-1"><p className="text-sm font-semibold text-emerald-900">John Doe</p><p className="text-xs text-emerald-600/70">john@example.com</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"><Settings className="w-4 h-4 mr-1" />Settings</Button>
          <Button variant="outline" size="sm" onClick={onLogoutClick} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"><LogOut className="w-4 h-4" /></Button>
        </div>
      </div>
    </motion.aside>
  );
};
