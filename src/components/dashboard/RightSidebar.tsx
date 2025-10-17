
import { motion } from "framer-motion";
import { Plus, Clock, GitBranch, Trash2 } from "lucide-react"; // Import Trash2 for delete icon
import { Button } from ".././ui/button";
import type { Prompt, Version } from "../DashboardPage";

interface RightSidebarProps {
  versions: Version[];
  selectedPrompt: Prompt | null;
  selectedVersion: Version | null;
  onVersionSelect: (version: Version) => void;
  onArchivePrompt: (promptId: string) => void; // New prop to handle archiving
}

export const RightSidebar = ({ versions, selectedPrompt, selectedVersion, onVersionSelect, onArchivePrompt }: RightSidebarProps) => {
  return (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="relative w-80 bg-white/80 backdrop-blur-xl border-l border-emerald-200/50 shadow-xl z-20 flex flex-col"
    >
      <div className="p-4 border-b border-emerald-200/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-emerald-900 mb-1">Versions</h2>
          <p className="text-xs text-emerald-700/70">{selectedPrompt ? "Manage prompt versions" : "Select a prompt to view versions"}</p>
        </div>
        {selectedPrompt && (
          <Trash2 
            className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700 transition-colors" 
            onClick={() => onArchivePrompt(selectedPrompt.id)} 
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {selectedPrompt ? (
          versions.map((version) => (<motion.div key={version.id} whileHover={{ scale: 1.02, x: -4 }} whileTap={{ scale: 0.98 }} onClick={() => onVersionSelect(version)} className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${selectedVersion?.id === version.id ? "bg-gradient-to-l from-emerald-500/10 to-teal-500/10 border border-emerald-300" : "bg-white/60 hover:bg-white/80 border border-transparent"}`}><div className="flex items-start justify-between mb-2"><div className="flex items-center gap-2"><GitBranch className="w-4 h-4 text-emerald-600" /><span className="font-semibold text-emerald-900">{version.version}</span></div><span className={`text-xs px-2 py-0.5 rounded-full ${version.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>{version.status}</span></div><div className="flex items-center gap-1 text-xs text-emerald-600/70"><Clock className="w-3 h-3" />{version.timestamp}</div></motion.div>))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6"><GitBranch className="w-12 h-12 text-emerald-300 mb-3" /><p className="text-sm text-emerald-700/70">Select a prompt to view its versions</p></div>
        )}
      </div>
      {selectedPrompt && (<div className="p-4 border-t border-emerald-200/50"><Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"><Plus className="w-4 h-4 mr-2" />Create New Version</Button></div>)}
    </motion.aside>
  );
};
