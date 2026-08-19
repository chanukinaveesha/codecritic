"use client"

import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";

const LANGUAGE_EXTENSIONS: Record<string, ReturnType<typeof javascript>> = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  python: python(),
  java: java(),
  rust: rust(),
  html: html(),
  css: css(),
  json: json(),
  sql: sql(),
};

export function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
}) {
  const extensions = LANGUAGE_EXTENSIONS[language] ? [LANGUAGE_EXTENSIONS[language]] : [];

  return (
    <CodeMirror
      value={value}
      height="240px"
      theme={githubDark}
      extensions={extensions}
      onChange={onChange}
      className="overflow-hidden rounded-md border border-input text-sm"
    />
  );
}