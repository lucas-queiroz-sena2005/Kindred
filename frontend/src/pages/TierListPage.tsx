import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TierList } from "../features/tierlist/components/TierList";
import type { TierListTemplateData } from "../types/tierlist";

async function fetchTemplate(
  templateId: string
): Promise<TierListTemplateData> {
  const response = await fetch(`/api/templates/${templateId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

function TierListPage(): React.ReactElement {
  const { templateId } = useParams();

  const { data, isLoading, isError, error } = useQuery<
    TierListTemplateData,
    Error
  >({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
  });

  if (!templateId) {
    return (
      <p className="text-center py-8 text-red-500">No template ID provided.</p>
    );
  }

  if (isError) {
    return (
      <p className="text-center py-8 text-red-500">Error: {error.message}</p>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{data?.title || "Tier List"}</h1>
      <p className="mb-6 text-gray-600">{data?.description}</p>

      <TierList templateData={data} isLoading={isLoading} />
    </>
  );
}

export default TierListPage;