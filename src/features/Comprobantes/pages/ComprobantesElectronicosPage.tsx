import CPEList from "../components/ComprobanteList";
import { PageEnum } from "../../../types/enums/page.enum";
import FacturaScreen from "./FacturaPage";
import PaperRounded from "../../../components/Material/Paper/PaperRounded";
import NotaVentaScreen from "./NotaVentaPage";
import { usePageStore } from "../../../store/zustand/page-zustand";

const CPEScreen = () => {
  const currentPage = usePageStore((state) => state.page.namePage);

  // Componente de layout reutilizable para documentos
  const DocumentLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#F8F8F8] overflow-y-auto h-full">
      <div className="min-w-[1050px] relative mx-auto ">
        <div className="p-[30px] w-[1050px] mx-auto">
          <PaperRounded className="!shadow-asun">{children}</PaperRounded>
        </div>
      </div>
    </div>
  );

  // Renderizar el contenido basado en la página actual
  const renderContent = () => {
    switch (currentPage) {
      case PageEnum.SCREEN_CREATE_INVOICE:
        return (
          <DocumentLayout>
            <FacturaScreen />
          </DocumentLayout>
        );

      case PageEnum.SCREEN_CREATE_BOLETA:
        return (
          <DocumentLayout>
            {/* <BoletaScreen /> */}
            <div>Boleta Screen - Componente pendiente de crear</div>
          </DocumentLayout>
        );

      case PageEnum.SCREEN_CREATE_NOTA_VENTA:
        return (
          <DocumentLayout>
            <NotaVentaScreen />
          </DocumentLayout>
        );

      case PageEnum.SCREEN_LIST_INVOICE:
        return <CPEList />;

      default:
        return <CPEList />;
    }
  };

  return <>{renderContent()}</>;
};

export default CPEScreen;
