import NavModItem from "./NavModItem";
import { useUserStore } from "../../../store/zustand/user-zustand";

const NavLeft = ({ clicked }: { clicked: number }) => {
  const userGlobal = useUserStore((state) => state.userGlobal);
  return (
    <div className="flex flex-[0_0_300px] flex-col  relative dark:bg-slate  -700">
      <dl className="flex flex-[1_1_100%] min-h-0 flex-col">
        {userGlobal?.rol?.modulos.map((modulo, i: number) => {
          return (
            <NavModItem
              key={i + 1}
              modulo={modulo}
              clicked={clicked}
              position={i}
            />
          );
        })}
      </dl>
    </div>
  );
};

export default NavLeft;
