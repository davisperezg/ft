import Main from "./components/Main";
import { ModalProvider } from "./context/modalContext";

function App() {
  return (
    <ModalProvider>
      <Main />
    </ModalProvider>
  );
}

export default App;
