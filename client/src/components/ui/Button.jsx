import React from "react";
const Button = ({ children, type = "button" }) => {
  return (
    <button
      type={type} //thiếu type → bấm nút sẽ không trigger onSubmit của form.
      className="
        w-full
        bg-blue-300
        hover:bg-blue-400
        text-black
        font-semibold
        py-3
        rounded-lg
        transition
      "
    >
      {children}
    </button>
  );
};

export default Button;