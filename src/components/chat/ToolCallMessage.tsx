"use client";

import { File, FileEdit, FilePlus, FileSearch, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallMessageProps {
  toolName: string;
  args: Record<string, any> | undefined;
  state: "partial-call" | "call" | "result";
  result?: any;
}

/**
 * Renders a user-friendly description of an AI tool call.
 * Maps str_replace_editor / file_manager commands to plain-English
 * descriptions of what's happening (e.g. "Creating App.jsx").
 */
export function ToolCallMessage({
  toolName,
  args,
  state,
  result,
}: ToolCallMessageProps) {
  const { label, icon: Icon } = describeToolCall(toolName, args);

  const isRunning = state !== "result";
  const failed = state === "result" && isFailureResult(result);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs font-mono border",
        failed
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-neutral-50 border-neutral-200 text-neutral-700"
      )}
    >
      <Icon
        className={cn(
          "w-3.5 h-3.5",
          isRunning ? "animate-spin text-blue-600" : failed ? "text-red-500" : "text-emerald-500"
        )}
      />
      <span title={toolName}>{label}</span>
    </div>
  );
}

function describeToolCall(
  toolName: string,
  args: Record<string, any> | undefined
): { label: string; icon: typeof File } {
  const command = args?.command as string | undefined;
  const path = (args?.path as string | undefined) ?? "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return {
          label: path ? `Creating ${shortPath(path)}` : "Creating file",
          icon: FilePlus,
        };
      case "str_replace":
        return {
          label: path ? `Editing ${shortPath(path)}` : "Editing file",
          icon: FileEdit,
        };
      case "insert":
        return {
          label: path ? `Inserting into ${shortPath(path)}` : "Inserting into file",
          icon: FileEdit,
        };
      case "view":
        return {
          label: path ? `Viewing ${shortPath(path)}` : "Viewing file",
          icon: FileSearch,
        };
      case "undo_edit":
        return { label: "Undoing edit", icon: FileEdit };
      default:
        return { label: "Editing file", icon: FileEdit };
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename": {
        const newPath = (args?.new_path as string | undefined) ?? "";
        return {
          label: path && newPath
            ? `Moving ${shortPath(path)} → ${shortPath(newPath)}`
            : "Moving file",
          icon: File,
        };
      }
      case "delete":
        return {
          label: path ? `Deleting ${shortPath(path)}` : "Deleting file",
          icon: File,
        };
      default:
        return { label: "Managing files", icon: File };
    }
  }

  return { label: prettifyToolName(toolName), icon: File };
}

function shortPath(path: string): string {
  // Trim leading slash and keep last two segments for brevity.
  const trimmed = path.replace(/^\//, "");
  const segments = trimmed.split("/");
  if (segments.length <= 2) return trimmed;
  return ".../" + segments.slice(-2).join("/");
}

function prettifyToolName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isFailureResult(result: any): boolean {
  if (result == null) return false;
  if (typeof result === "object") {
    if (result.success === false) return true;
    if (typeof result.error === "string" && result.error.length > 0) return true;
  }
  if (typeof result === "string") {
    return /^error/i.test(result);
  }
  return false;
}