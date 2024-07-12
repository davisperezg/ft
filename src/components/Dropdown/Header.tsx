import { useEffect, useRef } from "react";

interface Props {
  setIsOpen: (val: boolean) => void;
  isOpen: boolean;
}

const DropdownHeader = ({ setIsOpen, isOpen }: Props) => {
  const container = useRef<HTMLDivElement>(null);

  // Allow for outside click
  useEffect(() => {
    function handleOutsideClick(event: any) {
      if (!container.current?.contains(event.target)) {
        if (!isOpen) return;
        setIsOpen(true);
      }
    }

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen, container, setIsOpen]);

  // Allow to use the `esc` key
  useEffect(() => {
    function handleEscape(event: any) {
      if (!isOpen) return;

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keyup", handleEscape);
    return () => document.removeEventListener("keyup", handleEscape);
  }, [isOpen, setIsOpen]);

  return <h1>nithing</h1>;
};

export default DropdownHeader;
