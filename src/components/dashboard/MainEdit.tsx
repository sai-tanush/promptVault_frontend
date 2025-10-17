import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Send, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import type { Prompt } from "../DashboardPage";
import axios from "axios";
import { toast } from "sonner"; // Import toast here

const promptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface MainEditProps {
  prompt: Prompt | null; // This represents the currently selected prompt, which might be an existing one or null for new
  onCancel: () => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>; // Updated type for clarity
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>;
  refreshVersions: (promptId: string) => void; // Added refreshVersions prop
}

export const MainEdit = ({ prompt, onCancel, setIsEditing, setPrompts, setSelectedPrompt, refreshVersions }: MainEditProps) => {
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  const tags = watch("tags");

  // Populate form when editing
  useEffect(() => {
    if (prompt) {
      reset({
        title: prompt.title,
        description: prompt.description,
        tags: prompt.tags || [],
      });
    } else {
      // Reset for new prompt creation
      reset({
        title: "",
        description: "",
        tags: [],
      });
    }
  }, [prompt, reset]);

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags?.includes(trimmed)) {
      setValue("tags", [...(tags || []), trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      (tags || []).filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Create Prompt Handler
  const createPrompt = async(data: PromptFormData) => {
    try{
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prompts`,{
        title: data.title, // Use the title entered by the user
        description: data.description,
        tags: data.tags,
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("res in createPrompt = ", res);

      if (res.data.success) {
        // When creating a new prompt, the 'prompts' list (for sidebar) should be updated
        // with the initial title entered by the user, not the latest version's title.
        // The 'selectedPrompt' state (for MainView/MainEdit) will be updated later in DashboardPage
        // with the latest version's details if needed.
        const newPrompt: Prompt = {
          id: res.data.data.promptId, // Assuming promptId is the new prompt's ID
          title: data.title, // Use the title from the form data for the sidebar list
          description: res.data.data.version.description, // Use latest version details for initial selectedPrompt if it's immediately displayed
          tags: res.data.data.version.tags || [], // Use latest version details
          isDeleted: res.data.data.isDeleted || false,
          createdAt: res.data.data.createdAt,
        };

        // Add new prompt to the existing list for the sidebar
        setPrompts((prev) => [newPrompt, ...(prev || [])]);

        // Reset selected prompt and exit editing mode
        setIsEditing(false);
        setSelectedPrompt(null); // Clear selected prompt as a new one is created
      } else {
        toast.error(res.data.message || "Failed to create prompt.");
      }
    }
    catch(error: unknown){
      console.error("Error creating prompt:", error);
      toast.error("An error occurred while creating the prompt.");
      // Handle error display to user if necessary
    }
  }

  // Update Prompt Handler
  const updatePrompt = async(promptId: string, data: PromptFormData) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/prompts/${promptId}`, {
        title: data.title, // The title from the form data is sent to the backend
        description: data.description,
        tags: data.tags,
      }, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("res in updatePrompt = ", res);

      if (res.data.success) {
        // When updating a prompt, the 'prompts' list (for sidebar) should NOT have its title updated.
        // The 'selectedPrompt' state (for MainView/MainEdit) should be updated with the latest version's details.
        // The update to selectedPrompt is handled in DashboardPage.tsx's fetchPromptAllVersion.
        // Here, we only need to update the 'prompts' list to reflect the change in description/tags if needed,
        // but the requirement is to keep the sidebar title the same.
        // So, we update the prompt in the list, but only for description and tags, keeping the original title.
        setPrompts((prevPrompts) =>
          prevPrompts.map((p) =>
            p.id === promptId
              ? {
                  ...p,
                  // Keep the original title for the sidebar list
                  // title: res.data.data.title, // DO NOT update title here for sidebar
                  description: res.data.data.description, // Update description
                  tags: res.data.data.tags || [], // Update tags
                }
              : p
          )
        );

        // Update the selectedPrompt state directly if it's the one being edited,
        // so MainView/MainEdit shows the latest changes immediately.
        // DashboardPage's fetchPromptAllVersion will also update selectedPrompt,
        // but this ensures immediate UI feedback.
        setSelectedPrompt((prevSelectedPrompt) => {
          if (!prevSelectedPrompt || prevSelectedPrompt.id !== promptId) return prevSelectedPrompt;
          return {
            ...prevSelectedPrompt,
            title: res.data.data.title, // Use latest version title for MainView/MainEdit
            description: res.data.data.description,
            tags: res.data.data.tags || [],
          };
        });

        // After a successful update, re-fetch the versions to update the version list in the RightSidebar.
        if (prompt?.id) { // Ensure prompt.id is available
          refreshVersions(prompt.id);
        }

        setIsEditing(false);
        // setSelectedPrompt(null); // Keep the prompt selected to show updated details
      } else {
        toast.error(res.data.message || "Failed to update prompt.");
      }
    } catch (error: unknown) {
      console.error("Error updating prompt:", error);
      toast.error("An error occurred while updating the prompt.");
      // Handle error display to user if necessary
    }
  };


  // On Form Submit
  const onSubmit = (data: PromptFormData) => {
    console.log("--Form submitted:--", data);
    if (prompt) {
      // Editing an existing prompt
      // The 'prompt' prop here is the currently selected prompt from the sidebar.
      // Its ID is needed for the update API call.
      updatePrompt(prompt.id, data);
    } else {
      // Creating a new prompt
      createPrompt(data);
    }
  };

  return (
    <Card className="relative bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-xl p-6">
      {/* Close Button */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-emerald-700 hover:text-emerald-900 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-emerald-900 mb-2">
          {prompt ? "Edit Prompt" : "Create New Prompt"}
        </h2>
        <p className="text-sm text-emerald-700/70">
          Configure your prompt title, tags, and description
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-emerald-900 mb-2">
            Title
          </label>
          <Input
            {...register("title")}
            placeholder="e.g., Product Description Generator"
            className="bg-white/90 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-emerald-900 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-emerald-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add a tag and press Enter"
              className="flex-1 bg-white/90 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-emerald-900 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Describe what this prompt does..."
            className="w-full h-48 p-4 bg-white/90 border-2 border-emerald-200 rounded-lg text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 group"
          >
            <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
            Save Version
          </Button>
        </div>
      </form>
    </Card>
  );
};
