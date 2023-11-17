interface Props {
  openEdit: (value: boolean, row: ISeries) => void;
}

const SeriesList = ({ openEdit }: Props) => {
  return (
    <div>
      <h1>Series List</h1>
    </div>
  );
};

export default SeriesList;
