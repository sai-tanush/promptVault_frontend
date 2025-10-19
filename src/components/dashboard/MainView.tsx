import {  Pencil } from "lucide-react";
import { Button } from ".././ui/button";
import { Card } from ".././ui/card";
import type { Prompt } from "../DashboardPage";
import type { Version } from "../DashboardPage"; // Import Version type


interface MainPreviewProps {
  prompt: Prompt;
  selectedVersion: Version | null;
  onEditClick: () => void;
  onPromptRestore: (promptId: string) => void;
}

export const MainPreview = ({ prompt, selectedVersion, onEditClick, onPromptRestore }: MainPreviewProps) => {
  // Determine which data to display
  const displayTitle = selectedVersion ? selectedVersion.title : prompt.title;
  const displayDescription = selectedVersion ? selectedVersion.description : prompt.description;
  const displayTags = selectedVersion ? selectedVersion.tags : prompt.tags;

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
