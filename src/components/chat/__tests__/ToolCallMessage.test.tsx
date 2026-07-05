import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallMessage } from "../ToolCallMessage";

test("str_replace_editor create shows 'Creating' with file name", () => {
  render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Counter.jsx", file_text: "..." }}
      state="call"
    />
  );

  expect(screen.getByText("Creating components/Counter.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows 'Editing'", () => {
  render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/App.jsx", old_str: "a", new_str: "b" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor insert shows 'Inserting into'", () => {
  render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/components/Card.jsx", insert_line: 5, new_str: "x" }}
      state="call"
    />
  );

  expect(screen.getByText("Inserting into components/Card.jsx")).toBeDefined();
});

test("str_replace_editor view shows 'Viewing'", () => {
  render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "view", path: "/components/Form.jsx" }}
      state="result"
      result="file contents"
    />
  );

  expect(screen.getByText("Viewing components/Form.jsx")).toBeDefined();
});

test("long paths are shortened to last two segments", () => {
  render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "create", path: "/a/b/c/d/DeepComponent.jsx" }}
      state="call"
    />
  );

  expect(screen.getByText("Creating .../d/DeepComponent.jsx")).toBeDefined();
});

test("file_manager rename shows move arrow", () => {
  render(
    <ToolCallMessage
      toolName="file_manager"
      args={{ command: "rename", path: "/Old.jsx", new_path: "/New.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("Moving Old.jsx → New.jsx")).toBeDefined();
});

test("file_manager delete shows 'Deleting'", () => {
  render(
    <ToolCallMessage
      toolName="file_manager"
      args={{ command: "delete", path: "/components/Old.jsx" }}
      state="result"
      result={{ success: true, message: "deleted" }}
    />
  );

  expect(screen.getByText("Deleting components/Old.jsx")).toBeDefined();
});

test("running state shows spinner (animate-spin class present)", () => {
  const { container } = render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );

  const icon = container.querySelector(".animate-spin");
  expect(icon).not.toBeNull();
});

test("successful result does not show red error styling", () => {
  const { container } = render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).not.toContain("bg-red-50");
});

test("failure result shows red error styling", () => {
  const { container } = render(
    <ToolCallMessage
      toolName="file_manager"
      args={{ command: "delete", path: "/missing.jsx" }}
      state="result"
      result={{ success: false, error: "not found" }}
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("bg-red-50");
  expect(badge.className).toContain("text-red-700");
});

test("string result starting with 'Error' is treated as failure", () => {
  const { container } = render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.jsx" }}
      state="result"
      result="Error: undo_edit not supported"
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("bg-red-50");
});

test("unknown tool name falls back to prettified label", () => {
  render(
    <ToolCallMessage
      toolName="some_custom_tool"
      args={{}}
      state="call"
    />
  );

  expect(screen.getByText("Some Custom Tool")).toBeDefined();
});

test("missing args falls back to generic label", () => {
  render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={undefined}
      state="call"
    />
  );

  expect(screen.getByText("Editing file")).toBeDefined();
});

test("undo_edit command label", () => {
  const { container } = render(
    <ToolCallMessage
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.jsx" }}
      state="call"
    />
  );

  const span = container.querySelector("span");
  expect(span?.textContent).toBe("Undoing edit");
});