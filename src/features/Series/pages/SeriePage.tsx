import { useContext, useState } from "react";
import { ModalContext } from "../../../store/context/dialogContext";
import SeriesCreate from "../components/SeriesCreate";
import SeriesList from "../components/SeriesList";
import SeriesEdit from "../components/SeriesEdit";
import SeriesMigrate from "../components/SeriesMigrate";
import { ISeries } from "../../../interfaces/models/series/series.interface";
import { DialogEnum } from "../../../types/enums/dialog.enum";

const SeriesScreen = () => {
  const { dialogState } = useContext(ModalContext);

  const [state, setState] = useState<{ visible: boolean; row: any }>({
    visible: false,
    row: {},
  });

  const onRowClick = (row: ISeries) => {
    setState({ visible: true, row });
  };

  const closeEdit = () => setState({ visible: false, row: {} });

  return (
    <>
      {dialogState.nameDialog === DialogEnum.DIALOG_SERIES && <SeriesCreate />}

      {dialogState.nameDialog === DialogEnum.DIALOG_SERIES_MIGRATE && (
        <SeriesMigrate />
      )}

      {state.visible && <SeriesEdit state={state} closeEdit={closeEdit} />}

      <SeriesList onRowClick={onRowClick} />
    </>
  );
};

export default SeriesScreen;
