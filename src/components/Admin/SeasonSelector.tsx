'use client';

import { useEffect, useMemo, useState } from 'react';
import Select, { GroupBase } from 'react-select';

type OptionSingle = {
  value: string;
  label: string;
};

type Props = {
  defaultValue: string[];
  existedList: string[];
  onChange: (tags: string[]) => void;
  isMulti?: boolean;
  loading?: boolean;
};

const MAX_LENGTH = 20;

const normalize = (value: string) =>
  value.slice(0, MAX_LENGTH).replace(/[^\p{L}\p{N} ]/gu, '');

const SeasonSelector = ({
  defaultValue,
  existedList,
  onChange,
  isMulti,
  loading,
}: Props) => {
  // Вообще пофиг
  const max = isMulti ? 1 : 10;
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultValue);

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions, onChange]);

  const options = useMemo<(OptionSingle | GroupBase<OptionSingle>)[]>(() => {
    const value = normalize(inputValue);
    const valueLower = value.toLowerCase();

    const matches = existedList.filter(tag =>
      tag.toLowerCase().includes(valueLower),
    );

    const result: (OptionSingle | GroupBase<OptionSingle>)[] = [];

    if (value && !existedList.some(tag => tag.toLowerCase() === valueLower)) {
      result.push({
        value,
        label: `Создать: ${value}`,
      });
    }

    if (matches.length) {
      result.push({
        label: 'Совпадения',
        options: matches.map(tag => ({
          value: tag,
          label: tag,
        })),
      });
    }

    return result;
  }, [inputValue, existedList]);

  return (
    <Select
      isMulti
      isLoading={loading}
      isSearchable
      options={options}
      className="react-select-container"
      classNamePrefix="react-select"
      instanceId="tag-search"
      placeholder="Выберите..."
      inputValue={inputValue}
      defaultValue={defaultValue.map(tag => ({
        value: tag,
        label: tag,
      }))}
      isOptionDisabled={() => selectedOptions.length >= max}
      onInputChange={(value, action) => {
        if (action.action === 'input-change') {
          setInputValue(normalize(value));
        }
      }}
      onChange={newValue => {
        setSelectedOptions(Array.isArray(newValue) ? [...newValue] : []);
      }}
    />
  );
};

export default SeasonSelector;
