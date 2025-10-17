import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {  MessageSquare, LogOut, } from "lucide-react";
import { Button } from "../components/ui/button";
import { logout } from "../utils/auth";
import { LeftSidebar } from "./dashboard/LeftSidebar";
import { MainEdit } from "./dashboard/MainEdit";
import { MainPreview } from "./dashboard/MainView";
import { RightSidebar } from "./dashboard/RightSidebar";
import axios from "axios";
import { toast } from "sonner";

export interface Prompt {
  id: string;
  _id?: string; // This seems redundant with id, but keeping for now as it might be used elsewhere
  title: string;
  description: string;
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
}
export interface Version {
    id: string; // This is _id from the backend
    version: string; // versionNumber
    title: string;
    tags: string[];
    description: string;
    timestamp: string; // createdAt
    status: string; // afterObject?.status
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[] | []>([]);
  const [versions, setVersions] = useState<Version[] | []>([]);
  
  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const confirmLogout = () => { logout(); navigate("/login"); };
  const handleNewPrompt = () => { setSelectedPrompt(null); setIsEditing(true); };
  const handleCancelEdit = () => setIsEditing(false);
  
  const handlePromptSelect = (prompt: Prompt) => { 
    console.log("Clicked on the prompt", prompt);
    // When a prompt is selected, we want to display its latest version's details in MainPreview.
    // The initial prompt object from fetchPrompts might not have the full details (description, tags).
    // So, we fetch all versions and then update selectedPrompt with the latest version's data.
    
    // Temporarily set selectedPrompt to the basic info to show something while fetching versions
    setSelectedPrompt({
      id: prompt.id,
      title: prompt.title, // Use title from the clicked prompt
      description: "Loading description...", // Placeholder
      tags: [], // Placeholder
      isDeleted: prompt.isDeleted,
      createdAt: prompt.createdAt,
    });
    setIsEditing(false);

    fetchPromptAllVersion(prompt.id);
  };

  const fetchPrompts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prompts`, {
        withCredentials: true, 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("res in fetchPrompts = ", res);

      // Initial fetch only gets basic prompt info (id, title, isDeleted, createdAt)
      const formattedPrompts = res.data.data.map((p: Prompt) => ({
        id: p._id,
        title: p.title,
        isDeleted: p.isDeleted,
        createdAt: p.createdAt,
        // description and tags are intentionally left out here as they are fetched per prompt later
      }));

      setPrompts(formattedPrompts || []);
    } catch (error: unknown) {
      console.error("Error fetching prompts:", error);
      toast.error("Prompts cant be loaded, Please retry after sometime");
    }
  }

  const fetchPromptAllVersion = async (promptId: string) => {
    try{
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prompts/${promptId}/versions`, {
        withCredentials: true, 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        const versionsData = res.data.data.versions.map((v: any) => ({
          id: v._id,
          version: v.versionNumber?.toString() || "1",
          title: v.afterObject?.title || "Untitled",
          tags: v.afterObject?.tags || [],
          description: v.afterObject?.description || "",
          timestamp: v.createdAt,
          status: v.afterObject?.status || "active",
        }));

        setVersions(versionsData);

        // Find the latest version
        if (versionsData.length > 0) {
          // Sort versions by versionNumber in descending order to find the latest
          versionsData.sort((a: Version, b: Version) => parseInt(b.version) - parseInt(a.version));
          const latestVersion = versionsData[0];

          // Update selectedPrompt with the latest version's details
          setSelectedPrompt((prevSelectedPrompt) => {
            if (!prevSelectedPrompt) return null; // Should not happen if called from handlePromptSelect
            return {
              ...prevSelectedPrompt, // Keep existing id, isDeleted, createdAt
              title: latestVersion.title,
              description: latestVersion.description,
              tags: latestVersion.tags,
            };
          });
        } else {
          // If no versions are found, use the basic prompt info
          setSelectedPrompt((prevSelectedPrompt) => {
            if (!prevSelectedPrompt) return null;
            return {
              ...prevSelectedPrompt,
              title: prevSelectedPrompt.title, // Keep title from initial selection
              description: "No description available.",
              tags: [],
            };
          });
        }
      } else {
        toast.error(res.data.message || "Failed to fetch prompt versions.");
        // If fetching versions fails, keep the basic prompt info
        setSelectedPrompt((prevSelectedPrompt) => {
          if (!prevSelectedPrompt) return null;
          return {
            ...prevSelectedPrompt,
            description: "Error loading description.",
            tags: [],
          };
        });
      }
    }
    catch(error: unknown){
      console.error("Error fetching prompts:", error);
      toast.error("Version of Prompt cant be fetched, Please retry after sometime");
      // If fetching versions fails, keep the basic prompt info
      setSelectedPrompt((prevSelectedPrompt) => {
        if (!prevSelectedPrompt) return null;
        return {
          ...prevSelectedPrompt,
          description: "Error loading description.",
          tags: [],
        };
      });
    }
  }

  // Function to re-fetch versions after an update
  const refreshVersions = (promptId: string) => {
    fetchPromptAllVersion(promptId);
  };

  useEffect(() => {
    fetchPrompts();
  },[])

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><LogOut className="w-6 h-6 text-red-600" /></div>
                <div><h2 className="text-xl font-bold text-gray-800">Confirm Logout</h2><p className="text-sm text-gray-500 mt-1">Are you sure you want to log out?</p></div>
              </div>
              <div className="flex justify-end gap-3 mt-8"><Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button><Button className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg" onClick={confirmLogout}>Logout</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full mix-blend-multiply filter blur-3xl" animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}/>
        <motion.div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full mix-blend-multiply filter blur-3xl" animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}/>
      </div>

      <LeftSidebar prompts={prompts} selectedPrompt={selectedPrompt} onPromptSelect={handlePromptSelect} onNewPrompt={handleNewPrompt} onLogoutClick={handleLogoutClick} />

      <div className="flex-1 flex flex-col relative z-10">
        <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-emerald-900">{isEditing ? (selectedPrompt ? `Editing: ${selectedPrompt.title}` : "Create New Prompt") : (selectedPrompt ? selectedPrompt.title : "Dashboard")}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {isEditing ? (
              <MainEdit prompt={selectedPrompt} setPrompts={setPrompts} onCancel={handleCancelEdit} setIsEditing={setIsEditing} setSelectedPrompt={setSelectedPrompt} refreshVersions={refreshVersions}/>
            ) : selectedPrompt ? (
              <MainPreview prompt={selectedPrompt} selectedVersion={selectedVersion} onEditClick={() => setIsEditing(true)} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 mt-16">
                <MessageSquare className="w-16 h-16 text-emerald-300 mb-4" />
                <h2 className="text-xl font-semibold text-emerald-900 mb-2">Welcome to PromptVault</h2>
                <p className="text-emerald-700/70 max-w-sm">Select a prompt to view its details, or create a new one.</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <RightSidebar versions={versions} selectedPrompt={selectedPrompt} selectedVersion={selectedVersion} onVersionSelect={setSelectedVersion} />
    </div>
  );
};

export default DashboardPage;
