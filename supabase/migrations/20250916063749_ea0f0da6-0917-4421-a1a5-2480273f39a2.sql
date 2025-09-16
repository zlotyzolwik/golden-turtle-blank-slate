-- Add UNIQUE constraint on vouchers.code to enable foreign key reference
ALTER TABLE vouchers ADD CONSTRAINT vouchers_code_unique UNIQUE (code);

-- Add foreign key constraint from reservations.voucher_code_used to vouchers.code
ALTER TABLE reservations 
ADD CONSTRAINT fk_reservations_voucher_code 
FOREIGN KEY (voucher_code_used) 
REFERENCES vouchers(code) 
ON DELETE SET NULL;

-- Add index for better performance on voucher code lookups
CREATE INDEX idx_reservations_voucher_code_used 
ON reservations(voucher_code_used) 
WHERE voucher_code_used IS NOT NULL;