import { HTMLProps, useEffect, useRef } from "react";

const IndeterminateCheckbox = ({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) => {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      {...rest}
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
    />
  );
};

export default IndeterminateCheckbox;
