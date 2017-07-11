import React, { PropTypes } from 'react';

const twoDigitNumber = number => (number < 10 ? `0${number}` : `${number}`);

const FormattedDate = ({ date }) => {
  const dateObj = new Date(date);
  const dateStr = `${twoDigitNumber(dateObj.getDate())}/${twoDigitNumber(
    dateObj.getMonth() + 1
  )}/${dateObj.getFullYear()} ${twoDigitNumber(dateObj.getHours())}:${twoDigitNumber(dateObj.getMinutes())}`;
  return (
    <span>
      {dateStr}{' '}
    </span>
  );
};

FormattedDate.propTypes = {
  date: PropTypes.number.isRequired
};

export default FormattedDate;
