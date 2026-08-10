interface ModalOpenIconProps {
  className?: string;
}

export default function ModalOpenIcon({ className = '' }: ModalOpenIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 text-sm leading-none transition-opacity sm:group-hover:opacity-60 ${className}`}
    >
      🔍
    </span>
  );
}
