import Select, { Props, GroupBase } from "react-select";
import { forwardRef } from "react";
//https://stackoverflow.com/questions/73678700/react-select-typescript-not-working-properly-when-i-substitute-select-with-a-com
//https://codesandbox.io/s/react-typescript-forked-q3z9mv?file=/src/CustomSelect.tsx:1398-1405

export type IOption = {
  value: number | string;
  label: string;
  text?: string;
  disabled?: boolean;
};

type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = Props<Option, IsMulti, Group> & {
  error?: boolean;
  helperText?: string;
};

export const SelectMiddle = forwardRef(
  <
    IsMulti extends boolean = false,
    Group extends GroupBase<IOption> = GroupBase<IOption>,
  >(
    props: SelectProps<IOption, IsMulti, Group>,
    ref: any
  ) => {
    //min-w-[175px]
    return (
      <>
        <Select
          {...props}
          ref={ref}
          theme={(theme) => ({ ...theme })}
          classNames={{
            control: (state) =>
              state.isFocused
                ? `${
                    props.error ? "!border-[#d32f2f]" : "!border-inherit"
                  } !min-h-[28px] !shadow-none !pl-1 !cursor-pointer min-w-[175px]`
                : `!cursor-pointer !min-h-[28px] ${
                    props.error ? "!border-[#d32f2f]" : "!border-inherit"
                  } !w-full !focus:outline-none !pl-1 !rounded-[4px] text-[14px] min-w-[175px]`,
            valueContainer: () => "!p-0 !m-0",
            option: () => "!p-0 !m-0 !pl-6 !w-full text-left !cursor-pointer",
            input: () => "!p-0 !m-0",
            indicatorsContainer: () => "!p-0 !m-0",
            loadingIndicator: () => "!p-0 !text-[4px]",
            dropdownIndicator: () => "!p-0 !m-0",
            menu: () =>
              "mt-[5px] !min-w-[350px] left-[-100px] right-[-100px] mx-auto ",
            menuList: () => "!p-0",
            group: () => "!pb-0",
            groupHeading: () => "text-left",
          }}
        />
        {props.error && (
          <p className="text-[#d32f2f] text-[0.75rem]">{props.helperText}</p>
        )}
      </>
    );
  }
);
