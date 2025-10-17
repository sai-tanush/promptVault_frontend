import {  Pencil } from "lucide-react";
import { Button } from ".././ui/button";
import { Card } from ".././ui/card";
import type { Prompt } from "../DashboardPage";
import type { Version } from "../DashboardPage"; // Import Version type


interface MainPreviewProps {
  prompt: Prompt; // This will be the base prompt info or latest version info
  selectedVersion: Version | null; // The specific version selected from the sidebar
  onEditClick: () => void;
}

export const MainPreview = ({ prompt, selectedVersion, onEditClick }: MainPreviewProps) => {
  // Determine which data to display
  const displayTitle = selectedVersion ? selectedVersion.title : prompt.title;
  const displayDescription = selectedVersion ? selectedVersion.description : prompt.description;
  const displayTags = selectedVersion ? selectedVersion.tags : prompt.tags;

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div><h2 className="text-lg font-semibold text-emerald-900 mb-2">Prompt Preview</h2><p className="text-sm text-emerald-700/70">Review the details of your prompt.</p></div>
        <Button onClick={onEditClick} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"><Pencil className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />Revert Prompt</Button>
      </div>
      <div className="space-y-6">
        <div><label className="block text-sm font-semibold text-emerald-900 mb-2">Title</label><p className="text-xl font-bold text-emerald-800">{displayTitle}</p></div>
        <div><label className="block text-sm font-semibold text-emerald-900 mb-2">Tags</label><div className="flex flex-wrap gap-2">{displayTags.map((tag) => (<span key={tag} className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{tag}</span>))}</div></div>
        <div><label className="block text-sm font-semibold text-emerald-900 mb-2">Description</label><p className="text-emerald-700/90 whitespace-pre-wrap bg-emerald-50/50 p-4 rounded-lg border border-emerald-200/50">{displayDescription}</p></div>
      </div>
    </Card>
  );
};
