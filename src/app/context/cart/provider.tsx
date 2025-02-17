'use client';

import { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { CartStateType, ActionType } from './reducer';

type StateProviderProps = {
  children: ReactNode,
  initialState: CartStateType,
  reducer: (state: CartStateType, action: ActionType) => CartStateType,
}

type StateContextType = {
  state: CartStateType;
  dispatch: Dispatch<ActionType>;
};

export const CartContext = createContext<StateContextType>({
  state: { products: [] },
  dispatch: () => null,
});

export const CartContextProvider = (
  { children, initialState, reducer }: StateProviderProps
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CartContext.Provider value={{state, dispatch}}>
      {children}
    </CartContext.Provider>
  );
};

