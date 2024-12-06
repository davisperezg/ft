import { useEffect, useState } from "react";

interface Props {
  className?: string;
  message?: string | any[];
  placeholder?: boolean;
  delay?: number;
}

const ToastError = ({
  className = "",
  message = "",
  placeholder,
  delay,
}: Props) => {
  const verifyMessage = typeof message === "object" ? message[0] : message;

  const [place, setPlace] = useState<boolean>(false);

  useEffect(() => {
    if (placeholder) {
      setPlace(true);
    }

    if (delay) {
      const interval = setTimeout(() => {
        setPlace(false);
      }, delay);

      return () => {
        clearInterval(interval);
      };
    }
  }, [delay, placeholder]);

  return (
    <div
      className={`transition duration-200 ease-in transform  hover:scale-105 left-0 fixed text-center w-full z-[1000] pointer-events-none bottom-[86px] ${
        place ? "opacity-[1] transform-none" : "opacity-0 translate-y-[20px]"
      } ${className}`}
    >
      {place && (
        <div className="w-[250px] max-w-[400px] min-w-[250px] bg-red-100 border border-primary rounded-md p-3 m-[0_auto]">
          {verifyMessage}
        </div>
      )}
    </div>
  );
};

export default ToastError;
