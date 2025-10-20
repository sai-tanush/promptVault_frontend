import { motion } from "framer-motion";
import {
  Plus, MessageSquare, Search, LogOut,
  Sparkles, User, Settings, Trash, Archive, Download, FileJson // Import FileJson for import icon
} from "lucide-react";
import { Button } from ".././ui/button";
import { Input } from ".././ui/input";
import type { Prompt } from "../DashboardPage";
import { useState, useEffect, useRef } from 'react'; // Import useRef
import axios from 'axios'; // Assuming axios is available
import { toast } from "sonner"; // Import toast

interface LeftSidebarProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  onPromptSelect: (prompt: Prompt) => void;
  onNewPrompt: () => void;
  onLogoutClick: () => void;
  onArchivePrompt: (promptId: string) => void;
  onPromptRestore: (promptId: string) => void; // Add prop for restoring
  username: string;
  email: string;
  searchTerm: string; // Added for search functionality
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Added for search input handler
  onImportPrompts: (importedData: Prompt[]) => void; // New prop to pass imported data up
}

// Define the type for archived prompts if it differs, otherwise use Prompt
type ArchivedPrompt = Prompt;

interface BackendPrompt {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  isDeleted: boolean;
  createdAt: string;
  username: string;
  email: string;
}

// Define a type for the version object within the imported JSON
interface ImportedVersion {
  title: string;
  tage?: string[]; // The incorrect key
  tags?: string[]; // The correct key
  description: string;
}

export const LeftSidebar = ({ prompts, selectedPrompt, onPromptSelect, onNewPrompt, onLogoutClick, onArchivePrompt, onPromptRestore, username, email, searchTerm, onSearchChange, onImportPrompts }: LeftSidebarProps) => {

  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [archivedPrompts, setArchivedPrompts] = useState<ArchivedPrompt[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

      // Function to fetch archived prompts
      const fetchArchievedPrompts = async () => {
        setIsLoadingArchived(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Authentication token not found.");
            toast.error("Authentication token not found.");
            return;
          }

          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/prompts`, {
            params: { isDeleted: true },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          if (response.data.success) {
            const formattedPrompts = response.data.data.map((p: BackendPrompt) => ({
              id: p._id,
              title: p.title,
              description: p.description || "",
              tags: p.tags || [],
              isDeleted: p.isDeleted,
              createdAt: p.createdAt,
            })).sort((a: BackendPrompt, b: BackendPrompt) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setArchivedPrompts(formattedPrompts);
          } else {
            console.error("Failed to fetch archived prompts:", response.data.message);
            toast.error(response.data.message || "Failed to fetch archived prompts.");
          }
        } catch (error) {
          console.error("Error fetching archived prompts:", error);
          toast.error("An error occurred while fetching archived prompts.");
        } finally {
          setIsLoadingArchived(false);
        }
      };

      // Function to restore a prompt
      const restorePrompt = async (promptId: string) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Authentication token not found.");
            toast.error("Authentication token not found.");
            return;
          }

          // Make PATCH request to restore prompt
          const response = await axios.patch(
            `${import.meta.env.VITE_BACKEND_URL}/prompts/${promptId}/restore`,
            {}, // no body required, backend decides based on route
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            // Remove restored prompt from archived list
            setArchivedPrompts((prev) => prev.filter((p) => p.id !== promptId));

            // Notify parent component (to refetch or update active list)
            onPromptRestore(promptId);

            console.log(`✅ Prompt ${promptId} restored successfully.`, response.data);
            toast.success("Prompt restored successfully!");
          } else {
            console.error("❌ Failed to restore prompt:", response.data.message);
            toast.error(response.data.message || "Failed to restore prompt");
          }
        } catch (error) {
          console.error(`❌ Error restoring prompt ${promptId}:`, error);
          toast.error("Failed to restore prompt. Please try again later.");
        }
      };

      // Function to handle exporting prompts
      const handleExportPrompts = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Authentication token not found.");
            toast.error("Authentication token not found.");
            return;
          }

          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/data/export`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          if (response.data.success) {
            const jsonData = response.data.data; // Assuming the prompts data is in response.data.data
            const jsonString = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "prompts.json"; // Default filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("Prompts exported successfully.");
            toast.success("Prompts exported successfully!");
          } else {
            console.error("Failed to export prompts:", response.data.message);
            toast.error(response.data.message || "Failed to export prompts.");
          }
        } catch (error) {
          console.error("Error exporting prompts:", error);
          toast.error("An error occurred while exporting prompts.");
        }
      };

      // Function to handle importing prompts
      const handleImportPrompts = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            let jsonData = JSON.parse(e.target?.result as string);
            // Data cleaning: rename 'tage' to 'tags'
            if (Array.isArray(jsonData)) {
              jsonData = jsonData.map(prompt => ({
                ...prompt,
                versions: prompt.versions?.map((version: ImportedVersion) => ({
                  ...version,
                  tags: version.tage || version.tags || [], // Use 'tage', fallback to 'tags', then to empty array
                  tage: undefined, // Remove the incorrect key
                })) || [],
              }));
            }
            
            onImportPrompts(jsonData);
            toast.success("JSON file loaded. Previewing prompts...");
            event.target.value = '';
          } catch (error) {
            console.error("Error parsing JSON file:", error);
            toast.error("Invalid JSON file. Please check the file format.");
            event.target.value = '';
          }
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast.error("Error reading file. Please try again.");
          event.target.value = '';
        };
        reader.readAsText(file);
      };

      // Effect to fetch archived prompts when the component mounts and viewMode changes to 'archived'
      useEffect(() => {
        if (viewMode === 'archived') {
          fetchArchievedPrompts();
        }
      }, [viewMode]); // Re-run effect if viewMode changes

      const handleViewToggle = (mode: 'active' | 'archived') => {
        setViewMode(mode);
        if (mode === 'archived' && archivedPrompts.length === 0) {
          // Fetch only if we are switching to archived view and haven't fetched yet
          fetchArchievedPrompts();
        }
      };

      const promptsToDisplay = viewMode === 'active' ? prompts : archivedPrompts;
      const selectedPromptInView = selectedPrompt;

      console.log("selectedPrompt = ", selectedPrompt); // Keep existing log

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
            <div className="flex flex-col gap-2"> {/* Changed to flex-col to stack buttons */}
              <Button onClick={onNewPrompt} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"><Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />New Prompt</Button>
              {/* Export Prompts Button */}
              <Button onClick={handleExportPrompts} variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 group">
                <Download className="w-4 h-4 mr-2 text-emerald-500 group-hover:text-emerald-700" />
                Export Prompts
              </Button>
              {/* Import JSON Button */}
              <Button
                onClick={() => fileInputRef.current?.click()} // Trigger hidden file input
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 group"
              >
                <FileJson className="w-4 h-4 mr-2 text-emerald-500 group-hover:text-emerald-700" />
                Import JSON
              </Button>
              {/* Hidden file input */}
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportPrompts}
                className="hidden"
              />
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <Input
                placeholder="Search prompts..."
                className="pl-9 bg-white/90 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={searchTerm} // Bind to searchTerm state
                onChange={onSearchChange} // Use the passed handler
              />
            </div>
          </div>

          {/* Navigation for Active/Archived Prompts */}
          <div className="p-2 border-b border-emerald-200/50">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                className={`flex-1 justify-start text-sm font-medium ${viewMode === 'active' ? 'text-emerald-600 bg-emerald-100/50 hover:bg-emerald-100/70' : 'text-emerald-700 hover:bg-emerald-50'}`}
                onClick={() => handleViewToggle('active')}
              >
                <MessageSquare className={`w-4 h-4 mr-2 ${viewMode === 'active' ? 'text-emerald-600' : 'text-emerald-500'}`} />
                Active
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 justify-start text-sm font-medium ${viewMode === 'archived' ? 'text-red-600 bg-red-100/50 hover:bg-red-100/70' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleViewToggle('archived')}
              >
                <Archive className={`w-4 h-4 mr-2 ${viewMode === 'archived' ? 'text-red-600' : 'text-gray-500'}`} />
                Archived
              </Button>
        </div>
      </div>

      {/* Prompts List */}
      <motion.div // Wrap the list container with motion.div for animation
        key={viewMode} // Keying by viewMode will force re-animation on toggle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }} // Slight delay to sync with sidebar animation
        className="flex-1 overflow-y-auto p-2"
      >
        {isLoadingArchived && viewMode === 'archived' ? (
          <div className="p-3 text-center text-emerald-500">Loading archived prompts...</div>
        ) : promptsToDisplay.length === 0 ? (
          <div className="p-3 text-center text-emerald-500/70">
            {viewMode === 'active' ? "No prompts yet. Create one!" : "No archived prompts."}
          </div>
        ) : (
          promptsToDisplay.map((prompt) => (
            <motion.div
              key={prompt.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${selectedPromptInView?.id === prompt.id ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300" : "bg-white/60 hover:bg-white/80 border border-transparent"}`}
            >
              <div className="flex items-center gap-3 flex-grow min-w-0" onClick={() => onPromptSelect(prompt)}>
                <MessageSquare className={`w-5 h-5 mt-0.5 ${selectedPromptInView?.id === prompt.id ? "text-emerald-600" : "text-emerald-500"}`} />
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
              {/* Action Icon (Trash for active, Restore for archived) */}
              {viewMode === 'active' ? (
                <Trash
                  className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700 ml-2 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchivePrompt(prompt.id);
                    // TODO: After archiving, remove from active list and potentially refresh archived list if needed.
                    // This logic might be handled by the parent component.
                  }}
                />
              ) : (
                // Restore Icon and Handler
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-emerald-400 hover:text-emerald-500" // Changed color to pale green
                  onClick={(e) => {
                    e.stopPropagation();
                    restorePrompt(prompt.id); // Call the new restore function
                  }}
                >
                  {/* Restore Icon (e.g., upward arrow) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10l4-4m-4 4-4-4M4 12v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-10"></path></svg>
                </Button>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

          {/* User Profile */}
          <div className="p-4 border-t border-emerald-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div> {/* Corrected User icon */}
              <div className="flex-1"><p className="text-sm font-semibold text-emerald-900">{username}</p><p className="text-xs text-emerald-600/70">{email}</p></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"><Settings className="w-4 h-4 mr-1" />Settings</Button> {/* Corrected Settings icon */}
              <Button variant="outline" size="sm" onClick={onLogoutClick} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </motion.aside>
      );
    };
