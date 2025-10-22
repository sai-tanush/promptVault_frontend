import { Pencil, Plus, X, MessageSquare } from "lucide-react";
import { Button } from ".././ui/button";
import { Card } from ".././ui/card";
import type { Prompt } from "../DashboardPage";
import type { Version } from "../DashboardPage";
import { useState, useEffect } from "react";

interface MainPreviewProps {
  prompt: Prompt;
  selectedVersion: Version | null;
  onEditClick: () => void;
  onPromptRestore: (promptId: string) => void;
  isImported?: boolean;
}

const PromptDetailView = ({
  prompt,
  selectedVersion,
  onEditClick,
  onPromptRestore,
  isImported,
}: MainPreviewProps) => {
  const displayTitle = selectedVersion
    ? selectedVersion.title
    : prompt.title || "Untitled";
  const displayDescription = selectedVersion
    ? selectedVersion.description
    : prompt.description || "No description.";
  const displayTags =
    (selectedVersion ? selectedVersion.tags : prompt.tags) || [];

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900 mb-2">
            Prompt Preview
          </h2>
          <p className="text-sm text-emerald-700/70">
            Review the details of your prompt.
          </p>
        </div>
        {prompt.isDeleted ? (
          <Button
            onClick={() => onPromptRestore(prompt.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 group"
          >
            <Pencil className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Restore Prompt
          </Button>
        ) : (
          <Button
            onClick={onEditClick}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"
            disabled={isImported}
          >
            <Pencil className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Revert Prompt
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-emerald-900 mb-2">
            Title
          </label>
          <p className="text-xl font-bold text-emerald-800">{displayTitle}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-emerald-900 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-emerald-900 mb-2">
            Description
          </label>
          <p className="text-emerald-700/90 whitespace-pre-wrap bg-emerald-50/50 p-4 rounded-lg border border-emerald-200/50">
            {displayDescription}
          </p>
        </div>
      </div>
    </Card>
  );
};
interface ImportedPrompt extends Prompt {
  versions?: Version[];
}
interface MainViewProps {
  prompt: Prompt | null;
  selectedVersion: Version | null;
  onEditClick: () => void;
  onPromptRestore: (promptId: string) => void;
  importedPrompts: ImportedPrompt[] | null;
  onSaveImportedPrompts: () => void;
  onCancelImport: () => void;
}

export const MainView = ({
  prompt,
  selectedVersion,
  onEditClick,
  onPromptRestore,
  importedPrompts,
  onSaveImportedPrompts,
  onCancelImport,
}: MainViewProps) => {
  const [selectedImportedPrompt, setSelectedImportedPrompt] =
    useState<ImportedPrompt | null>(null);
  const [selectedImportedVersion, setSelectedImportedVersion] =
    useState<Version | null>(null);

  useEffect(() => {
    if (
      importedPrompts &&
      importedPrompts.length > 0 &&
      !selectedImportedPrompt
    ) {
      const firstPrompt = importedPrompts[0];
      setSelectedImportedPrompt(firstPrompt);
      if (firstPrompt.versions && firstPrompt.versions.length > 0) {
        setSelectedImportedVersion(firstPrompt.versions[0]);
      }
    } else if (!importedPrompts || importedPrompts.length === 0) {
      setSelectedImportedPrompt(null);
      setSelectedImportedVersion(null);
    }
  }, [importedPrompts, selectedImportedPrompt]);

  // If there are imported prompts, show the import preview UI
  if (importedPrompts && importedPrompts.length > 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h2 className="text-2xl font-bold text-emerald-900">
          Imported Prompts Preview
        </h2>

        {/* Top section: List of imported prompts */}
        <div className="bg-white/80 backdrop-blur-xl border border-emerald-200/50 shadow-xl rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">
            Prompts to Import
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[40vh]">
            {" "}
            {/* Adjusted height */}
            {importedPrompts.map((p, index) => (
              <Card
                key={p.id || `imported-${index}`}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedImportedPrompt?.id === p.id
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300"
                    : "bg-white/60 hover:bg-white/80 border border-transparent"
                }`}
                onClick={() => setSelectedImportedPrompt(p)}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 truncate">
                      {p.title || "Untitled Prompt"}
                    </p>
                    <p className="text-xs text-emerald-600/70">
                      Versions: {p.versions?.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom section: Detailed preview and versions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {selectedImportedPrompt ? (
              <PromptDetailView
                prompt={selectedImportedPrompt}
                selectedVersion={selectedImportedVersion}
                onEditClick={() => {}}
                onPromptRestore={() => {}}
                isImported={true}
              />
            ) : (
              <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6 h-full flex items-center justify-center">
                <p className="text-lg text-emerald-700/70">
                  Select a prompt to preview its details.
                </p>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl border border-emerald-200/50 shadow-xl rounded-lg p-4">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">
              Versions
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[60vh]">
              {selectedImportedPrompt?.versions &&
              selectedImportedPrompt.versions.length > 0 ? (
                selectedImportedPrompt.versions.map((v, index) => (
                  <Card
                    key={v.id || `version-${index}`}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedImportedVersion?.id === v.id
                        ? "bg-emerald-100/50"
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                    onClick={() => setSelectedImportedVersion(v)}
                  >
                    <p className="text-sm font-semibold text-emerald-900">
                      {v.title}
                    </p>
                    <p className="text-xs text-emerald-600/70">
                      {new Date(v.timestamp).toLocaleString()}
                    </p>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-emerald-700/70">
                  No versions available for this prompt.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons for Import */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={onCancelImport}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onSaveImportedPrompts}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"
          >
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
          <p className="text-lg text-emerald-700/70">
            Select a prompt from the sidebar or create a new one.
          </p>
        </Card>
      )}
    </div>
  );
};
