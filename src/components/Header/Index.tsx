import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import logo from "../../assets/logo_systemfact.png";
import { ModalContext } from "../../context/modalContext";
import { storage } from "../../utils/storage";

const Header = ({ result }: any) => {
  const { setUserGlobal, userGlobal } = useContext(ModalContext);
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

      if (sessionStorage.getItem("empresa")) {
        const empresa = JSON.parse(String(sessionStorage.getItem("empresa")));

        if (!selectedOption) {
          setSelectedOption(
            `idEmpresa:${empresa?.id},idEstablecimiento:${empresa?.establecimiento?.id}`
          );
        }

        setUserGlobal({
          ...result?.data,
          empresaActual: empresa ?? null,
        });
      } else {
        if (result?.data?.empresas?.length > 0) {
          const empresa = {
            id: result?.data?.empresas[0].id,
            logo: result?.data?.empresas[0].logo,
            nombre_comercial: result?.data?.empresas[0].nombre_comercial,
            ruc: result?.data?.empresas[0].ruc,
            establecimiento: result?.data?.empresas[0].establecimientos[0],
            estado: result?.data.empresas[0].estado,
          };

          setSelectedOption(
            `idEmpresa:${empresa?.id},idEstablecimiento:${empresa?.establecimiento?.id}`
          );
          setUserGlobal({
            ...result?.data,
            empresa,
          });
          sessionStorage.setItem("empresa", JSON.stringify(empresa));
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

    const getEmpresa = userGlobal?.empresas.find(
      (empresa: any) => empresa.id === idEmpresa
    );
    const getEstablecimiento = getEmpresa?.establecimientos.find(
      (est: any) => est.id === idEstablecimiento
    );

    const empresa = {
      id: getEmpresa?.id,
      logo: getEmpresa?.logo,
      nombre_comercial: getEmpresa?.nombre_comercial,
      ruc: getEmpresa?.ruc,
      estado: getEmpresa?.estado,
      establecimiento: getEstablecimiento,
    };

    if (empresa) {
      const cambiar = confirm("Estas seguro que quieres cambiar de sucursal?");
      if (cambiar) {
        setSelectedOption(selectedValue);
        sessionStorage.setItem("empresa", JSON.stringify(empresa));
        location.reload();
      }
    }
  };

  return (
    <>
      <header className="bg-white w-full flex justify-between dark:bg-gray-700 p-[10px] h-[60px] absolute">
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
          <div className="absolute whitespace-nowrap min-w-[150px] w-auto right-[20px] top-[30px] shadow-[0_4px_8px_rgba(0,0,0,.3)] z-[1]">
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
      </header>
    </>
  );
};

export default Header;
