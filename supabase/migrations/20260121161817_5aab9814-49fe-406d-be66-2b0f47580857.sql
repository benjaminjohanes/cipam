-- Ajouter la colonne preferred_currency à la table profiles
ALTER TABLE public.profiles
ADD COLUMN preferred_currency text DEFAULT 'FCFA';

-- Ajouter une contrainte pour limiter les valeurs
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_preferred_currency_check 
CHECK (preferred_currency IN ('FCFA', 'USD'));