import { Children, cloneElement, MouseEvent, useState, memo } from "react";

interface Prop {
  children: JSX.Element[] | JSX.Element;
  onChange: (newValue: number) => void;
  value: number;
}

const TabModal = ({ children, onChange, value }: Prop) => {
  const handleChange = (newValue: number) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="border-b">
      <div className="pb-2 flex flex-wrap gap-[5px]">
        {Children.map(children, (child) => {
          if (child.type.name === "TabModalItem") {
            return cloneElement(child, {
              active: value === child.props.value,
              onClick: () => handleChange(child.props.value),
              onChange: handleChange,
            });
          } else {
            return child;
          }
        })}
      </div>
    </div>
  );
};

export default TabModal;
