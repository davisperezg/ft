import { useState } from "react";
import { IInvoice } from "../../interface/invoice.interface";

interface CPEAcctionListProps {
  row: IInvoice;
}

const CPEAcctionList = ({ row }: CPEAcctionListProps) => {
  const [invoice, setInvoice] = useState<IInvoice>(row);

  console.log(invoice);
  return (
    <div className="absolute">
      <h1>CPEAcctionList</h1>
    </div>
  );
};

export default CPEAcctionList;
