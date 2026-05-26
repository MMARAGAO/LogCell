-- Adiciona coluna is_tecnico à tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_tecnico BOOLEAN DEFAULT false;

-- Migrar dados existentes: tecnicos que tem usuario_id viram usuarios.is_tecnico = true
UPDATE usuarios SET is_tecnico = true
WHERE id IN (SELECT usuario_id FROM tecnicos WHERE usuario_id IS NOT NULL);
