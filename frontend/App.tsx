import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";

// TODO tailwind may reset style of polaris if it's imported after polaris. Need to investigate.
import "@/assets/styles/tailwind.css";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  Routes,
} from "@/components";

export default function App() {
  const { t } = useTranslation();

  // Any .tsx or .jsx files in /pages will become a route
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  // TODO: app context provider
  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: t("NavigationMenu.home"),
                  destination: "/",
                },
                {
                  label: t("NavigationMenu.pageName"),
                  destination: "/pagename",
                },
              ]}
            />
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
