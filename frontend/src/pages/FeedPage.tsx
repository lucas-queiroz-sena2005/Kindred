import React, { useState, useEffect } from "react";
import { api } from "../api";
import type { TierListSummary } from "../types/tierlist";
import { TemplateCard } from "../components/TemplateCard";

function FeedPage(): React.ReactElement {
  const [data, setData] = useState<TierListSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.tierlists
      .getList()
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Feed</h1>
      {isLoading && <p>Loading tierlists...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((template) => (
            <TemplateCard key={template.id} {...template} />
          ))}
        </div>
      )}
    </>
  );
}

export default FeedPage;
