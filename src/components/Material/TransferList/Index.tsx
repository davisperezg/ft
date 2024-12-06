import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { Control, UseFormSetValue, useFieldArray } from "react-hook-form";
import {
  ISeriesMigrate,
  ITransferListOf,
  ITransferListTo,
} from "../../../interfaces/models/series/series.interface";

interface Props {
  seriesOf: ITransferListOf;
  isReset: boolean;
  control: Control<ISeriesMigrate, any>;
  setValue: UseFormSetValue<ISeriesMigrate>;
}

function not(a: ITransferListTo[], b: ITransferListTo[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: ITransferListTo[], b: ITransferListTo[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: ITransferListTo[], b: ITransferListTo[]) {
  return [...a, ...not(b, a)];
}

const TransferList = ({ seriesOf, isReset, control, setValue }: Props) => {
  const [checked, setChecked] = useState<ITransferListTo[]>([]);
  const [left, setLeft] = useState<ITransferListTo[]>([]);
  //const [right, setRight] = useState([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documentos",
    keyName: "uuid",
  });

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, fields);

  const handleToggle = (value: ITransferListTo) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: ITransferListTo[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: ITransferListTo[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    append(leftChecked);
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setValue("documentos", not(fields, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: string, items: ITransferListTo[]) => (
    <Card sx={{ borderRadius: 0, boxShadow: "none" }} className="border">
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              "aria-label": "all items selected",
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} seleccionados`}
      />
      <Divider />
      <List
        sx={{
          width: "100%",
          height: 300,
          bgcolor: "background.paper",
          overflow: "auto",
        }}
        dense
        component="div"
        role="list"
      >
        {items.map((value) => {
          const labelId = `transfer-list-all-item-${value.serie}-label`;

          return (
            <ListItem
              key={value.serie}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-labelledby": labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={`${value.serie} - ${value.establecimiento}`}
              />
            </ListItem>
          );
        })}
      </List>
    </Card>
  );

  useEffect(() => {
    if (seriesOf) {
      setLeft(seriesOf.series);
    }

    if (isReset) {
      setLeft([]);
      remove();
    }
  }, [seriesOf, isReset, remove]);

  return (
    <div className="flex justify-between items-center">
      <Grid item xs={5} sx={{ padding: "0px !important" }}>
        {customList(seriesOf.nombre, left)}
      </Grid>
      <Grid item xs={2}>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={5} sx={{ padding: "0px !important" }}>
        {customList("Series para migrar", fields)}
      </Grid>
    </div>
  );
};

export default TransferList;
