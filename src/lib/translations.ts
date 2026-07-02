export type TranslationKey = keyof typeof FR

export const FR = {
  // Navigation
  nav_dashboard: 'Tableau de bord',
  nav_coffres: 'Coffres',
  nav_objectifs: 'Objectifs',
  nav_transactions: 'Transactions',
  nav_budget: 'Budget',
  nav_rapports: 'Rapports',
  nav_integrations: 'Intégrations',
  nav_conseils: 'Conseils IA',
  nav_recurrences: 'Récurrences',
  nav_parametres: 'Paramètres',
  nav_inbox: 'Messagerie',
  nav_funtwit: 'FunTwit',
  nav_affiliation: 'Affiliation',
  nav_pricing: 'Tarifs',

  // Common
  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  close: 'Fermer',
  confirm: 'Confirmer',
  loading: 'Chargement...',
  saving: 'Enregistrement...',
  error: 'Erreur',
  success: 'Succès',
  search: 'Rechercher',
  add: 'Ajouter',
  connect: 'Connecter',
  disconnect: 'Déconnecter',
  view_all: 'Voir tout',
  back: 'Retour',
  next: 'Suivant',
  previous: 'Précédent',
  yes: 'Oui',
  no: 'Non',
  soon: 'Bientôt disponible',

  // Auth
  login: 'Connexion',
  register: "S'inscrire",
  logout: 'Se déconnecter',
  email: 'Adresse email',
  password: 'Mot de passe',
  forgot_password: 'Mot de passe oublié ?',
  no_account: "Pas encore de compte ?",
  has_account: 'Déjà un compte ?',

  // Dashboard
  dashboard_title: 'Tableau de bord',
  balance: 'Solde total',
  income: 'Revenus',
  expenses: 'Dépenses',
  savings: 'Épargne',
  this_month: 'Ce mois',
  recent_transactions: 'Transactions récentes',

  // Parametres
  settings: 'Paramètres',
  settings_profile: 'Profil',
  settings_notifications: 'Notifications',
  settings_security: 'Sécurité',
  settings_preferences: 'Préférences',
  settings_subscription: 'Abonnement',
  currency: 'Devise principale',
  language: 'Langue',
  first_name: 'Prénom',
  last_name: 'Nom',
  phone: 'Téléphone',
  bio: 'Bio',
  location: 'Localisation',
  website: 'Site web',
  username: "Nom d'utilisateur",
  profile_saved: 'Profil enregistré !',
  display_preferences: "Préférences d'affichage",

  // Coffres
  coffres_title: 'Mes Coffres',
  coffre_new: 'Nouveau coffre',
  coffre_target: 'Objectif',
  coffre_current: 'Épargne actuelle',
  coffre_progress: 'Progression',

  // Transactions
  transaction_new: 'Nouvelle transaction',
  transaction_income: 'Revenu',
  transaction_expense: 'Dépense',
  transaction_transfer: 'Transfert',
  transaction_date: 'Date',
  transaction_amount: 'Montant',
  transaction_category: 'Catégorie',
  transaction_description: 'Description',

  // Security
  security_title: 'Sécurité du compte',
  security_safe: 'Votre compte est sécurisé.',
  new_password: 'Nouveau mot de passe',
  confirm_password: 'Confirmer le mot de passe',
  update_password: 'Mettre à jour le mot de passe',
  two_factor: 'Authentification à deux facteurs',
}

export const EN: Record<TranslationKey, string> = {
  // Navigation
  nav_dashboard: 'Dashboard',
  nav_coffres: 'Savings Vaults',
  nav_objectifs: 'Goals',
  nav_transactions: 'Transactions',
  nav_budget: 'Budget',
  nav_rapports: 'Reports',
  nav_integrations: 'Integrations',
  nav_conseils: 'AI Advice',
  nav_recurrences: 'Recurring',
  nav_parametres: 'Settings',
  nav_inbox: 'Inbox',
  nav_funtwit: 'FunTwit',
  nav_affiliation: 'Referral',
  nav_pricing: 'Pricing',

  // Common
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  confirm: 'Confirm',
  loading: 'Loading...',
  saving: 'Saving...',
  error: 'Error',
  success: 'Success',
  search: 'Search',
  add: 'Add',
  connect: 'Connect',
  disconnect: 'Disconnect',
  view_all: 'View all',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  yes: 'Yes',
  no: 'No',
  soon: 'Coming soon',

  // Auth
  login: 'Log in',
  register: 'Sign up',
  logout: 'Log out',
  email: 'Email address',
  password: 'Password',
  forgot_password: 'Forgot password?',
  no_account: "Don't have an account?",
  has_account: 'Already have an account?',

  // Dashboard
  dashboard_title: 'Dashboard',
  balance: 'Total balance',
  income: 'Income',
  expenses: 'Expenses',
  savings: 'Savings',
  this_month: 'This month',
  recent_transactions: 'Recent transactions',

  // Parametres
  settings: 'Settings',
  settings_profile: 'Profile',
  settings_notifications: 'Notifications',
  settings_security: 'Security',
  settings_preferences: 'Preferences',
  settings_subscription: 'Subscription',
  currency: 'Primary currency',
  language: 'Language',
  first_name: 'First name',
  last_name: 'Last name',
  phone: 'Phone',
  bio: 'Bio',
  location: 'Location',
  website: 'Website',
  username: 'Username',
  profile_saved: 'Profile saved!',
  display_preferences: 'Display preferences',

  // Coffres
  coffres_title: 'My Vaults',
  coffre_new: 'New vault',
  coffre_target: 'Target',
  coffre_current: 'Current savings',
  coffre_progress: 'Progress',

  // Transactions
  transaction_new: 'New transaction',
  transaction_income: 'Income',
  transaction_expense: 'Expense',
  transaction_transfer: 'Transfer',
  transaction_date: 'Date',
  transaction_amount: 'Amount',
  transaction_category: 'Category',
  transaction_description: 'Description',

  // Security
  security_title: 'Account security',
  security_safe: 'Your account is secure.',
  new_password: 'New password',
  confirm_password: 'Confirm password',
  update_password: 'Update password',
  two_factor: 'Two-factor authentication',
}

export const ES: Partial<Record<TranslationKey, string>> = {
  save: 'Guardar', cancel: 'Cancelar', login: 'Iniciar sesión', register: 'Registrarse',
  logout: 'Cerrar sesión', loading: 'Cargando...', search: 'Buscar',
  settings: 'Configuración', currency: 'Moneda principal', language: 'Idioma',
}

export const PT: Partial<Record<TranslationKey, string>> = {
  save: 'Salvar', cancel: 'Cancelar', login: 'Entrar', register: 'Cadastrar',
  logout: 'Sair', loading: 'Carregando...', search: 'Pesquisar',
  settings: 'Configurações', currency: 'Moeda principal', language: 'Idioma',
}

export const AR: Partial<Record<TranslationKey, string>> = {
  save: 'حفظ', cancel: 'إلغاء', login: 'تسجيل الدخول', register: 'إنشاء حساب',
  logout: 'تسجيل الخروج', loading: 'جارٍ التحميل...', search: 'بحث',
  settings: 'الإعدادات', currency: 'العملة الرئيسية', language: 'اللغة',
  nav_dashboard: 'لوحة التحكم', nav_transactions: 'المعاملات',
  income: 'الدخل', expenses: 'المصروفات', savings: 'المدخرات',
}

const TRANSLATIONS: Record<string, Partial<Record<TranslationKey, string>>> = {
  fr: FR, en: EN, es: ES, pt: PT, ar: AR,
}

export function t(key: TranslationKey, lang: string): string {
  return TRANSLATIONS[lang]?.[key] ?? FR[key] ?? key
}
