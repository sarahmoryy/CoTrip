import { Slot } from "expo-router";
import { Provider } from "react-redux";
import "../globals.css";
import { store } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
