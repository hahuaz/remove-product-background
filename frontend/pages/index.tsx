import { Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  useEffect(() => {
    async function getData() {
      const response = await fetch("/api/test");
      const data = await response.json();
      console.log(data);
    }

    getData();

    return () => {};
  }, []);

  return (
    <Page fullWidth>
      <TitleBar title={"hello world!"} primaryAction={undefined} />
      <Layout>
        <Layout.Section>
          <p>{t("HomePage.heading")}</p>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
