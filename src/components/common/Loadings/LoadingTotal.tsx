import logo from "../../../assets/images/logo_systemfact.png";

interface Props {
  fullscreen?: boolean;
}

const LoadingTotal = ({ fullscreen = false }: Props) => {
  return (
    <div
      className={`bg-dialog left-0 top-0 z-[2] w-full h-full flex justify-center items-center ${
        fullscreen ? "fixed" : "absolute"
      }`}
    >
      <div className="w-[200px] h-[250px] bg-white flex flex-col items-center">
        <div className="mt-5 text-sm w-full text-center">
          <span>Cargando...</span>
        </div>
        <div className="flex flex-[1_1_auto] w-full justify-center items-center p-4">
          <img className="" src={logo} alt="SytemFact" />
        </div>
      </div>
    </div>
  );
};

export default LoadingTotal;
