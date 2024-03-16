import {
  Spinner,
  Thumbnail,
  Page,
  Layout,
  Card,
  Button,
  Popover,
  ActionList,
  Text,
  ButtonGroup,
  Modal,
  SkeletonThumbnail,
  Badge,
} from "@shopify/polaris";
import { useSearchParams } from "react-router-dom";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ViewIcon, EditIcon } from "@shopify/polaris-icons";
import { SketchPicker, RGBColor } from "react-color";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";

interface Product {
  title: string;
  status: string;
  images: {
    id: string;
    src: string;
  }[];
  alt: string;
  id: string;
}

interface RemovePayload {
  imageId: string;
  productId: string;
  imageSrc: string;
}

interface PreviewResponse {
  previewUrl: string;
}

export default function Other() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isPreviewModalActive, setIsPreviewModalActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<RGBColor>({
    r: 241,
    g: 112,
    b: 19,
    a: 1,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  // const [popoverActive, setPopoverActive] = useState(true);

  // const togglePopoverActive = () => {
  //   setPopoverActive(!popoverActive);
  // };

  const app = useAppBridge();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      const response = await authenticatedFetch(app)(
        `/api/remove-bg/product/${searchParams.get("productId")}`
      );
      const { product } = await response.json();
      console.log(product);
      setProduct(product);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const removeBg = async (removePayload: RemovePayload) => {
    try {
      const response = await authenticatedFetch(app)(`/api/remove-bg`, {
        method: "PUT",
        body: JSON.stringify(removePayload),
      });

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const previewBG = async (removePayload: RemovePayload) => {
    try {
      setPreviewUrl(null);
      setIsPreviewModalActive(true);
      console.log(selectedColor);
      const response = await authenticatedFetch(app)(`/api/remove-bg/preview`, {
        method: "POST",
        body: JSON.stringify({ ...removePayload, selectedColor }),
      });
      if (response.status === 201) {
        const { previewUrl } = await response.json();
        setPreviewUrl(previewUrl);
        console.log(previewUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Page
      title="Product review and edit"
      backAction={{
        content: "Products",
        onAction: () => {
          navigate("/");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          {!product ? (
            <div className="flex justify-center">
              <Spinner size="large" />
            </div>
          ) : (
            <Card
              sectioned
              // title={`${product?.title}`}
              // actions={{
              //   content: "Remove background",
              //   onAction: () => {
              //     console.log("sa");
              //   },
              // }}
            >
              <div className="flex min-h-max gap-5">
                <div>
                  <div className="m-2 space-x-2">
                    <span className="font-bold text-lg">{product.title}</span>
                    <Badge
                      status={
                        product.status === "active" ? "success" : undefined
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <img
                    src={product.images[0].src}
                    alt={product.alt}
                    className="w-[700px] rounded-lg"
                  />
                </div>
                {/* if button count is increased, use popover */}
                {/* <div style={{ height: "250px" }}>
                  <Popover
                    active={popoverActive}
                    activator={
                      <Button onClick={togglePopoverActive} disclosure>
                        Bulk Actions
                      </Button>
                    }
                    autofocusTarget="first-node"
                    onClose={togglePopoverActive}
                  >
                    <ActionList
                      actionRole="menuitem"
                      sections={[
                        {
                          title: "Bulk actions",
                          items: [
                            { content: "Edit", icon: EditIcon },
                            { content: "Delete", icon: DeleteMinor },
                          ],
                        },
                      ]}
                    />
                  </Popover>
                </div> */}
                <div className="flex flex-col justify-end mt-[36px] ">
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium mr-1">
                        Background color:
                      </span>
                      <span className="text-xs text-gray-500">
                        You can select background color for the image.
                      </span>
                    </p>
                    <SketchPicker
                      color={selectedColor}
                      onChangeComplete={(e) => setSelectedColor(e.rgb)}
                    ></SketchPicker>
                  </div>
                  <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium mr-1">Preview:</span>
                      <span className="text-xs text-gray-500">
                        Before pushing background removed image to production,
                        first preview how it looks.
                      </span>
                    </p>
                    <Button
                      icon={ViewIcon}
                      size="slim"
                      onClick={() =>
                        previewBG({
                          imageId: product.images[0].id,
                          productId: product.id,
                          imageSrc: product.images[0].src,
                        })
                      }
                    >
                      Preview
                    </Button>
                    <Modal
                      instant
                      open={isPreviewModalActive}
                      onClose={() => setIsPreviewModalActive(false)}
                      title={`Previw of ${product?.title}`}
                      secondaryActions={[
                        {
                          content: "Close",
                          onAction: () => setIsPreviewModalActive(false),
                        },
                      ]}
                    >
                      <div className="min-h-[400px] ">
                        {!previewUrl ? (
                          <div className="flex flex-col justify-center items-center min-h-[400px]">
                            <Spinner size="large" />
                            <p className="mt-2">
                              Hang tight! We're doing magic...
                            </p>
                          </div>
                        ) : (
                          <div>
                            <img
                              src={previewUrl}
                              alt={product.alt}
                              className="w-[700px] "
                            />
                          </div>
                        )}
                      </div>
                    </Modal>
                  </div>
                  <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700"></hr>

                  <div className="space-y-1">
                    <p>
                      <span className="font-medium mr-1">
                        Remove background:
                      </span>
                      <span className="text-xs text-gray-500">
                        Background of the image will be removed and pushed to
                        production. Be cautious.
                      </span>
                    </p>
                    <div>
                      <Button icon={EditIcon} destructive size="slim">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
