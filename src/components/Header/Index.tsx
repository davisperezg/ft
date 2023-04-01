import logo from "../../assets/logo_systemfact.png";

const Header = () => {
  return (
    <header className="bg-white w-full flex justify-between dark:bg-gray-700 p-[10px] h-[60px] absolute">
      <h1 className="font-bold dark:text-white text-">
        <img src={logo} width={130} height={50} />
      </h1>
      <div className="flex flex-row">
        <label className="mr-[10px] dark:text-white font-bold">
          17:52:46 (-5)
        </label>
        <label className="mr-[10px] dark:text-white font-bold">
          Mi usuario
        </label>
      </div>
    </header>
  );
};

export default Header;
