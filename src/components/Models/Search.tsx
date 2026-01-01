'use client';

import styles from '@/styles/Models/Search.module.css';
import { IconSearch } from '@tabler/icons-react';
import { useRef } from 'react';

interface SearchProps {
  onSearch: (text: string) => void;
}

const Search = ({ onSearch }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.search_container}>
      <input
        ref={inputRef}
        id="input-id"
        type="text"
        placeholder="Введите название модели..."
        onKeyUp={e => {
          if (e.code == 'Enter' || e.code == 'NumpadEnter') {
            onSearch?.(inputRef.current!.value);
          }
        }}
      />
      <button
        onClick={() => {
          onSearch?.(inputRef.current!.value);
        }}
      >
        <IconSearch width={16} height={16} />
      </button>
    </div>
  );
};

export default Search;
