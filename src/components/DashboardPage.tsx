import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  GitBranch, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  Sparkles,
  Send,
  User,
  Settings,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";

// Define the interface for a prompt object
interface Prompt {
  id: number;
  title: string;
  timestamp: string;
  versions: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [promptText, setPromptText] = useState("");

  // Mock data
  const prompts: Prompt[] = [
    { id: 1, title: "Product Description Generator", timestamp: "2 hours ago", versions: 5 },
    { id: 2, title: "Email Response Template", timestamp: "5 hours ago", versions: 3 },
    { id: 3, title: "Social Media Caption", timestamp: "1 day ago", versions: 7 },
    { id: 4, title: "Blog Post Outline", timestamp: "2 days ago", versions: 4 },
    { id: 5, title: "Marketing Copy", timestamp: "3 days ago", versions: 6 },
  ];

  // Define the interface for a version object
  interface Version {
    id: number;
    version: string;
    timestamp: string;
    status: string;
  }

  const versions = selectedPrompt ? [
    { id: 1, version: "v1.0", timestamp: "3 days ago", status: "active" },
    { id: 2, version: "v1.1", timestamp: "2 days ago", status: "draft" },
    { id: 3, version: "v1.2", timestamp: "1 day ago", status: "active" },
    { id: 4, version: "v2.0", timestamp: "5 hours ago", status: "active" },
  ] : [];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Left Sidebar - Prompts List */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-80 bg-white/80 backdrop-blur-xl border-r border-emerald-200/50 shadow-xl z-20 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-emerald-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h2 className="text-lg font-bold text-emerald-900">PromptVault</h2>
              </div>

              <Button
                onClick={() => setSelectedPrompt(null)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                New Prompt
              </Button>

              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <Input
                  placeholder="Search prompts..."
                  className="pl-9 bg-white/90 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Prompts List */}
            <div className="flex-1 overflow-y-auto p-2">
              {prompts.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                    selectedPrompt?.id === prompt.id
                      ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300"
                      : "bg-white/60 hover:bg-white/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className={`w-5 h-5 mt-0.5 ${
                      selectedPrompt?.id === prompt.id ? "text-emerald-600" : "text-emerald-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-emerald-900 truncate">
                        {prompt.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-emerald-600/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {prompt.timestamp}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {prompt.versions}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-emerald-200/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">John Doe</p>
                  <p className="text-xs text-emerald-600/70">john@example.com</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {!leftSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftSidebarOpen(true)}
                  className="text-emerald-700 hover:bg-emerald-50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              {leftSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftSidebarOpen(false)}
                  className="text-emerald-700 hover:bg-emerald-50"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-xl font-bold text-emerald-900">
                {selectedPrompt ? selectedPrompt.title : "Create New Prompt"}
              </h1>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="text-emerald-700 hover:bg-emerald-50"
            >
              {rightSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        {/* Center Content - Prompt Editor */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-emerald-900 mb-2">
                  Prompt Content
                </h2>
                <p className="text-sm text-emerald-700/70">
                  Enter your prompt below or select a version from the right sidebar to edit
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Write your prompt here... 

Example: Create a product description for a eco-friendly water bottle that highlights sustainability and modern design."
                  className="w-full h-96 p-4 bg-white/90 border-2 border-emerald-200 rounded-lg text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Test Prompt
                  </Button>
                </div>

                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group">
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Save Version
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="bg-white/60 backdrop-blur-xl border-emerald-200/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-900">{prompts.length}</p>
                    <p className="text-xs text-emerald-700/70">Total Prompts</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/60 backdrop-blur-xl border-emerald-200/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-900">25</p>
                    <p className="text-xs text-emerald-700/70">Total Versions</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/60 backdrop-blur-xl border-emerald-200/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-900">12</p>
                    <p className="text-xs text-emerald-700/70">Active Today</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar - Versions */}
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-80 bg-white/80 backdrop-blur-xl border-l border-emerald-200/50 shadow-xl z-20 flex flex-col"
          >
            <div className="p-4 border-b border-emerald-200/50">
              <h2 className="text-lg font-bold text-emerald-900 mb-1">Versions</h2>
              <p className="text-xs text-emerald-700/70">
                {selectedPrompt ? "Manage prompt versions" : "Select a prompt to view versions"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {selectedPrompt ? (
                versions.map((version) => (
                  <motion.div
                    key={version.id}
                    whileHover={{ scale: 1.02, x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVersion(version)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                      selectedVersion?.id === version.id
                        ? "bg-gradient-to-l from-emerald-500/10 to-teal-500/10 border border-emerald-300"
                        : "bg-white/60 hover:bg-white/80 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-900">{version.version}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        version.status === "active" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {version.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600/70">
                      <Clock className="w-3 h-3" />
                      {version.timestamp}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <GitBranch className="w-12 h-12 text-emerald-300 mb-3" />
                  <p className="text-sm text-emerald-700/70">
                    Select a prompt to view its versions
                  </p>
                </div>
              )}
            </div>

            {selectedPrompt && (
              <div className="p-4 border-t border-emerald-200/50">
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Version
                </Button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
