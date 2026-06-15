import { Slot } from "expo-router";
import { Provider } from "react-redux";
import "../globals.css";
import { ThemeProvider } from "../components/ui/theme";
import { store } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </Provider>
  );
}
