"""
Script de Migração - Banco Antigo para Banco Novo
==================================================
Migra todos os dados do banco antigo para o novo banco Supabase
"""

import os
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime
from supabase import create_client, Client
from tqdm import tqdm
import json

# =====================================================
# CONFIGURAÇÕES DOS BANCOS
# =====================================================

# Banco ANTIGO
BANCO_ANTIGO_URL = "https://yyqpqkajqukqkmrgzgsu.supabase.co"
BANCO_ANTIGO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cXBxa2FqcXVrcWttcmd6Z3N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5OTM2NSwiZXhwIjoyMDcwNTc1MzY1fQ.cAs4EdyJ2COWl5d8cL2nY_S8qgPzAUuZRzoJ0Q_bTbA"

# Banco NOVO
BANCO_NOVO_URL = "https://qyzjvkthuuclsyjeweek.supabase.co"
BANCO_NOVO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5emp2a3RodXVjbHN5amV3ZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1ODg5MywiZXhwIjoyMDc4MTM0ODkzfQ.GYvohDeM3W7RNI0eaXrOoiAyFKa5x9LR2HZjerORCCQ"

# Clientes Supabase
supabase_antigo: Client = create_client(BANCO_ANTIGO_URL, BANCO_ANTIGO_KEY)
supabase_novo: Client = create_client(BANCO_NOVO_URL, BANCO_NOVO_KEY)

# Dicionários de mapeamento (ID antigo -> ID novo)
mapeamento_clientes: Dict[int, str] = {}
mapeamento_produtos: Dict[int, str] = {}
mapeamento_vendas: Dict[int, str] = {}
mapeamento_caixas: Dict[int, str] = {}

# Estatísticas
estatisticas = {
    "lojas": 0,
    "usuarios": 0,
    "clientes": 0,
    "fornecedores": 0,
    "produtos": 0,
    "estoque_lojas": 0,
    "fotos_produtos": 0,
    "caixas": 0,
    "vendas": 0,
    "itens_venda": 0,
    "pagamentos_venda": 0,
    "devolucoes": 0,
    "sangrias": 0,
    "permissoes": 0,
    "creditos_cliente": 0,
    "erros": []
}


def log(mensagem: str, tipo: str = "INFO"):
    """Exibe mensagem com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{tipo}] {mensagem}")


def confirmar_migracao():
    """Pede confirmação do usuário antes de iniciar"""
    print("\n" + "=" * 60)
    print("MIGRAÇÃO DE BANCO DE DADOS")
    print("=" * 60)
    print(f"\nBANCO ANTIGO: {BANCO_ANTIGO_URL}")
    print(f"BANCO NOVO:   {BANCO_NOVO_URL}")
    print("\n⚠️  ATENÇÃO: Esta operação irá:")
    print("   - Ler todos os dados do banco antigo")
    print("   - Inserir no banco novo")
    print("   - NÃO apaga dados do banco antigo")
    print("   - Pode sobrescrever dados no banco novo")
    print("\n")
    
    resposta = input("Deseja continuar? (digite 'SIM' para confirmar): ")
    if resposta.strip().upper() != "SIM":
        print("❌ Migração cancelada pelo usuário.")
        sys.exit(0)
    
    print("\n✅ Iniciando migração...\n")


def migrar_lojas():
    """Migra lojas e suas fotos"""
    log("Iniciando migração de LOJAS...")
    
    try:
        # Buscar lojas do banco antigo
        resultado = supabase_antigo.table("lojas").select("*").execute()
        lojas = resultado.data
        
        log(f"Encontradas {len(lojas)} lojas no banco antigo")
        
        for loja in tqdm(lojas, desc="Migrando lojas"):
            # Inserir loja no banco novo
            dados_loja = {
                "id": loja["id"],
                "nome": loja["nome"],
                "telefone": loja.get("telefone"),
                "endereco": loja.get("endereco"),
                "ativo": True,
                "criado_em": loja.get("createdat", datetime.now().isoformat()),
                "atualizado_em": loja.get("updatedat", datetime.now().isoformat())
            }
            
            supabase_novo.table("lojas").upsert(dados_loja).execute()
            estatisticas["lojas"] += 1
            
            # Migrar fotos da loja se existirem
            if loja.get("fotourl") and len(loja["fotourl"]) > 0:
                for idx, url in enumerate(loja["fotourl"]):
                    foto_loja = {
                        "loja_id": loja["id"],
                        "url": url,
                        "ordem": idx,
                        "is_principal": idx == 0,
                        "criado_em": datetime.now().isoformat()
                    }
                    supabase_novo.table("lojas_fotos").insert(foto_loja).execute()
        
        log(f"✅ {estatisticas['lojas']} lojas migradas com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar lojas: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Lojas: {str(e)}")


def migrar_usuarios():
    """Migra usuários e fotos de perfil"""
    log("Iniciando migração de USUÁRIOS...")
    
    try:
        resultado = supabase_antigo.table("usuarios").select("*").execute()
        usuarios = resultado.data
        
        log(f"Encontrados {len(usuarios)} usuários no banco antigo")
        
        for usuario in tqdm(usuarios, desc="Migrando usuários"):
            dados_usuario = {
                "id": usuario["uuid"],
                "nome": usuario.get("nome"),
                "email": usuario.get("email"),
                "telefone": usuario.get("telefone"),
                "cpf": usuario.get("cpf"),
                "ativo": True,
                "criado_em": usuario.get("createdat", datetime.now().isoformat()),
                "atualizado_em": usuario.get("updatedat", datetime.now().isoformat())
            }
            
            supabase_novo.table("usuarios").upsert(dados_usuario).execute()
            estatisticas["usuarios"] += 1
            
            # Migrar fotos de perfil
            if usuario.get("fotourl") and len(usuario["fotourl"]) > 0:
                for url in usuario["fotourl"]:
                    foto = {
                        "usuario_id": usuario["uuid"],
                        "url": url,
                        "criado_em": datetime.now().isoformat()
                    }
                    supabase_novo.table("fotos_perfil").insert(foto).execute()
        
        log(f"✅ {estatisticas['usuarios']} usuários migrados com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar usuários: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Usuários: {str(e)}")


def migrar_clientes():
    """Migra clientes e seus créditos"""
    log("Iniciando migração de CLIENTES...")
    
    try:
        resultado = supabase_antigo.table("clientes").select("*").execute()
        clientes = resultado.data
        
        log(f"Encontrados {len(clientes)} clientes no banco antigo")
        
        for cliente in tqdm(clientes, desc="Migrando clientes"):
            # Pular clientes sem telefone (campo obrigatório no novo banco)
            if not cliente.get("telefone"):
                log(f"⚠️  Cliente '{cliente.get('nome')}' sem telefone - pulando", "WARN")
                continue
            
            # Inserir cliente no banco novo
            dados_cliente = {
                "nome": cliente["nome"],
                "cpf": cliente.get("doc"),
                "telefone": cliente["telefone"],
                "email": cliente.get("email"),
                "observacoes": f"Instagram: {cliente['instagram']}" if cliente.get("instagram") else None,
                "ativo": True,
                "criado_em": cliente.get("createdat", datetime.now().isoformat()),
                "atualizado_em": cliente.get("updatedat", datetime.now().isoformat()),
                "criado_por": cliente.get("usuario_id")
            }
            
            resultado_insert = supabase_novo.table("clientes").insert(dados_cliente).execute()
            novo_id = resultado_insert.data[0]["id"]
            
            # Mapear ID antigo -> ID novo
            mapeamento_clientes[cliente["id"]] = novo_id
            estatisticas["clientes"] += 1
            
            # Migrar crédito do cliente se existir
            credito = cliente.get("credito", 0)
            if credito and credito != 0:
                dados_credito = {
                    "cliente_id": novo_id,
                    "valor_total": abs(credito),
                    "valor_utilizado": 0,
                    "saldo": abs(credito),
                    "motivo": "Migração de saldo anterior",
                    "gerado_por": cliente.get("usuario_id"),
                    "criado_em": cliente.get("createdat", datetime.now().isoformat()),
                    "tipo": "adicao" if credito >= 0 else "retirada"
                }
                supabase_novo.table("creditos_cliente").insert(dados_credito).execute()
                estatisticas["creditos_cliente"] += 1
        
        log(f"✅ {estatisticas['clientes']} clientes migrados com sucesso")
        log(f"✅ {estatisticas['creditos_cliente']} créditos migrados")
        
    except Exception as e:
        log(f"❌ Erro ao migrar clientes: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Clientes: {str(e)}")


def migrar_fornecedores():
    """Migra fornecedores"""
    log("Iniciando migração de FORNECEDORES...")
    
    try:
        resultado = supabase_antigo.table("fornecedores").select("*").execute()
        fornecedores = resultado.data
        
        log(f"Encontrados {len(fornecedores)} fornecedores no banco antigo")
        
        for fornecedor in tqdm(fornecedores, desc="Migrando fornecedores"):
            observacoes = fornecedor.get("observacoes", "")
            if fornecedor.get("site"):
                observacoes = f"Site: {fornecedor['site']}\n{observacoes}"
            
            dados_fornecedor = {
                "nome": fornecedor["nome"],
                "cnpj": fornecedor.get("doc"),
                "telefone": fornecedor.get("telefone"),
                "email": fornecedor.get("email"),
                "endereco": fornecedor.get("endereco"),
                "cep": fornecedor.get("cep"),
                "observacoes": observacoes if observacoes else None,
                "ativo": fornecedor.get("ativo", True),
                "criado_em": fornecedor.get("data_cadastro", datetime.now().isoformat()),
                "atualizado_em": datetime.now().isoformat()
            }
            
            # Adicionar criado_por apenas se existir
            if fornecedor.get("usuario_id"):
                dados_fornecedor["criado_por"] = fornecedor["usuario_id"]
            
            supabase_novo.table("fornecedores").insert(dados_fornecedor).execute()
            estatisticas["fornecedores"] += 1
        
        log(f"✅ {estatisticas['fornecedores']} fornecedores migrados com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar fornecedores: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Fornecedores: {str(e)}")


def migrar_produtos():
    """Migra produtos (estoque) e suas fotos"""
    log("Iniciando migração de PRODUTOS...")
    
    try:
        resultado = supabase_antigo.table("estoque").select("*").execute()
        produtos = resultado.data
        
        log(f"Encontrados {len(produtos)} produtos no banco antigo")
        
        for produto in tqdm(produtos, desc="Migrando produtos"):
            dados_produto = {
                "descricao": produto["descricao"],
                "modelos": produto.get("modelo"),
                "marca": produto.get("marca"),
                "preco_compra": produto.get("preco_compra"),
                "preco_venda": produto.get("preco_venda"),
                "quantidade_minima": int(produto.get("minimo", 0)),
                "ativo": True,
                "criado_em": produto.get("createdat", datetime.now().isoformat()),
                "atualizado_em": produto.get("updatedat", datetime.now().isoformat())
            }
            
            # Adicionar criado_por apenas se existir (foreign key com users)
            if produto.get("usuario_id"):
                dados_produto["criado_por"] = produto["usuario_id"]
            
            resultado_insert = supabase_novo.table("produtos").insert(dados_produto).execute()
            novo_id = resultado_insert.data[0]["id"]
            
            # Mapear ID antigo -> ID novo
            mapeamento_produtos[produto["id"]] = novo_id
            estatisticas["produtos"] += 1
            
            # Migrar fotos do produto
            if produto.get("fotourl") and len(produto["fotourl"]) > 0:
                for idx, url in enumerate(produto["fotourl"]):
                    foto = {
                        "produto_id": novo_id,
                        "url": url,
                        "nome_arquivo": f"foto_{idx + 1}.jpg",
                        "ordem": idx,
                        "is_principal": idx == 0,
                        "criado_em": datetime.now().isoformat(),
                        "criado_por": produto.get("usuario_id")
                    }
                    supabase_novo.table("fotos_produtos").insert(foto).execute()
                    estatisticas["fotos_produtos"] += 1
        
        log(f"✅ {estatisticas['produtos']} produtos migrados com sucesso")
        log(f"✅ {estatisticas['fotos_produtos']} fotos de produtos migradas")
        
    except Exception as e:
        log(f"❌ Erro ao migrar produtos: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Produtos: {str(e)}")


def migrar_estoque_lojas():
    """Migra estoque por loja"""
    log("Iniciando migração de ESTOQUE POR LOJA...")
    
    try:
        resultado = supabase_antigo.table("estoque_lojas").select("*").execute()
        estoques = resultado.data
        
        log(f"Encontrados {len(estoques)} registros de estoque no banco antigo")
        
        for estoque in tqdm(estoques, desc="Migrando estoque"):
            produto_id_antigo = estoque["produto_id"]
            
            # Verificar se temos o mapeamento do produto
            if produto_id_antigo not in mapeamento_produtos:
                log(f"⚠️  Produto ID {produto_id_antigo} não encontrado - buscando no banco antigo...", "WARN")
                
                # Buscar produto no banco antigo
                try:
                    produto_antigo = supabase_antigo.table("estoque").select("*").eq("id", produto_id_antigo).execute()
                    
                    if not produto_antigo.data or len(produto_antigo.data) == 0:
                        log(f"❌ Produto ID {produto_id_antigo} não existe no banco antigo", "ERROR")
                        continue
                    
                    produto = produto_antigo.data[0]
                    
                    # Criar produto no banco novo
                    dados_produto = {
                        "descricao": produto["descricao"],
                        "modelos": produto.get("modelo"),
                        "marca": produto.get("marca"),
                        "preco_compra": produto.get("preco_compra"),
                        "preco_venda": produto.get("preco_venda"),
                        "quantidade_minima": int(produto.get("minimo", 0)),
                        "ativo": True,
                        "criado_em": produto.get("createdat", datetime.now().isoformat()),
                        "atualizado_em": produto.get("updatedat", datetime.now().isoformat())
                    }
                    
                    # Adicionar criado_por apenas se existir
                    if produto.get("usuario_id"):
                        dados_produto["criado_por"] = produto["usuario_id"]
                    
                    resultado_insert = supabase_novo.table("produtos").insert(dados_produto).execute()
                    novo_id = resultado_insert.data[0]["id"]
                    
                    # Adicionar ao mapeamento
                    mapeamento_produtos[produto_id_antigo] = novo_id
                    estatisticas["produtos"] += 1
                    
                    log(f"✅ Produto '{produto['descricao']}' criado com sucesso", "INFO")
                    
                    # Migrar fotos do produto se existirem
                    if produto.get("fotourl") and len(produto["fotourl"]) > 0:
                        for idx, url in enumerate(produto["fotourl"]):
                            foto = {
                                "produto_id": novo_id,
                                "url": url,
                                "nome_arquivo": f"foto_{idx + 1}.jpg",
                                "ordem": idx,
                                "is_principal": idx == 0,
                                "criado_em": datetime.now().isoformat(),
                                "criado_por": produto.get("usuario_id")
                            }
                            supabase_novo.table("fotos_produtos").insert(foto).execute()
                            estatisticas["fotos_produtos"] += 1
                    
                except Exception as e:
                    log(f"❌ Erro ao criar produto ID {produto_id_antigo}: {str(e)}", "ERROR")
                    continue
            
            # Agora inserir o estoque (produto já existe no mapeamento)
            dados_estoque = {
                "id_produto": mapeamento_produtos[produto_id_antigo],
                "id_loja": estoque["loja_id"],
                "quantidade": int(estoque.get("quantidade", 0)),
                "atualizado_por": estoque.get("usuario_id"),
                "atualizado_em": estoque.get("updatedat", datetime.now().isoformat())
            }
            
            supabase_novo.table("estoque_lojas").insert(dados_estoque).execute()
            estatisticas["estoque_lojas"] += 1
        
        log(f"✅ {estatisticas['estoque_lojas']} registros de estoque migrados com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar estoque: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Estoque: {str(e)}")


def migrar_caixas():
    """Migra caixas"""
    log("Iniciando migração de CAIXAS...")
    
    try:
        resultado = supabase_antigo.table("caixa").select("*").execute()
        caixas = resultado.data
        
        log(f"Encontrados {len(caixas)} caixas no banco antigo")
        
        for caixa in tqdm(caixas, desc="Migrando caixas"):
            # Pular caixas sem usuario_id (campo obrigatório)
            if not caixa.get("usuario_id"):
                log(f"⚠️  Caixa ID {caixa['id']} sem usuario_id - pulando", "WARN")
                continue
            
            dados_caixa = {
                "loja_id": caixa["loja_id"],
                "usuario_abertura": caixa["usuario_id"],
                "usuario_fechamento": caixa["usuario_id"] if caixa.get("status") == "fechado" else None,
                "data_abertura": caixa["data_abertura"],
                "data_fechamento": caixa.get("data_fechamento"),
                "saldo_inicial": caixa.get("valor_inicial", 0),
                "saldo_final": caixa.get("valor_final"),
                "status": caixa.get("status", "aberto"),
                "observacoes_abertura": caixa.get("observacoes_abertura"),
                "observacoes_fechamento": caixa.get("observacoes_fechamento"),
                "criado_em": caixa.get("created_at", datetime.now().isoformat()),
                "atualizado_em": caixa.get("updated_at", datetime.now().isoformat())
            }
            
            resultado_insert = supabase_novo.table("caixas").insert(dados_caixa).execute()
            novo_id = resultado_insert.data[0]["id"]
            
            # Mapear ID antigo -> ID novo
            mapeamento_caixas[caixa["id"]] = novo_id
            estatisticas["caixas"] += 1
        
        log(f"✅ {estatisticas['caixas']} caixas migradas com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar caixas: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Caixas: {str(e)}")


def migrar_vendas():
    """Migra vendas, itens e pagamentos"""
    log("Iniciando migração de VENDAS...")
    
    try:
        resultado = supabase_antigo.table("vendas").select("*").execute()
        vendas = resultado.data
        
        log(f"Encontradas {len(vendas)} vendas no banco antigo")
        
        for venda in tqdm(vendas, desc="Migrando vendas"):
            # Determinar status da venda
            if venda.get("status_pagamento") == "pago":
                status = "finalizada"
            elif venda.get("status_pagamento") == "pendente" and venda.get("fiado"):
                status = "pendente"
            else:
                status = "rascunho"
            
            # Buscar ID do cliente no mapeamento
            cliente_id_antigo = venda.get("id_cliente")
            cliente_id_novo = mapeamento_clientes.get(cliente_id_antigo) if cliente_id_antigo else None
            
            dados_venda = {
                "numero_venda": venda["id"],
                "cliente_id": cliente_id_novo,
                "loja_id": venda["loja_id"],
                "valor_total": venda.get("total_bruto", 0),
                "desconto_total": venda.get("desconto", 0),
                "valor_final": venda.get("total_liquido", 0),
                "status": status,
                "cancelado": False,
                "criado_em": venda.get("created_at", datetime.now().isoformat()),
                "criado_por": venda.get("usuario_id")
            }
            
            resultado_insert = supabase_novo.table("vendas").insert(dados_venda).execute()
            venda_id_novo = resultado_insert.data[0]["id"]
            
            # Mapear ID antigo -> ID novo
            mapeamento_vendas[venda["id"]] = venda_id_novo
            estatisticas["vendas"] += 1
            
            # Migrar itens da venda (extrair do JSONB)
            itens = venda.get("itens", [])
            if isinstance(itens, str):
                itens = json.loads(itens)
            
            for item in itens:
                produto_id_antigo = item.get("produto_id")
                produto_id_novo = mapeamento_produtos.get(produto_id_antigo) if produto_id_antigo else None
                
                if not produto_id_novo:
                    log(f"⚠️  Produto ID {produto_id_antigo} não encontrado para item da venda {venda['id']}", "WARN")
                    continue
                
                dados_item = {
                    "venda_id": venda_id_novo,
                    "produto_id": produto_id_novo,
                    "produto_nome": item.get("descricao", "Produto sem nome"),
                    "produto_codigo": item.get("codigo", "SEM_CODIGO"),
                    "quantidade": int(item.get("quantidade", 1)),
                    "preco_unitario": float(item.get("preco_unitario", 0)),
                    "subtotal": float(item.get("subtotal", 0)),
                    "criado_em": venda.get("created_at", datetime.now().isoformat())
                }
                
                supabase_novo.table("itens_venda").insert(dados_item).execute()
                estatisticas["itens_venda"] += 1
            
            # Migrar pagamento da venda
            if venda.get("valor_pago", 0) > 0 or venda.get("status_pagamento") == "pago":
                forma_pagamento = venda.get("forma_pagamento", "dinheiro")
                
                # Mapear forma de pagamento antiga para nova
                mapa_forma = {
                    "dinheiro": "dinheiro",
                    "pix": "pix",
                    "credito": "cartao_credito",
                    "debito": "cartao_debito",
                    "transferencia": "transferencia"
                }
                
                dados_pagamento = {
                    "venda_id": venda_id_novo,
                    "tipo_pagamento": mapa_forma.get(forma_pagamento, "dinheiro"),
                    "valor": venda.get("valor_pago", venda.get("total_liquido", 0)),
                    "data_pagamento": (venda.get("data_pagamento") or venda.get("data_venda") or datetime.now().isoformat())[:10],
                    "criado_em": venda.get("created_at", datetime.now().isoformat()),
                    "criado_por": venda.get("usuario_id")
                }
                
                supabase_novo.table("pagamentos_venda").insert(dados_pagamento).execute()
                estatisticas["pagamentos_venda"] += 1
        
        log(f"✅ {estatisticas['vendas']} vendas migradas com sucesso")
        log(f"✅ {estatisticas['itens_venda']} itens de venda migrados")
        log(f"✅ {estatisticas['pagamentos_venda']} pagamentos migrados")
        
    except Exception as e:
        log(f"❌ Erro ao migrar vendas: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Vendas: {str(e)}")


def migrar_devolucoes():
    """Migra devoluções"""
    log("Iniciando migração de DEVOLUÇÕES...")
    
    try:
        resultado = supabase_antigo.table("devolucoes").select("*").execute()
        devolucoes = resultado.data
        
        log(f"Encontradas {len(devolucoes)} devoluções no banco antigo")
        
        for devolucao in tqdm(devolucoes, desc="Migrando devoluções"):
            venda_id_antigo = devolucao.get("id_venda")
            venda_id_novo = mapeamento_vendas.get(venda_id_antigo)
            
            if not venda_id_novo:
                log(f"⚠️  Venda ID {venda_id_antigo} não encontrada para devolução", "WARN")
                continue
            
            # Determinar tipo de devolução
            if devolucao.get("forma_reembolso") == "credito" or devolucao.get("valor_credito_gerado", 0) > 0:
                tipo = "com_credito"
            else:
                tipo = "sem_credito"
            
            dados_devolucao = {
                "venda_id": venda_id_novo,
                "tipo": tipo,
                "motivo": devolucao.get("motivo_devolucao", "Sem motivo informado"),
                "valor_total": devolucao.get("valor_total_devolvido", 0),
                "realizado_por": devolucao.get("usuario_id"),
                "criado_em": devolucao.get("created_at", datetime.now().isoformat())
            }
            
            supabase_novo.table("devolucoes_venda").insert(dados_devolucao).execute()
            estatisticas["devolucoes"] += 1
        
        log(f"✅ {estatisticas['devolucoes']} devoluções migradas com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar devoluções: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Devoluções: {str(e)}")


def migrar_sangrias():
    """Migra sangrias"""
    log("Iniciando migração de SANGRIAS...")
    
    try:
        resultado = supabase_antigo.table("sangrias").select("*").execute()
        sangrias = resultado.data
        
        log(f"Encontradas {len(sangrias)} sangrias no banco antigo")
        
        for sangria in tqdm(sangrias, desc="Migrando sangrias"):
            # Migrar apenas sangrias ativas
            if sangria.get("status", "ativa") != "ativa":
                continue
            
            caixa_id_antigo = sangria.get("caixa_id")
            caixa_id_novo = mapeamento_caixas.get(caixa_id_antigo)
            
            if not caixa_id_novo:
                log(f"⚠️  Caixa ID {caixa_id_antigo} não encontrado para sangria", "WARN")
                continue
            
            dados_sangria = {
                "caixa_id": caixa_id_novo,
                "valor": sangria["valor"],
                "motivo": sangria["motivo"],
                "criado_em": sangria.get("created_at", datetime.now().isoformat()),
                "realizado_por": sangria.get("usuario_id")
            }
            
            supabase_novo.table("sangrias_caixa").insert(dados_sangria).execute()
            estatisticas["sangrias"] += 1
        
        log(f"✅ {estatisticas['sangrias']} sangrias migradas com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar sangrias: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Sangrias: {str(e)}")


def migrar_permissoes():
    """Migra permissões de usuários"""
    log("Iniciando migração de PERMISSÕES...")
    
    try:
        resultado = supabase_antigo.table("permissoes").select("*").execute()
        permissoes = resultado.data
        
        log(f"Encontradas {len(permissoes)} permissões no banco antigo")
        
        # Buscar IDs de usuários válidos no banco novo
        usuarios_validos = supabase_novo.table("usuarios").select("id").execute()
        ids_validos = {u["id"] for u in usuarios_validos.data}
        
        for permissao in tqdm(permissoes, desc="Migrando permissões"):
            usuario_id = permissao["id"]
            
            # Pular se o usuário não existe no banco novo
            if usuario_id not in ids_validos:
                log(f"⚠️  Usuário ID {usuario_id} não existe - pulando permissão", "WARN")
                continue
            
            dados_permissao = {
                "usuario_id": usuario_id,
                "permissoes": permissao["acessos"],
                "loja_id": permissao.get("loja_id"),
                "todas_lojas": permissao.get("loja_id") is None,
                "criado_em": datetime.now().isoformat(),
                "atualizado_em": datetime.now().isoformat()
            }
            
            supabase_novo.table("permissoes").insert(dados_permissao).execute()
            estatisticas["permissoes"] += 1
        
        log(f"✅ {estatisticas['permissoes']} permissões migradas com sucesso")
        
    except Exception as e:
        log(f"❌ Erro ao migrar permissões: {str(e)}", "ERROR")
        estatisticas["erros"].append(f"Permissões: {str(e)}")


def exibir_estatisticas():
    """Exibe estatísticas finais da migração"""
    print("\n" + "=" * 60)
    print("ESTATÍSTICAS DA MIGRAÇÃO")
    print("=" * 60)
    print(f"\n✅ Lojas migradas:              {estatisticas['lojas']}")
    print(f"✅ Usuários migrados:           {estatisticas['usuarios']}")
    print(f"✅ Clientes migrados:           {estatisticas['clientes']}")
    print(f"✅ Créditos de cliente:         {estatisticas['creditos_cliente']}")
    print(f"✅ Fornecedores migrados:       {estatisticas['fornecedores']}")
    print(f"✅ Produtos migrados:           {estatisticas['produtos']}")
    print(f"✅ Fotos de produtos:           {estatisticas['fotos_produtos']}")
    print(f"✅ Registros de estoque:        {estatisticas['estoque_lojas']}")
    print(f"✅ Caixas migrados:             {estatisticas['caixas']}")
    print(f"✅ Vendas migradas:             {estatisticas['vendas']}")
    print(f"✅ Itens de venda:              {estatisticas['itens_venda']}")
    print(f"✅ Pagamentos:                  {estatisticas['pagamentos_venda']}")
    print(f"✅ Devoluções:                  {estatisticas['devolucoes']}")
    print(f"✅ Sangrias:                    {estatisticas['sangrias']}")
    print(f"✅ Permissões:                  {estatisticas['permissoes']}")
    
    if estatisticas["erros"]:
        print(f"\n⚠️  Erros encontrados:          {len(estatisticas['erros'])}")
        for erro in estatisticas["erros"]:
            print(f"   - {erro}")
    
    print("\n" + "=" * 60)


def main():
    """Função principal"""
    try:
        confirmar_migracao()
        
        # Ordem de migração (respeitando dependências)
        migrar_lojas()
        migrar_usuarios()
        migrar_clientes()
        migrar_fornecedores()
        migrar_produtos()
        migrar_estoque_lojas()
        migrar_caixas()
        migrar_vendas()
        migrar_devolucoes()
        migrar_sangrias()
        migrar_permissoes()
        
        exibir_estatisticas()
        
        log("\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!", "SUCCESS")
        
    except KeyboardInterrupt:
        log("\n⚠️  Migração interrompida pelo usuário", "WARN")
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Erro fatal na migração: {str(e)}", "ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
