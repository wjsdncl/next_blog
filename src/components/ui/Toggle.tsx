"use client";

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  onIcon?: React.ReactNode;
  offIcon?: React.ReactNode;
  className?: string;
}

export default function Toggle({ isOn, onToggle, onIcon, offIcon, className = "" }: ToggleProps) {
  return (
    <button type="button" className={`rounded-full p-2 ${className}`} onClick={onToggle}>
      {isOn ? onIcon : offIcon}
    </button>
  );
}
