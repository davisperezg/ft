import Tabs, { TabsProps } from "@mui/material/Tabs";

//TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
const TabsModal = (props: TabsProps) => {
  const { children } = props;
  return (
    <Tabs
      TabIndicatorProps={{
        hidden: true,
      }}
      sx={{
        padding: "10px",
        overflow: "initial",
        flexWrap: "wrap",
        minHeight: "auto",
        backgroundColor: "#fff",
        ".MuiTabs-scroller": {
          whiteSpace: "normal",
        },
        ".MuiTabs-flexContainer": {
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          backgroundColor: "#fff",
        },
        ".Mui-selected": {
          color: "#60A5FA !important",
        },
      }}
      {...props}
    >
      {children}
    </Tabs>
  );
};

export default TabsModal;
