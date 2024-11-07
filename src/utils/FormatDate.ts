export const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const diffDate = (dateString: Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (day >= 7) {
    return formatDate(dateString);
  } else if (day > 0) {
    return `${day}일 전`;
  } else if (hour > 0) {
    return `${hour}시간 전`;
  } else if (min > 0) {
    return `${min}분 전`;
  } else {
    return `${sec}초 전`;
  }
};
