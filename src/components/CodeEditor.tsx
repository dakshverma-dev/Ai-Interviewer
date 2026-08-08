'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <div className="h-full w-full rounded-[var(--radius-xl)] overflow-hidden" style={{ background: 'var(--color-charcoal)' }}>
      <Editor
        height="100%"
        language="python"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: 'on',
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
