import { ISeries } from "../../interface/series.interface";

interface Props {
  data: ISeries;
  closeEdit: () => void;
}

const SeriesEdit = ({ data, closeEdit }: Props) => {
  return <>SeriesEdit</>;
};

export default SeriesEdit;
