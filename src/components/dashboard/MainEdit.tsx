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

const promptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface MainEditProps {
  prompt: Prompt | null;
  onCancel: () => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  setPrompts: React.Dispatch<React.SetStateAction<[] | Prompt[]>>
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>
}

export const MainEdit = ({ prompt, onCancel, setIsEditing, setPrompts, setSelectedPrompt }: MainEditProps) => {
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
      reset({
        title: "",
        description: "",
        tags: [],
      });
    }
  }, [prompt, reset]);

  // ✅ Tag Handlers
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

  // ✅ On Form Submit
  const onSubmit = (data: PromptFormData) => {
    console.log("Form submitted:", data);
    createPrompt(data);
  };

  const createPrompt = async(data: PromptFormData) => {
    try{
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/prompts`,{
        title: data.title,
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
      const newPrompt: Prompt = {
        id: res.data.data.promptId,
        title: res.data.data.version.title,
        description: res.data.data.version.description,
        tags: res.data.data.version.tags || [],
        isDeleted: res.data.data.isDeleted || false,
        createdAt: res.data.data.createdAt,
      };

      // Add new prompt to the existing list
      setPrompts((prev) => [newPrompt, ...(prev || [])]);

      setIsEditing(false);
      setSelectedPrompt(null);


      }
    }
    catch(error: unknown){
      console.error("Error fetching prompts:", error);
    }
  }

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
