import { createContext, useContext } from 'react';

const StatesContext = createContext(null);
const StateSettersContext = createContext(null);

export function StatesProvider({
    states,
    stateSetters,
    children
}) {
  
    return (
      <StatesContext.Provider value={states}>
        <StateSettersContext.Provider value={stateSetters}>
          {children}
        </StateSettersContext.Provider>
      </StatesContext.Provider>
    );
}

export function useStates() {
    const context = useContext(StatesContext);
    if (context === undefined) {
      throw new Error("useStates must be used within a StatesProvider");
    }
    return context;
}

export function useStateSetters() {
  const context = useContext(StateSettersContext);
  if (context === undefined) {
    throw new Error("useStateSetters must be used within a StateSettersProvider");
  }
  return context;
}


// const ConfigContext = createContext(null);

// export function ConfigProvider({
//     configData,
//     configDataSetter,
//     children
// }) {
  
//     return (
//       <ConfigContext.Provider value={{configData, configDataSetter}}>
//           {children}
//       </ConfigContext.Provider>
//     );
// }

// export function useConfig() {
//     const context = useContext(ConfigContext);
//     if (context === undefined) {
//       throw new Error("useConfig must be used within a ConfigProvider");
//     }
//     return context;
// }
