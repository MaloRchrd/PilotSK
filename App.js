import React from "react";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { AppNavigator } from "./navigation/navigation.component";
import { default as light } from "./assets/theme/light-theme";
import { dark } from "./assets/theme/light-theme";
import { ThemeContext } from "./assets/theme/theme-context";

export default () => {
  const [theme, setTheme] = React.useState("light");
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ApplicationProvider {...eva} theme={eva[theme]}>
          <AppNavigator />
        </ApplicationProvider>
      </ThemeContext.Provider>
    </>
  );
};
