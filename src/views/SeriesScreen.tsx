import { useContext, useState } from "react";
import { ModalContext } from "../context/modalContext";
import { ISeries } from "../interface/series.interface";
import SeriesCreate from "../components/Series/SeriesCreate";
import { DialogActionKind } from "../reducers/dialogReducer";
import SeriesList from "../components/Series/SeriesList";
import SeriesEdit from "../components/Series/SeriesEdit";

const SeriesScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState<{ visible: boolean; row: any }>({
    visible: false,
    row: {},
  });

  const openEdit = (value: boolean, row: ISeries) => {
    setState({ visible: value, row });
  };

  const closeEdit = () => {
    setState({ visible: false, row: {} });
  };

  return (
    <>
      {dialogState.nameDialog === DialogActionKind.DIALOG_SERIES && (
        <SeriesCreate />
      )}

      {state.visible && <SeriesEdit data={state.row} closeEdit={closeEdit} />}

      <SeriesList openEdit={openEdit} />
    </>
  );
};

export default SeriesScreen;
