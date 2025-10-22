import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, LogOut, Trash } from "lucide-react";
import { Button } from "../components/ui/button";
import { logout } from "../utils/auth";
import { LeftSidebar } from "./dashboard/LeftSidebar";
import { MainEdit } from "./dashboard/MainEdit";
import { MainView } from "./dashboard/MainView";
import { RightSidebar } from "./dashboard/RightSidebar";
import axios from "axios";
import { toast } from "sonner";

export interface Prompt {
  id: string;
  _id?: string;
  title: string;
  description: string;
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
  versions?: Version[];
}
export interface Version {
  id: string;
  version: string;
  title: string;
  tags: string[];
  description: string;
  timestamp: string;
  status: string;
}

// Debounce utility function
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false); // State for archive confirmation modal
  const [promptIdToArchive, setPromptIdToArchive] = useState<string | null>(
    null
  ); // State to store the ID of the prompt to archive
  const [prompts, setPrompts] = useState<Prompt[] | []>([]);
  const [versions, setVersions] = useState<Version[] | []>([]);

  // State for user details
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // State for search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // State for imported prompts
  const [importedPrompts, setImportedPrompts] = useState<Prompt[] | null>(null); // State to hold prompts from JSON import

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const confirmLogout = () => {
    logout();
    navigate("/login");
  };
  const handleNewPrompt = () => {
    setSelectedPrompt(null);
    setIsEditing(true);
  };
  const handleCancelEdit = () => setIsEditing(false);

  // Handler to open the archive confirmation modal
  const handleArchivePromptClick = (promptId: string) => {
    setPromptIdToArchive(promptId);
    setIsArchiveModalOpen(true);
  };

  // Handler to perform the actual archive action after confirmation
  const confirmArchivePrompt = async () => {
    if (!promptIdToArchive) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      const response = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/prompts/${promptIdToArchive}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Prompt archived successfully!");
        setPrompts((prevPrompts) =>
          prevPrompts.filter((p) => p.id !== promptIdToArchive)
        );
        if (selectedPrompt && selectedPrompt.id === promptIdToArchive) {
          setSelectedPrompt(null);
          setSelectedVersion(null);
        }
        setIsArchiveModalOpen(false);
        setPromptIdToArchive(null);
      } else {
        toast.error(response.data.message || "Failed to archive prompt.");
        setIsArchiveModalOpen(false);
        setPromptIdToArchive(null);
      }
    } catch (error: unknown) {
      console.error("Error archiving prompt:", error);
      toast.error(
        "An error occurred while archiving the prompt. Please try again."
      );
      setIsArchiveModalOpen(false);
      setPromptIdToArchive(null);
    }
  };

  // Handler to cancel the archive action
  const cancelArchivePrompt = () => {
    setIsArchiveModalOpen(false);
    setPromptIdToArchive(null);
  };

  const handlePromptRestore = async (promptId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/prompts/${promptId}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Prompt restored successfully!");
        // Re-fetch the prompts
        fetchPrompts(searchTerm);
      } else {
        toast.error(response.data.message || "Failed to restore prompt.");
      }
    } catch (error: unknown) {
      console.error("Error restoring prompt:", error);
      toast.error(
        "An error occurred while restoring the prompt. Please try again."
      );
    }
  };

  const handlePromptSelect = (prompt: Prompt) => {
    console.log("Clicked on the prompt", prompt);
    setSelectedPrompt({
      id: prompt.id,
      title: prompt.title,
      description: "Loading description...",
      tags: [],
      isDeleted: prompt.isDeleted,
      createdAt: prompt.createdAt,
    });
    setIsEditing(false);

    fetchPromptAllVersion(prompt.id);
  };

  // fetchPrompts to accept searchQuery
  const fetchPrompts = useCallback(async (searchQuery: string = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/prompts`;
      const params: { search?: string; isDeleted?: boolean } = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await axios.get(apiUrl, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });
      console.log("res in fetchPrompts = ", res);

      const formattedPrompts = res.data.data
        .map((p: Prompt) => ({
          id: p._id,
          title: p.title,
          isDeleted: p.isDeleted,
          createdAt: p.createdAt,
        }))
        .sort(
          (a: Prompt, b: Prompt) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setPrompts(formattedPrompts || []);
    } catch (error: unknown) {
      console.error("Error fetching prompts:", error);
      toast.error("Prompts can't be loaded. Please retry after some time.");
    }
  }, []);

  useEffect(() => {
    const handler = debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500);
    handler(searchTerm);
    return () => {
      clearTimeout(handler as any);
    };
  }, [searchTerm]);

  // Effect to fetch prompts when debouncedSearchTerm changes
  useEffect(() => {
    fetchPrompts(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchPrompts]);

  const fetchPromptAllVersion = async (promptId: string) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/prompts/${promptId}/versions`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        const versionsData = res.data.data.versions.map(
          (v: {
            _id: string;
            versionNumber?: number;
            afterObject?: {
              title?: string;
              tags?: string[];
              description?: string;
              status?: string;
            };
            createdAt: string;
          }) => ({
            id: v._id,
            version: v.versionNumber?.toString() || "1",
            title: v.afterObject?.title || "Untitled",
            tags: v.afterObject?.tags || [],
            description: v.afterObject?.description || "",
            timestamp: v.createdAt,
            status: v.afterObject?.status || "active",
          })
        );

        setVersions(versionsData);

        // Find the latest version
        if (versionsData.length > 0) {
          versionsData.sort(
            (a: Version, b: Version) =>
              parseInt(b.version) - parseInt(a.version)
          );
          const latestVersion = versionsData[0];
          setSelectedVersion(latestVersion);

          // Update selectedPrompt with the latest version's details
          setSelectedPrompt((prevSelectedPrompt) => {
            if (!prevSelectedPrompt) return null;
            return {
              ...prevSelectedPrompt,
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
              title: prevSelectedPrompt.title,
              description: "No description available.",
              tags: [],
            };
          });
        }
      } else {
        toast.error(res.data.message || "Failed to fetch prompt versions.");
        setSelectedPrompt((prevSelectedPrompt) => {
          if (!prevSelectedPrompt) return null;
          return {
            ...prevSelectedPrompt,
            description: "Error loading description.",
            tags: [],
          };
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching prompts:", error);
      toast.error(
        "Version of Prompt cant be fetched, Please retry after sometime"
      );
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
  };

  // Function to re-fetch versions after an update
  const refreshVersions = (promptId: string) => {
    fetchPromptAllVersion(promptId);
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found.");
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("Response in fetchUserDetails = ", response.data);
      if (response.data.success) {
        setUsername(response.data.username);
        setEmail(response.data.email);
      } else {
        console.error("Failed to fetch user details:", response.data.message);
        toast.error(response.data.message || "Failed to load user details.");
      }
    } catch (error: unknown) {
      console.error("Error fetching user details:", error);
      toast.error(
        "An error occurred while fetching user details. Please try again."
      );
    }
  };

  // Handler for the search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handler for importing prompts from JSON
  const handleImportPrompts = (data: Prompt[]) => {
    console.log("Received data in handleImportPrompts:", data);
    setImportedPrompts(data);
  };

  // Handler to save imported prompts to the database
  const handleSaveImportedPrompts = async () => {
    if (!importedPrompts || importedPrompts.length === 0) {
      toast.error("No prompts to save.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      // Assuming the backend has an endpoint like /data/import that accepts an array of prompts
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/data/import`,
        { prompts: importedPrompts },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Prompts imported successfully!");
        setImportedPrompts(null);
        fetchPrompts(searchTerm);
        setSelectedPrompt(null);
        setSelectedVersion(null);
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Failed to import prompts.");
      }
    } catch (error: unknown) {
      console.error("Error saving imported prompts:", error);
      toast.error(
        "An error occurred while saving imported prompts. Please try again."
      );
    }
  };

  // Handler to cancel the import process
  const handleCancelImport = () => {
    setImportedPrompts(null);
    setSelectedPrompt(null);
    setSelectedVersion(null);
    setIsEditing(false);
    toast.info("Prompt import cancelled.");
  };

  // Fetch user details and initial prompts on initial render
  useEffect(() => {
    fetchUserDetails();
    fetchPrompts("");
  }, []);

  useEffect(() => {
    console.log(
      "Current importedPrompts state in DashboardPage:",
      importedPrompts
    );
  }, [importedPrompts]);

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLogoutModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Confirm Logout
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Are you sure you want to log out?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg"
                  onClick={confirmLogout}
                >
                  Logout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Archive Confirmation Modal */}
        {isArchiveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelArchivePrompt}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Confirm Archive
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Do you want to archive this prompt?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={cancelArchivePrompt}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg"
                  onClick={confirmArchivePrompt}
                >
                  Archive
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <LeftSidebar
        prompts={prompts}
        selectedPrompt={selectedPrompt}
        onPromptSelect={handlePromptSelect}
        onNewPrompt={handleNewPrompt}
        onLogoutClick={handleLogoutClick}
        onArchivePrompt={handleArchivePromptClick}
        onPromptRestore={handlePromptRestore}
        username={username}
        email={email}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onImportPrompts={handleImportPrompts}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-emerald-900">
              {isEditing
                ? selectedPrompt
                  ? `Editing: ${selectedPrompt.title}`
                  : "Create New Prompt"
                : selectedPrompt
                ? selectedPrompt.title
                : "Dashboard"}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {importedPrompts && importedPrompts.length > 0 ? (
              <MainView
                prompt={null}
                selectedVersion={null}
                onEditClick={() => setIsEditing(true)}
                onPromptRestore={handlePromptRestore}
                importedPrompts={importedPrompts}
                onSaveImportedPrompts={handleSaveImportedPrompts}
                onCancelImport={handleCancelImport}
              />
            ) : isEditing ? (
              <MainEdit
                prompt={selectedPrompt}
                setPrompts={setPrompts}
                onCancel={handleCancelEdit}
                setIsEditing={setIsEditing}
                setSelectedPrompt={setSelectedPrompt}
                refreshVersions={refreshVersions}
              />
            ) : selectedPrompt ? (
              <MainView
                prompt={selectedPrompt}
                selectedVersion={selectedVersion}
                onEditClick={() => setIsEditing(true)}
                onPromptRestore={handlePromptRestore}
                importedPrompts={null}
                onSaveImportedPrompts={() => {}}
                onCancelImport={() => {}}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 mt-16">
                <MessageSquare className="w-16 h-16 text-emerald-300 mb-4" />
                <h2 className="text-xl font-bold text-emerald-900 mb-2">
                  Welcome to PromptVault
                </h2>
                <p className="text-emerald-700/70 max-w-sm">
                  Select a prompt to view its details, or create a new one.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <RightSidebar
        versions={versions}
        selectedPrompt={selectedPrompt}
        selectedVersion={selectedVersion}
        onVersionSelect={setSelectedVersion}
        onArchivePrompt={handleArchivePromptClick}
      />
    </div>
  );
};

export default DashboardPage;
