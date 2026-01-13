"use client";

import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export function CatalogoFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Seção Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">LogCell</h3>
            <p className="text-sm mb-4">
              Sua loja de confiança para smartphones, acessórios e serviços
              técnicos especializados.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/catalogo"
                  className="hover:text-white transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo?tipo=aparelhos"
                  className="hover:text-white transition-colors"
                >
                  Aparelhos
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo?tipo=produtos"
                  className="hover:text-white transition-colors"
                >
                  Acessórios
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo/carrinho"
                  className="hover:text-white transition-colors"
                >
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trocas e Devoluções
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Garantia
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FaPhone className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">WhatsApp</p>
                  <a
                    href="tel:11999999999"
                    className="hover:text-white transition-colors"
                  >
                    (11) 99999-9999
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <FaEnvelope className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">E-mail</p>
                  <a
                    href="mailto:contato@logcell.com.br"
                    className="hover:text-white transition-colors"
                  >
                    contato@logcell.com.br
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Endereço</p>
                  <p className="text-gray-400">
                    Rua Exemplo, 123
                    <br />
                    São Paulo - SP
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seção de Pagamento e Segurança */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              <p>Formas de Pagamento</p>
              <div className="flex gap-2 mt-2">
                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">
                  PIX
                </div>
                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">
                  Cartão
                </div>
                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">
                  Boleto
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <p>🔒 Ambiente Seguro</p>
              <p className="text-xs mt-1">Seus dados estão protegidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} LogCell. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
