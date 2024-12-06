import {
  FC,
  LazyExoticComponent,
  Suspense,
  lazy,
  useEffect,
  useState,
} from "react";
import { findComponentByMenu } from "./find-component-by-menu";

// Componente Wrapper para manejar la carga dinámica con React.lazy
const DynamicComponentLoader = ({ nombreMenu }: { nombreMenu: string }) => {
  const [DynamicComponent, setDynamicComponent] =
    useState<LazyExoticComponent<FC> | null>(null);

  useEffect(() => {
    if (nombreMenu) {
      const cargarComponente = async () => {
        try {
          const Component = await findComponentByMenu(nombreMenu);
          setDynamicComponent(
            lazy(() => Promise.resolve({ default: Component }))
          );
        } catch (error) {
          console.error(error);
          setDynamicComponent(
            lazy(() =>
              Promise.resolve({
                default: () => <div>Recurso no encontrado: {nombreMenu}</div>,
              })
            )
          );
        }
      };

      cargarComponente();
    }
  }, [nombreMenu]);

  if (!DynamicComponent) {
    return <div>Cargando...</div>; // Fallback inicial mientras se resuelve
  }

  return (
    <Suspense fallback={<div>Cargando módulo...</div>}>
      <DynamicComponent />
    </Suspense>
  );
};

export default DynamicComponentLoader;
