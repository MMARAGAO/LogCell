"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { FotoPerfilService } from "@/services/fotoPerfilService";
import { FotoPerfilUpload } from "@/components/perfil/FotoPerfilUpload";
import { EditarPerfilForm } from "@/components/perfil/EditarPerfilForm";
import { AlterarSenhaForm } from "@/components/perfil/AlterarSenhaForm";
import { FotoPerfil } from "@/types";

export default function PerfilPage() {
  const { usuario, carregarUsuario } = useAuthContext();
  const [fotoAtual, setFotoAtual] = useState<FotoPerfil | null>(null);
  const [loadingFoto, setLoadingFoto] = useState(true);

  useEffect(() => {
    if (usuario) {
      carregarFoto();
    }
  }, [usuario]);

  const carregarFoto = async () => {
    if (!usuario) return;

    setLoadingFoto(true);
    try {
      const foto = await FotoPerfilService.getFotoAtual(usuario.id);
      setFotoAtual(foto);
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    } finally {
      setLoadingFoto(false);
    }
  };

  const handleUploadSuccess = async () => {
    await carregarFoto();
    await carregarUsuario();
  };

  const handlePerfilSuccess = async () => {
    await carregarUsuario();
  };

  if (!usuario) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Foto de Perfil */}
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center py-8">
            {loadingFoto ? (
              <Spinner size="lg" />
            ) : (
              <FotoPerfilUpload
                usuarioId={usuario.id}
                usuarioNome={usuario.nome}
                fotoAtual={fotoAtual}
                onUploadSuccess={handleUploadSuccess}
              />
            )}

            <Divider className="my-6" />

            <div className="w-full space-y-3">
              <div className="text-center">
                <p className="text-sm text-default-500">Status</p>
                <Chip
                  color={usuario.ativo ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                  className="mt-1"
                >
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </Chip>
              </div>

              <Divider />

              <div className="text-center">
                <p className="text-sm text-default-500">Membro desde</p>
                <p className="font-medium mt-1">
                  {new Date(usuario.criado_em).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <Divider />

              <div className="text-center">
                <p className="text-sm text-default-500">Última atualização</p>
                <p className="font-medium mt-1">
                  {new Date(usuario.atualizado_em).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Coluna 2: Editar Perfil e Alterar Senha */}
        <div className="lg:col-span-2 space-y-6">
          <EditarPerfilForm usuario={usuario} onSuccess={handlePerfilSuccess} />
          <AlterarSenhaForm />
        </div>
      </div>
    </div>
  );
}
