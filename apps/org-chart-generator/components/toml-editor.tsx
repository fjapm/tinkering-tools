"use client";

import { StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

const theme = EditorView.theme({
  "&": { height: "100%", fontSize: "13px", backgroundColor: "transparent" },
  ".cm-scroller": { fontFamily: "var(--font-mono), ui-monospace, monospace" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "#a1a1aa" },
  ".cm-activeLine": { backgroundColor: "#00000008" },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  "&.cm-focused": { outline: "none" },
});

export default function TomlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height="100%"
      theme={theme}
      className="h-full"
      extensions={[StreamLanguage.define(toml), EditorView.lineWrapping]}
      basicSetup={{
        foldGutter: false,
        autocompletion: false,
        highlightActiveLine: true,
        bracketMatching: true,
      }}
    />
  );
}
