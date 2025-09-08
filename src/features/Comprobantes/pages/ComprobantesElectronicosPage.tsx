import CPEList from "../components/ComprobanteList";
import { usePageStore } from "../../../store/zustand/page-zustand";
import { PageEnum } from "../../../types/enums/page.enum";
import FacturaScreen from "./FacturaPage";
import PaperRounded from "../../../components/Material/Paper/PaperRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Divider, IconButton, Tooltip, Typography } from "@mui/material";

const CPEScreen = () => {
  const page = usePageStore((state) => state.page);
  const setPage = usePageStore((state) => state.setPage);

  return (
    <>
      {page.open && page.namePage === PageEnum.SCREEN_CREATE_INVOICE ? (
        <div className="bg-[#F8F8F8] overflow-y-auto min-h-dvh">
          <div className="min-w-[1050px] relative mx-auto">
            <div className="p-[30px] w-[1050px] mx-auto">
              <PaperRounded className="!shadow-asun">
                {/* <div className="pl-[15px] py-[10px] flex justify-start items-center">
                  <Tooltip title="Regresar" arrow>
                    <IconButton
                      onClick={() =>
                        setPage({
                          namePage: PageEnum.SCREEN_LIST_CPES,
                          open: true,
                          pageComplete: false,
                        })
                      }
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </Tooltip>{" "}
                  <Typography variant="h6">
                    Emitir <small className="text-default">Factura</small>
                  </Typography>
                </div>
                <Divider variant="fullWidth" />
                <div className="pt-[20px]">
                  <FacturaScreen />
                </div> */}
                <FacturaScreen />
              </PaperRounded>
            </div>
          </div>
        </div>
      ) : null}

      {!page.open && page.namePage === PageEnum.INIT && <CPEList />}
    </>
  );
};

export default CPEScreen;
