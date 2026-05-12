-- KISS single FOR ALL policy template (owner-only by column user_id)
ALTER TABLE :table ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ":table_kiss_all" ON :table;
CREATE POLICY ":table_kiss_all"
ON :table
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
