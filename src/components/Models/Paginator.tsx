'use client';

import { JSX, useEffect, useState } from 'react';
import styles from '@/styles/Models/Paginator.module.css';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';

export interface PaginatorProps {
  total_count: number;
  take: number;
  onChange(page: number): void;
  page: number;
}

export const Paginator = ({
  total_count,
  take,
  onChange,
  page,
}: PaginatorProps) => {
  const [_page, _setPage] = useState<number>(page);
  const [_pages, _setPages] = useState<JSX.Element[]>([]);

  const [_totalCount, _setTotalCount] = useState<number>(total_count);
  const [_take, _setTake] = useState<number>(take);
  const [_display, _setDisplay] = useState<boolean>(false);

  useEffect(() => {
    _setTotalCount(total_count);
    _setTake(take);
    const pages_count = Math.ceil(total_count / take);
    if (_page + 2 > pages_count && pages_count != 0) {
      const page = Math.min(Math.max(0, _page - 1), pages_count - 1);
      _setPage(page);
      onChange(page);
    }
  }, [total_count, take]);

  useEffect(() => {
    _setPage(page);
  }, [page]);

  useEffect(() => {
    const pages_count = Math.ceil(_totalCount / _take);
    _setDisplay(pages_count != 0);
    const data: JSX.Element[] = [];
    const iterable_page =
      _page > 2 && pages_count > 4 ? Math.min(_page - 2, pages_count - 5) : 0;

    for (let x = iterable_page; x < 5 + iterable_page; x++) {
      if (x >= pages_count && pages_count < 5) continue;
      data.push(
        <p
          key={x}
          className={
            `${styles.page} ` + `${x == Math.max(0, _page) && styles.active}`
          }
          onClick={() => updatePage(x)}
        >
          {x + 1}
        </p>,
      );
    }
    _setPages(data);
  }, [_page, _totalCount, _take]);

  const updatePage = (_page: number) => {
    _setPage(_page);

    const pages_count = Math.ceil(_totalCount / _take);
    const page = Math.min(Math.max(0, _page), Math.max(0, pages_count - 1));
    onChange(page);
  };

  const loadingPages = Array.from({ length: 5 }, (_, index) => (
    <p key={index} className={`${styles.page} ${styles.page_loading}`} />
  ));

  return (
    <div className={styles.outer}>
      <div className={styles.container}>
        <IconChevronLeft
          className={`${styles.page} ${styles.arrow_left}`}
          onClick={() => updatePage(Math.max(0, _page - 1))}
        />
        {_display ? _pages : loadingPages}
        <IconChevronRight
          className={`${styles.page} ${styles.arrow_right}`}
          onClick={() =>
            updatePage(Math.min(_page + 1, Math.ceil(_totalCount / _take) - 1))
          }
        />
      </div>
    </div>
  );
};
