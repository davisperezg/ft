import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import logo from "../../assets/logo_systemfact.png";
import { ModalContext } from "../../context/modalContext";
import { storage } from "../../utils/storage";
import { DialogActionKind } from "../../reducers/dialogReducer";

const Header = ({ result }: any) => {
  const { setUserGlobal, userGlobal, dialogState } = useContext(ModalContext);
  const [isDropdown, setDropdown] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);
  const [selectedOption, setSelectedOption] = useState("");

  const closeApp = () => {
    storage.clear("SESSION");
    location.reload();
  };

  const handleDropdown = () => {
    setDropdown(!isDropdown);
  };

  // Allow for outside click
  useEffect(() => {
    function handleOutsideClick(event: any) {
      if (!labelRef.current?.contains(event.target)) {
        if (!isDropdown) return;
        setDropdown(false);
      }
    }

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isDropdown, labelRef, setDropdown]);

  // Allow to use the `esc` key
  useEffect(() => {
    function handleEscape(event: any) {
      if (!isDropdown) return;

      if (event.key === "Escape") {
        setDropdown(false);
      }
    }

    document.addEventListener("keyup", handleEscape);
    return () => document.removeEventListener("keyup", handleEscape);
  }, [isDropdown, setDropdown]);

  useEffect(() => {
    if (result?.data) {
      setUserGlobal(result?.data);

      if (sessionStorage.getItem("empresaActual")) {
        console.log("ya existe");
        const empresaActual = JSON.parse(
          String(sessionStorage.getItem("empresaActual"))
        );

        if (!selectedOption) {
          setSelectedOption(
            `idEmpresa:${empresaActual?.id},idEstablecimiento:${empresaActual?.establecimiento?.id}`
          );
        }

        if (result?.data?.empresas?.length > 0) {
          const empresaActual = result?.data?.empresaActual;

          setUserGlobal({
            ...result?.data,
            empresaActual: empresaActual ?? null,
          });

          sessionStorage.setItem(
            "empresaActual",
            JSON.stringify(empresaActual ?? null)
          );
        }
      } else {
        if (result?.data?.empresas?.length > 0) {
          const empresaActual = result?.data?.empresaActual;
          console.log("empresaActual", result?.data?.empresaActual);
          setSelectedOption(
            `idEmpresa:${empresaActual?.id},idEstablecimiento:${empresaActual?.establecimiento?.id}`
          );
          // setUserGlobal({
          //   ...result?.data,
          //   empresa,
          // });
          sessionStorage.setItem(
            "empresaActual",
            JSON.stringify(empresaActual)
          );
        }
      }
    }
  }, [result, selectedOption, setUserGlobal]);

  const obtenerValoresSelect = (selectedValue: string) => {
    // Dividir el string en partes usando la coma como separador
    const partes: string[] = selectedValue.split(",");

    // Inicializar objetos para almacenar los valores
    const valores: Record<string, number> = {};

    // Iterar sobre las partes
    partes.forEach((parte: string) => {
      // Dividir cada parte en clave y valor usando ":" como separador
      const [clave, valor] = parte.split(":");

      // Almacenar el valor en el objeto
      valores[clave] = parseInt(valor); // Convertir el valor a un número entero
    });

    // Retorna los valores específicos
    return valores;
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;

    const valores = obtenerValoresSelect(selectedValue);
    const idEmpresa = valores.idEmpresa;
    const idEstablecimiento = valores.idEstablecimiento;

    const getEmpresa = userGlobal?.empresas?.find(
      (empresa) => empresa.id === idEmpresa
    );

    const getEstablecimiento = getEmpresa?.establecimientos?.find(
      (est) => est.id === idEstablecimiento
    );

    const empresa = {
      ...getEmpresa,
      establecimiento: getEstablecimiento,
    };
    console.log("cambiando empresa", empresa);

    if (empresa) {
      const cambiar = confirm("Estas seguro que quieres cambiar de sucursal?");
      if (cambiar) {
        setSelectedOption(selectedValue);
        sessionStorage.setItem("empresaActual", JSON.stringify(empresa));
        location.reload();
      }
    }
  };

  return (
    <>
      {/* absolute */}
      <header
        className={`bg-white w-full flex h-[60px] p-[10px] dark:bg-gray-700 ${
          dialogState.pageComplete &&
          dialogState.nameDialog === DialogActionKind.SCREEN_FACTURA
            ? "shadow-lg z-[1] fixed"
            : "relative"
        }`}
      >
        <div className={`w-full flex justify-between`}>
          <h1 className="font-bold dark:text-white text-">
            <img src={logo} width={130} height={50} />
          </h1>
          <div className="flex flex-row select-none">
            {result?.data?.empresas?.length === 0 && (
              <div className="mr-[20px]">
                <span className="text-primary font-medium">
                  Usted no pertenece a ninguna empresa.
                </span>
              </div>
            )}
            {result?.data?.empresas?.length > 0 && (
              <>
                <div className="mr-[20px] w-[150px]">
                  <select
                    className="w-full cursor-pointer border outline-none"
                    onChange={handleSelectChange}
                    value={selectedOption}
                  >
                    {userGlobal?.empresas?.map((item: any) => {
                      return (
                        <optgroup
                          key={item.ruc}
                          label={`${item.nombre_comercial} - ${
                            item.estado ? "Activo" : "Inactivo"
                          }`}
                        >
                          {item.establecimientos.map((est: any) => {
                            return (
                              <option
                                key={est.id}
                                disabled={!est.estado || !item.estado}
                                value={`idEmpresa:${item.id},idEstablecimiento:${est.id}`}
                              >
                                {`${est.codigo} - ${est.denominacion} -
                                ${
                                  item.estado && est.estado
                                    ? "Activo"
                                    : "Inactivo"
                                }`}
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="mr-[10px] dark:text-white font-bold">
                17:52:46 (-5)
              </label>
            </div>
            <div>
              <label
                ref={labelRef}
                onClick={handleDropdown}
                className="mr-[10px] dark:text-white font-bold cursor-pointer select-none"
              >
                {result?.data.email_usuario}
              </label>
            </div>
          </div>
          {isDropdown && (
            <div className="bg-white absolute whitespace-nowrap min-w-[150px] w-auto right-[20px] top-[30px] shadow-[0_4px_8px_rgba(0,0,0,.3)] z-[2]">
              <ul className="mt-1 mb-1 select-none">
                <li className="p-1 pl-2 pr-2 hover:bg-hover cursor-pointer">
                  Configuración de usuario
                </li>
                <li
                  onClick={closeApp}
                  className="p-1 pl-2 pr-2 hover:bg-hover cursor-pointer border-t"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
