import { IconButtonProps, Tooltip, IconButton, SxProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { ReactNode } from "react";

interface IExtendsProps extends IconButtonProps {
  titleTooltip: ReactNode;
  sxTooltip?: SxProps<Theme>;
  sxIconButton?: SxProps<Theme>;
}

const ToolTipIconButton = (props: IExtendsProps) => {
  const { children, titleTooltip, sxTooltip, sxIconButton, ...restIcon } =
    props;

  const defaultStylesToolTip: SxProps = { marginTop: "-4px" };

  const mergedStylesToolTip = sxTooltip
    ? { ...defaultStylesToolTip, ...sxTooltip }
    : defaultStylesToolTip;

  const defaultStylesIconButton: SxProps = {
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
      title={titleTooltip}
      sx={mergedStylesToolTip}
      placement="top"
      arrow
      //followCursor
      className="text-default"
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "#fff",
            color: "#213547",
            border: "1px solid #E6E8ED",
            "& .MuiTooltip-arrow": {
              "&::before": {
                border: "1px solid #E6E8ED",
              },
              color: "#fff",
            },
          },
        },
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
