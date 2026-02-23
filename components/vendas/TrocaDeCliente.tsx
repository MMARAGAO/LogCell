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
              allowsCustomValue={false}
              className="flex-1"
              defaultItems={clientes}
              label="Novo Cliente"
              placeholder="Selecione o novo cliente"
              selectedKey={clienteSelecionado}
              onSelectionChange={(key) => onSelecionarCliente(key as string)}
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
        <Button disabled={salvando} variant="light" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          color="primary"
          disabled={!clienteSelecionado}
          isLoading={salvando}
          onClick={onConfirmar}
        >
          Salvar
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
