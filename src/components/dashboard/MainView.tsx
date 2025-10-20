import { Pencil, Plus, X, MessageSquare } from "lucide-react"; // Added MessageSquare icon
import { Button } from ".././ui/button";
import { Card } from ".././ui/card";
import type { Prompt } from "../DashboardPage";
import type { Version } from "../DashboardPage"; // Import Version type
import { useState, useEffect } from 'react'; // Import useState

interface MainPreviewProps {
  prompt: Prompt;
  selectedVersion: Version | null;
  onEditClick: () => void;
  onPromptRestore: (promptId: string) => void;
}

// Component to display a single prompt's details (can be reused for preview)
const PromptDetailView = ({ prompt, selectedVersion, onEditClick, onPromptRestore }: MainPreviewProps) => {
  // Determine which data to display
  const displayTitle = selectedVersion ? selectedVersion.title : prompt.title || "Untitled";
  const displayDescription = selectedVersion ? selectedVersion.description : prompt.description || "No description.";
  const displayTags = (selectedVersion ? selectedVersion.tags : prompt.tags) || [];

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div><h2 className="text-lg font-semibold text-emerald-900 mb-2">Prompt Preview</h2><p className="text-sm text-emerald-700/70">Review the details of your prompt.</p></div>
        {prompt.isDeleted ? (
          <Button onClick={() => onPromptRestore(prompt.id)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 group">
            <Pencil className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Restore Prompt
          </Button>
        ) : (
          <Button onClick={onEditClick} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group">
            <Pencil className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Revert Prompt
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <div><label className="block text-sm font-semibold text-emerald-900 mb-2">Title</label><p className="text-xl font-bold text-emerald-800">{displayTitle}</p></div>
        <div><label className="block text-sm font-semibold text-emerald-900 mb-2">Tags</label><div className="flex flex-wrap gap-2">{displayTags.map((tag) => (<span key={tag} className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{tag}</span>))}</div></div>
        <div><label className="block text-sm font-semibold text-emerald-900 mb-2">Description</label><p className="text-emerald-700/90 whitespace-pre-wrap bg-emerald-50/50 p-4 rounded-lg border border-emerald-200/50">{displayDescription}</p></div>
      </div>
    </Card>
  );
};

// Define a more comprehensive Prompt type that includes versions for imported data
// This assumes the imported JSON structure will provide 'versions'
interface ImportedPrompt extends Prompt {
  versions?: Version[]; // Make versions optional as not all prompts might have them, or they might be structured differently
}

// Main component for the view, now handling import preview
interface MainViewProps {
  prompt: Prompt | null; // Currently selected prompt for editing/viewing
  selectedVersion: Version | null; // Selected version of the prompt
  onEditClick: () => void; // Handler to switch to edit mode
  onPromptRestore: (promptId: string) => void; // Handler to restore a prompt
  importedPrompts: ImportedPrompt[] | null; // Prompts imported from JSON, now using ImportedPrompt type
  onSaveImportedPrompts: () => void; // Handler to save imported prompts
  onCancelImport: () => void; // Handler to cancel import
}

export const MainView = ({
  prompt,
  selectedVersion,
  onEditClick,
  onPromptRestore,
  importedPrompts,
  onSaveImportedPrompts,
  onCancelImport
}: MainViewProps) => {

  // State to manage which imported prompt is currently selected for detailed preview
  const [selectedImportedPrompt, setSelectedImportedPrompt] = useState<ImportedPrompt | null>(null);

  // Effect to set the first imported prompt as selected if none is selected and prompts are available
  useEffect(() => {
    if (importedPrompts && importedPrompts.length > 0 && !selectedImportedPrompt) {
      setSelectedImportedPrompt(importedPrompts[0]);
    } else if (importedPrompts && importedPrompts.length === 0) {
      setSelectedImportedPrompt(null); // Clear selection if list becomes empty
    }
  }, [importedPrompts, selectedImportedPrompt]);


  // If there are imported prompts, show the import preview UI
  if (importedPrompts && importedPrompts.length > 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h2 className="text-2xl font-bold text-emerald-900">Imported Prompts Preview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: List of imported prompts */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl border border-emerald-200/50 shadow-xl rounded-lg p-4">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Prompts to Import</h3>
            <div className="space-y-3 overflow-y-auto max-h-[60vh]"> {/* Scrollable list */}
              {importedPrompts.map((p, index) => (
                <Card
                  key={p.id || `imported-${index}`} // Fallback key using index
                  className={`p-3 rounded-lg cursor-pointer transition-all ${selectedImportedPrompt?.id === p.id ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300" : "bg-white/60 hover:bg-white/80 border border-transparent"}`}
                  onClick={() => setSelectedImportedPrompt(p)}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-500" /> {/* MessageSquare icon */}
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-emerald-900 truncate">{p.title || "Untitled Prompt"}</p>
                      {/* Safely access versions and their first version's title */}
                      <p className="text-xs text-emerald-600/70">Version: {p.versions && p.versions.length > 0 ? p.versions[0].title : 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right side: Detailed preview of the selected imported prompt */}
          <div className="lg:col-span-2">
            {selectedImportedPrompt ? (
              <PromptDetailView
                prompt={selectedImportedPrompt}
                // Safely access the first version for display, or null if none exists
                selectedVersion={selectedImportedPrompt.versions && selectedImportedPrompt.versions.length > 0 ? selectedImportedPrompt.versions[0] : null}
                onEditClick={() => { /* Handle edit for imported prompt if needed */ }}
                onPromptRestore={() => { /* Handle restore for imported prompt if needed */ }}
              />
            ) : (
              <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6 h-full flex items-center justify-center">
                <p className="text-lg text-emerald-700/70">Select a prompt from the list to preview.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons for Import */}
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={onCancelImport} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSaveImportedPrompts} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group">
            <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Save to DB
          </Button>
        </div>
      </div>
    );
  }

  // If no imported prompts, render the existing prompt preview/edit view
  return (
    <div className="flex flex-col gap-6 p-6">
      {prompt ? (
        <PromptDetailView
          prompt={prompt}
          selectedVersion={selectedVersion}
          onEditClick={onEditClick}
          onPromptRestore={onPromptRestore}
        />
      ) : (
        <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6 flex items-center justify-center h-full">
          <p className="text-lg text-emerald-700/70">Select a prompt from the sidebar or create a new one.</p>
        </Card>
      )}
    </div>
  );
};
