-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables with updated_at
CREATE TRIGGER update_business_timestamp BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_raw_materials_timestamp BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_timestamp();
