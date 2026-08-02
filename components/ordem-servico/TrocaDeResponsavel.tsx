import type { Usuario } from "@/types";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

interface TrocaDeResponsavelProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  loadingUsuarios: boolean;
  responsavelSelecionado: string;
  responsavelAtualId: string | null;
  onSelecionarResponsavel: (id: string) => void;
  onConfirmar: () => void;
  salvando: boolean;
}

export const TrocaDeResponsavel: React.FC<TrocaDeResponsavelProps> = ({
  isOpen,
  onClose,
  usuarios,
  loadingUsuarios,
  responsavelSelecionado,
  responsavelAtualId,
  onSelecionarResponsavel,
  onConfirmar,
  salvando,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>Trocar Responsável pela OS</ModalHeader>
      <ModalBody>
        {loadingUsuarios ? (
          <div className="flex items-center justify-center py-8">
            <Spinner /> Carregando usuários...
          </div>
        ) : (
          <>
            <div className="mb-3">
              <span className="text-sm text-default-600">
                Responsável atual:{" "}
              </span>
              <span className="font-semibold">
                {(() => {
                  const responsavel = usuarios.find(
                    (u) => u.id === responsavelAtualId,
                  );

                  return responsavel
                    ? `${responsavel.nome} (${responsavel.email})`
                    : "-";
                })()}
              </span>
            </div>
            <Autocomplete
              allowsCustomValue={false}
              className="flex-1"
              defaultItems={usuarios}
              label="Novo Responsável"
              placeholder="Selecione o novo responsável"
              selectedKey={responsavelSelecionado}
              onSelectionChange={(key) =>
                onSelecionarResponsavel(key as string)
              }
            >
              {(usuario) => (
                <AutocompleteItem
                  key={usuario.id}
                  textValue={`${usuario.nome} ${usuario.email}`}
                >
                  <div>
                    <div className="font-medium">{usuario.nome}</div>
                    <div className="text-xs text-default-500">
                      {usuario.email}
                    </div>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button disabled={salvando} variant="light" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          color="primary"
          disabled={!responsavelSelecionado}
          isLoading={salvando}
          onClick={onConfirmar}
        >
          Salvar
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
