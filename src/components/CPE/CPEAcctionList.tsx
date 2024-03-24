import { useState } from "react";
import { IInvoice } from "../../interface/invoice.interface";
import { MenuDropdown } from "../Material/Menu/MenuList";
import { MenuItem } from "@mui/material";

interface CPEAcctionListProps {
  row: IInvoice;
}

const CPEAcctionList = ({ row }: CPEAcctionListProps) => {
  const [invoice, setInvoice] = useState<IInvoice>(row);

  console.log(invoice);
  return (
    <div className="absolute bottom-[-20px] w-[100px] bg-white border borders shadow-2xl z-10">
      <div>
        <span>Anular</span>
      </div>
    </div>
  );
};

export default CPEAcctionList;
