import { Slot } from "expo-router";
import { Provider } from "react-redux";
import "../globals.css";
import { AppProvider } from "../components/mockup/AppContext";
import SheetsHost from "../components/mockup/SheetsHost";
import { MockThemeProvider } from "../components/mockup/theme";
import { ThemeProvider } from "../components/ui/theme";
import { store } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <MockThemeProvider>
          <AppProvider>
            <Slot />
            <SheetsHost />
          </AppProvider>
        </MockThemeProvider>
      </ThemeProvider>
    </Provider>
  );
}
