import { LegacyCard, IndexTable, Spinner } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "@shopify/app-bridge/utilities";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";

export const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const app = useAppBridge();

  const getData = async () => {
    // TODO use hook
    try {
      const response = await authenticatedFetch(app)(`/api/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {!products.length ? (
        <Spinner size="large" />
      ) : (
        <div>
          <LegacyCard>
            <IndexTable
              selectable={false}
              resourceName={{
                singular: "product",
                plural: "products",
              }}
              itemCount={products.length}
              // selectedItemsCount={
              //   allResourcesSelected ? 'All' : selectedResources.length
              // }
              // onSelectionChange={handleSelectionChange}
              headings={[
                { title: "Image" },
                { title: "Title" },
                { title: "Created At" },
                { title: "Is background removed?" },
              ]}
            >
              {products.map(({ id, title, created_at, images }, index) => (
                <IndexTable.Row
                  id={id}
                  key={id}
                  // selected={selectedResources.includes(id)}
                  position={index}
                >
                  <IndexTable.Cell className="w-20">
                    <div
                      className="w-10 h-10 cursor-pointer"
                      onClick={() => navigate(`/product-edit?productId=${id}`)}
                    >
                      <img
                        className="object-contain w-10 h-10"
                        width={80}
                        height={80}
                        src={images[0]?.src}
                        alt="product image"
                      />
                    </div>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <span
                      className="font-medium cursor-pointer"
                      onClick={() => navigate(`/product-edit?productId=${id}`)}
                    >
                      {title}
                    </span>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {new Date(created_at).toLocaleDateString()}
                  </IndexTable.Cell>
                  <IndexTable.Cell>false</IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </LegacyCard>
        </div>
      )}
    </>
  );
};
