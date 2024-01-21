import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";

console.log(import.meta.env.VITE_SHOPIFY_API_KEY);

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  Routes,
} from "@/components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
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
