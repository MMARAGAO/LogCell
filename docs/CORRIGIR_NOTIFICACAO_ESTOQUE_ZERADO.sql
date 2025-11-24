-- CORRIGIR NOTIFICAÇÃO DE ESTOQUE ZERADO
-- Adicionar verificação para quando estoque chega a zero

CREATE OR REPLACE FUNCTION verificar_estoque_e_notificar()
RETURNS TRIGGER AS $$
DECLARE
  v_produto_nome TEXT;
  v_loja_nome TEXT;
  v_estoque_minimo INTEGER;
BEGIN
  -- Buscar informações do produto e loja
  SELECT p.descricao, l.nome, p.estoque_minimo
  INTO v_produto_nome, v_loja_nome, v_estoque_minimo
  FROM produtos p
  CROSS JOIN lojas l
  WHERE p.id = NEW.id_produto AND l.id = NEW.id_loja;

  -- NOTIFICAÇÃO DE ESTOQUE ZERADO (prioridade alta)
  IF NEW.quantidade = 0 AND OLD.quantidade > 0 THEN
    INSERT INTO notificacoes (
      tipo,
      titulo,
      mensagem,
      prioridade,
      categoria,
      dados_json
    ) VALUES (
      'estoque_zerado',
      'Estoque Zerado',
      'O estoque de "' || v_produto_nome || '" ZEROU na loja "' || v_loja_nome || '". Reposição urgente necessária!',
      'alta',
      'estoque zerado',
      jsonb_build_object(
        'produto_id', NEW.id_produto,
        'produto_nome', v_produto_nome,
        'loja_id', NEW.id_loja,
        'loja_nome', v_loja_nome,
        'quantidade_atual', NEW.quantidade
      )
    );
  END IF;

  -- NOTIFICAÇÃO DE ESTOQUE BAIXO (quando está abaixo do mínimo mas não zerado)
  IF NEW.quantidade > 0 AND NEW.quantidade < v_estoque_minimo AND 
     (OLD.quantidade IS NULL OR OLD.quantidade >= v_estoque_minimo) THEN
    INSERT INTO notificacoes (
      tipo,
      titulo,
      mensagem,
      prioridade,
      categoria,
      dados_json
    ) VALUES (
      'estoque_baixo',
      'Estoque Baixo',
      'O estoque de "' || v_produto_nome || '" esta baixo na loja "' || v_loja_nome || '". Quantidade atual: ' || NEW.quantidade || ' (minimo: ' || v_estoque_minimo || ').',
      'media',
      'estoque baixo',
      jsonb_build_object(
        'produto_id', NEW.id_produto,
        'produto_nome', v_produto_nome,
        'loja_id', NEW.id_loja,
        'loja_nome', v_loja_nome,
        'quantidade_atual', NEW.quantidade,
        'estoque_minimo', v_estoque_minimo
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar a trigger
DROP TRIGGER IF EXISTS trigger_notificar_estoque ON estoque_lojas;

CREATE TRIGGER trigger_notificar_estoque
  AFTER UPDATE ON estoque_lojas
  FOR EACH ROW
  WHEN (NEW.quantidade <> OLD.quantidade)
  EXECUTE FUNCTION verificar_estoque_e_notificar();

-- Verificar se funcionou
SELECT 'Trigger de notificação de estoque atualizada com sucesso!' as status;
