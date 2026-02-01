const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export const formatDateHuman = (date: Date, include_time?: boolean) => {
  if (isNaN(date.getDay())) return '';
  const day = date.getDate().toString();
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString();

  if (include_time) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} г. в ${hours}:${minutes}`;
  }
  return `${day} ${month} ${year} г.`;
};

export const formatDate = (date: Date) => {
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  });

  return formatter.format(date).replace(',', '');
};
