-- Check if foreign key constraint already exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_reservations_voucher_code'
    ) THEN
        ALTER TABLE reservations 
        ADD CONSTRAINT fk_reservations_voucher_code 
        FOREIGN KEY (voucher_code_used) 
        REFERENCES vouchers(code) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for better performance on voucher code lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_reservations_voucher_code_used 
ON reservations(voucher_code_used) 
WHERE voucher_code_used IS NOT NULL;