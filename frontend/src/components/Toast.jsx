import React from 'react'

const Toast = ({ message, type = "info" }) => {
  if (!message) return null;

  const bg =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-blue-500";

  return (
    <div className={`${bg} text-white px-4 py-2 rounded mb-4`}>
      {message}
    </div>
  );
};

export default Toast;


