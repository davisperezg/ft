import { useEffect, useMemo, useState } from "react";

interface CheckboxOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

interface Props {
  options: string[] | CheckboxOption[];
  values: any[];
  handleChange: (value: string[]) => void;
  className?: string;
  category?: string;
}

const CheckBoxItem = ({
  options,
  values,
  handleChange,
  className = "",
  category,
}: Props) => {
  const [valuesLocal, setValues] = useState<string[]>([]);

  const itemsFiltered = useMemo(() => {
    return options;
  }, [options]);

  const handleChangeCheck = (e: any) => {
    //buscar repetidos
    const findRepeat = valuesLocal.find((mod) => mod === e.target.name);
    //si encuentra repetido
    if (findRepeat) {
      //filtra y lo quita del array
      const kickModule = valuesLocal.filter((mod) => mod !== findRepeat);
      setValues(kickModule);
      handleChange(kickModule);
      return;
    }
    //si no encuentra, lo agrega
    setValues([...valuesLocal, e.target.name]);

    handleChange([...valuesLocal, e.target.name]);
  };

  useEffect(() => {
    setValues(values);
  }, [values]);

  return (
    <>
      {itemsFiltered.map((item: any, i) => {
        return (
          <div
            key={typeof item === "string" ? i + item : item.value}
            className={`flex ${className}`}
          >
            <input
              className={`group-${category} border w-1/12 focus:outline-none pl-1 rounded-sm cursor-pointer`}
              type="checkbox"
              onChange={handleChangeCheck}
              name={typeof item === "string" ? item : item.value}
              checked={
                typeof item === "string"
                  ? values.some((value) => value === item)
                  : values.some((value) => value === item.value)
              }
              disabled={typeof item === "string" ? false : item.disabled}
              id={`check-${typeof item === "string" ? i + item : item.value}`}
            />

            <label
              htmlFor={`check-${
                typeof item === "string" ? i + item : item.value
              }`}
              className="ml-2 cursor-pointer"
            >
              {typeof item === "string" ? item : item.label}
            </label>
          </div>
        );
      })}
    </>
  );
};

export default CheckBoxItem;
