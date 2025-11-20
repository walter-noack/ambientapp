export default function Tooltip({ label, children }) {
  return (
    <div className="relative group inline-block">
      {children}

      <div
        className="
          absolute left-1/2 -translate-x-1/2 -top-10
          whitespace-nowrap
          px-3 py-1
          text-xs font-medium text-white
          bg-black/80
          rounded-md shadow-lg
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition-opacity duration-150
        "
      >
        {label}

        <div
          className="
            absolute left-1/2 -translate-x-1/2 top-full
            w-0 h-0
            border-l-4 border-r-4 border-t-4
            border-l-transparent border-r-transparent border-t-black/80
          "
        />
      </div>
    </div>
  );
}