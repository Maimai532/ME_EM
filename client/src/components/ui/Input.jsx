const Input = ({ type = "text", placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
        w-full
        border border-zinc-700
        rounded-lg
        px-4 py-3
        text-zinc-700
        placeholder:text-zinc-400
        outline-none
        focus:border-blue-200
        transition
      "
    />
  );
};

export default Input;