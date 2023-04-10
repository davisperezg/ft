interface Props {
  className?: string;
  message: string;
  placeholder?: boolean;
}

const ToastError = ({ className = "", message, placeholder }: Props) => {
  return (
    <div
      className={`transition duration-200 ease-in transform  hover:scale-105 left-0 fixed text-center w-full z-[1000] pointer-events-none bottom-[86px] ${className}`}
    >
      {placeholder && (
        <div className="w-[250px] max-w-[400px] min-w-[250px] bg-red-100 border border-primary rounded-md p-3 m-[0_auto]">
          {message}
        </div>
      )}
    </div>
  );
};

export default ToastError;
