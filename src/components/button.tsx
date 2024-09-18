import React from "react";
import Link from "next/link";

interface ButtonProps {
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  children,
  className = "",
  disabled = false,
}) => {
  const baseClass =
    "group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30";
  const fullClass = `${baseClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={fullClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={fullClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
