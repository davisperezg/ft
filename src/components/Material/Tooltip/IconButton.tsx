import { IconButtonProps, Tooltip, IconButton, SxProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { ReactNode } from "react";

interface IExtendsProps extends IconButtonProps {
  title: ReactNode;
  sxTooltip?: SxProps<Theme>;
  sxIconButton?: SxProps<Theme>;
}

const ToolTipIconButton = (props: IExtendsProps) => {
  const { children, title, sxTooltip, sxIconButton, ...restIcon } = props;

  const defaultStylesToolTip = { marginTop: "-4px" };

  const mergedStylesToolTip = sxTooltip
    ? { ...defaultStylesToolTip, ...sxTooltip }
    : defaultStylesToolTip;

  const defaultStylesIconButton = {
    margin: 0,
    padding: 0,
    fontSize: 15,
    cursor: "pointer",
  };

  const mergedStylesIconButton = sxIconButton
    ? { ...defaultStylesIconButton, ...sxIconButton }
    : defaultStylesIconButton;

  return (
    <Tooltip
      title={title}
      sx={mergedStylesToolTip}
      placement="top"
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -8],
              },
            },
          ],
        },
      }}
    >
      <IconButton {...restIcon} sx={mergedStylesIconButton}>
        {children}
      </IconButton>
    </Tooltip>
  );
};

export default ToolTipIconButton;
