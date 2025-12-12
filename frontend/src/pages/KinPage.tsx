import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { KinUserCard } from "../components/KinUserCard";

function KinPage(): React.ReactElement {
  const { data: kinList, isLoading, isError } = useQuery({
    queryKey: ["kin"],
    queryFn: api.users.getKin,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 animate-pulse">Buscando seus Kin...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro ao carregar usuários compatíveis. Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (!kinList || kinList.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
        <h2 className="text-xl font-semibold mb-2">Nenhum Kin encontrado ainda</h2>
        <p className="text-neutral-600">
          Tente ranquear mais filmes para melhorarmos seu perfil de gosto!
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">My Kin</h1>
        <p className="text-neutral-600 mt-2">
          Pessoas que compartilham o mesmo "DNA cinematográfico" que você.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kinList.map((kinUser) => (
          <KinUserCard key={kinUser.userId} user={kinUser} />
        ))}
      </section>
    </>
  );
}

export default KinPage;
