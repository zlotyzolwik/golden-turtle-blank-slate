import { supabase } from "@/integrations/supabase/client";

export interface VoucherValidationResult {
  isValid: boolean;
  voucherId?: string;
  amount?: number;
  currency?: string;
  expiresAt?: string;
  errorMessage?: string;
}

/**
 * Safely validate a voucher by its code without exposing sensitive data
 * Uses secure database function to prevent data leakage
 */
export async function validateVoucherByCode(voucherCode: string): Promise<VoucherValidationResult> {
  try {
    const { data, error } = await supabase.rpc('validate_voucher_by_code', {
      voucher_code: voucherCode
    });

    if (error) {
      console.error('Voucher validation error:', error);
      return {
        isValid: false,
        errorMessage: 'Wystąpił błąd podczas sprawdzania vouchera'
      };
    }

    if (!data || data.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Voucher nie został znaleziony'
      };
    }

    const result = data[0];
    
    return {
      isValid: result.is_valid,
      voucherId: result.voucher_id,
      amount: result.amount,
      currency: result.currency,
      expiresAt: result.expires_at,
      errorMessage: !result.is_valid ? 'Voucher jest nieważny lub wygasł' : undefined
    };
  } catch (error) {
    console.error('Unexpected error during voucher validation:', error);
    return {
      isValid: false,
      errorMessage: 'Wystąpił nieoczekiwany błąd'
    };
  }
}

/**
 * Safely use/redeem a voucher by its code
 * Marks the voucher as used and returns the voucher details
 */
export async function useVoucherByCode(voucherCode: string): Promise<{
  success: boolean;
  message: string;
  voucherId?: string;
  amount?: number;
}> {
  try {
    const { data, error } = await supabase.rpc('use_voucher_by_code', {
      voucher_code: voucherCode
    });

    if (error) {
      console.error('Voucher usage error:', error);
      return {
        success: false,
        message: 'Wystąpił błąd podczas wykorzystywania vouchera'
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Nie udało się wykorzystać vouchera'
      };
    }

    const result = data[0];
    
    return {
      success: result.success,
      message: result.message,
      voucherId: result.voucher_id,
      amount: result.amount
    };
  } catch (error) {
    console.error('Unexpected error during voucher usage:', error);
    return {
      success: false,
      message: 'Wystąpił nieoczekiwany błąd'
    };
  }
}