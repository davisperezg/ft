import { useContext, useEffect, useRef, useState } from "react";
import logo from "../../assets/logo_systemfact.png";
import { ModalContext } from "../../context/modalContext";
import { storage } from "../../utils/storage";

const Header = ({ result }: any) => {
  const { setUserGlobal } = useContext(ModalContext);
  const [isDropdown, setDropdown] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);

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
    }
  }, [result]);

  return (
    <>
      <header className="bg-white w-full flex justify-between dark:bg-gray-700 p-[10px] h-[60px] absolute">
        <h1 className="font-bold dark:text-white text-">
          <img src={logo} width={130} height={50} />
        </h1>
        <div className="flex flex-row select-none">
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
