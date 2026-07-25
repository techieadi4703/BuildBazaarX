export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
        Relationships: any[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      // Multi-role identity RPCs (see 20260725_multi_role_identity.sql).
      my_roles: {
        Args: Record<string, never>;
        Returns: string[];
      };
      has_role: {
        Args: { p_role: string; p_user_id?: string };
        Returns: boolean;
      };
      grant_self_role: {
        Args: { p_role: string };
        Returns: undefined;
      };
      admin_grant_role: {
        Args: { p_user_id: string; p_role: string };
        Returns: undefined;
      };
      admin_revoke_role: {
        Args: { p_user_id: string; p_role: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
