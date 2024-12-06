import LoginForm from "../components/LoginForm";

const LoginScreen = () => {
  return (
    <div className="flex absolute top-[0px] bottom-[0px] left-[0px] right-[0px] justify-center items-center bg-bordersAux">
      <div className="border rounded-md w-[400px] h-auto flex flex-col  bg-white shadow-lg shadow-borders-500/50">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginScreen;
