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
import type { Usuario } from "@/types";

interface TrocaDeVendedorProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  loadingUsuarios: boolean;
  vendedorSelecionado: string;
  vendedorAtualId: string | null;
  onSelecionarVendedor: (id: string) => void;
  onConfirmar: () => void;
  salvando: boolean;
}

export const TrocaDeVendedor: React.FC<TrocaDeVendedorProps> = ({
  isOpen,
  onClose,
  usuarios,
  loadingUsuarios,
  vendedorSelecionado,
  vendedorAtualId,
  onSelecionarVendedor,
  onConfirmar,
  salvando,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>Trocar Vendedor da Venda</ModalHeader>
      <ModalBody>
        {loadingUsuarios ? (
          <div className="flex items-center justify-center py-8">
            <Spinner /> Carregando usuários...
          </div>
        ) : (
          <>
            <div className="mb-3">
              <span className="text-sm text-default-600">Vendedor atual: </span>
              <span className="font-semibold">
                {(() => {
                  const vendedor = usuarios.find(
                    (u) => u.id === vendedorAtualId
                  );
                  return vendedor
                    ? `${vendedor.nome} (${vendedor.email})`
                    : "-";
                })()}
              </span>
            </div>
            <Autocomplete
              label="Novo Vendedor"
              placeholder="Selecione o novo vendedor"
              selectedKey={vendedorSelecionado}
              onSelectionChange={(key) => onSelecionarVendedor(key as string)}
              allowsCustomValue={false}
              defaultItems={usuarios}
              className="flex-1"
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
        <Button variant="light" onClick={onClose} disabled={salvando}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={onConfirmar}
          isLoading={salvando}
          disabled={!vendedorSelecionado}
        >
          Salvar
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
