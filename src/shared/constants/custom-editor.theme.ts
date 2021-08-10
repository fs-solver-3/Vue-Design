// See more [here](https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors)
export const DiEditorThemeDark = {
  base: 'vs-dark',
  inherit: true,
  rules: [{ background: '272a36' }],
  colors: {
    'editor.foreground': '#FFFFFF99',
    'editor.background': '#272a36'
    // 'editorCursor.foreground': '#8B0000',
    // 'editor.lineHighlightBackground': '#0000FF20',
    // 'editorLineNumber.foreground': '#008800',
    // 'editor.selectionBackground': '#88000030',
    // 'editor.inactiveSelectionBackground': '#88000015'
  }
};

export const FormulaTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [{ background: '#ffffff' }, { token: 'field', foreground: '#4493d0' }, { token: 'keyword', foreground: '#e57418' }],
  colors: {
    'editor.foreground': '#FFFFFF99',
    'editor.background': '#333645',
    'editor.lineHighlightBackground': '#00000000',
    'editor.lineHighlightBorder': '#00000000'
    // 'editorCursor.foreground': '#8B0000',
    // 'editor.lineHighlightBackground': '#0000FF20',
    // 'editorLineNumber.foreground': '#008800',
    // 'editor.selectionBackground': '#88000030',
    // 'editor.inactiveSelectionBackground': '#88000015'
  }
};

export const QueryTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // { background: '#ffffff' },
    { token: 'field', foreground: '#4493d0' },
    {
      token: 'keyword',
      foreground: '#e57418'
    },
    { token: 'databases', foreground: '#ff3366' },
    { token: 'tables', foreground: '#1892d8' },
    { token: 'columns', foreground: '#65d217' }
  ],
  colors: {
    // 'editor.foreground': '#FFFFFF99',
    'editor.background': '#272a36',
    'editor.lineHighlightBackground': '#00000000',
    'editor.lineHighlightBorder': '#00000000',
    // 'editorCursor.foreground': '#8B0000',
    // 'editor.lineHighlightBackground': '#0000FF20',
    // 'editorLineNumber.foreground': '#008800',
    'editor.selectionBackground': '#F4F4F43B'
    // 'editor.inactiveSelectionBackground': '#88000015'
  }
};
