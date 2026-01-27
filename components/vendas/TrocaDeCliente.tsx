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

interface Cliente {
  id: string;
  nome: string;
  doc?: string | null;
}

interface TrocaDeClienteProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
  loadingClientes: boolean;
  clienteSelecionado: string;
  clienteAtualId: string | null;
  onSelecionarCliente: (id: string) => void;
  onConfirmar: () => void;
  salvando: boolean;
}

export const TrocaDeCliente: React.FC<TrocaDeClienteProps> = ({
  isOpen,
  onClose,
  clientes,
  loadingClientes,
  clienteSelecionado,
  clienteAtualId,
  onSelecionarCliente,
  onConfirmar,
  salvando,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>Trocar Cliente da Venda</ModalHeader>
      <ModalBody>
        {loadingClientes ? (
          <div className="flex items-center justify-center py-8">
            <Spinner /> Carregando clientes...
          </div>
        ) : (
          <>
            <div className="mb-3">
              <span className="text-sm text-default-600">Cliente atual: </span>
              <span className="font-semibold">
                {(() => {
                  const cliente = clientes.find((c) => c.id === clienteAtualId);
                  return cliente
                    ? `${cliente.nome}${cliente.doc ? ` (${cliente.doc})` : ""}`
                    : "-";
                })()}
              </span>
            </div>
            <Autocomplete
              label="Novo Cliente"
              placeholder="Selecione o novo cliente"
              selectedKey={clienteSelecionado}
              onSelectionChange={(key) => onSelecionarCliente(key as string)}
              allowsCustomValue={false}
              defaultItems={clientes}
              className="flex-1"
            >
              {(cliente) => (
                <AutocompleteItem
                  key={cliente.id}
                  textValue={`${cliente.nome}${cliente.doc ? ` ${cliente.doc}` : ""}`}
                >
                  <div>
                    <div className="font-medium">{cliente.nome}</div>
                    {cliente.doc && (
                      <div className="text-xs text-default-500">
                        {cliente.doc}
                      </div>
                    )}
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
          disabled={!clienteSelecionado}
        >
          Salvar
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
