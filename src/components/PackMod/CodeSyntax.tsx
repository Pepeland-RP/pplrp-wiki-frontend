'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from '../../styles/PackMod/codesyntax.module.css';

interface CodeSyntaxProps {
  code: string;
  language?: string;
}

export default function CodeSyntax({ code, language = 'json' }: CodeSyntaxProps) {
  return (
    <div className={styles.wrapper}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          fontSize: '0.9rem',
          padding: '1.25rem',
          background: '#1e1e1e'
        }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
