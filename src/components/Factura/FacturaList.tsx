import ComponentTable from "../Table/Index";

const FacturaList = () => {
  return (
    <>
      <ComponentTable
        loading={true}
        data={[]}
        columns={[]}
        //getItemsRemoves={getItemsRemoves}
        //getItemsRestores={getItemsRestores}
        //openEdit={openEdit}
      />
    </>
  );
};

export default FacturaList;
