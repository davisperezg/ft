import Tab, { TabProps } from "@mui/material/Tab";

interface ExtendedTabProps extends TabProps {
  index: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const TabModal = (props: ExtendedTabProps) => {
  const { children, index } = props;
  return (
    <Tab
      component="span"
      disableRipple
      sx={{
        textTransform: "none",
        border: "1px solid #E3E4E6",
        color: "#374152",
        userSelect: "none",
        fontWeight: "600",
        cursor: "pointer",
        padding: "8px 12px",
        margin: 0,
        minWidth: "auto",
        minHeight: "auto",
        letterSpacing: 0,
        lineHeight: "normal",
        fontSize: "14px",
        borderRadius: "4px",
        "&:hover": {
          background: "#E5E5E5",
        },
        "&.Mui-selected": {
          background: "#EFF6FF",
          color: "#60A5FA",
          border: "none",
        },
      }}
      {...a11yProps(index)}
      {...props}
    >
      {children}
    </Tab>
  );
};

export default TabModal;
