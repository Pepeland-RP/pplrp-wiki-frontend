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

  const selectedValue = useMemo(() => {
    if (isMulti) {
      return selectedOptions.map(tag => ({
        value: tag,
        label: tag,
      }));
    }

    return selectedOptions[0]
      ? { value: selectedOptions[0], label: selectedOptions[0] }
      : null;
  }, [selectedOptions, isMulti]);

  return (
    <Select
      isMulti={isMulti}
      isLoading={loading}
      isSearchable
      value={selectedValue}
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
      isOptionDisabled={() => selectedOptions.length >= 10}
      onInputChange={(value, action) => {
        if (action.action === 'input-change') {
          setInputValue(normalize(value));
        }
      }}
      onChange={newValue => {
        if (Array.isArray(newValue)) {
          setSelectedOptions(newValue.map(e => e.value));
        } else if (newValue && 'value' in newValue) {
          setSelectedOptions([newValue.value]);
        } else {
          setSelectedOptions([]);
        }
        setInputValue('');
      }}
    />
  );
};

export default SeasonSelector;
