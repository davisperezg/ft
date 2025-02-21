import Paper, { PaperProps } from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  height: "auto",
  boxShadow: "none",
  //paddingBottom: "30px",
  //   paddingBlock: "30px",
  //   paddingInline: "15px",
  ...theme.typography.body2,
}));

const PaperRounded = (props: PaperProps) => {
  const { children } = props;
  return (
    <DemoPaper
      {...props}
      className={`${props.className} border`}
      square={false}
    >
      {children}
    </DemoPaper>
  );
};

export default PaperRounded;
