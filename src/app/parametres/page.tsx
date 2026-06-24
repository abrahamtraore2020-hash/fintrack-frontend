'use client'
import { useState } from 'react'
import { User, Bell, Shield, Globe, CreditCard, LogOut, ChevronRight, Camera, Check, Plus, Trash2, Link2, Instagram, Twitter, Facebook, Youtube, Linkedin } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const SECTIONS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'preferences', label: 'Préférences', icon: Globe },
  { id: 'subscription', label: 'Abonnement', icon: CreditCard },
]

export default function ParametresPage() {
  const { user, currency, lang, setCurrency, setLang } = useAppStore()
  const { signOut } = useAuth()
  const [section, setSection] = useState('profile')
  const [notifs, setNotifs] = useState({ email: true, push: true, weekly: true, monthly: true, alerts: true })
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
  })
  const [links, setLinks] = useState([
    { id: '1', platform: 'instagram', url: '' },
  ])

  const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/votrepseudo' },
    { id: 'twitter',   label: 'X / Twitter', icon: Twitter,   placeholder: 'https://x.com/votrepseudo' },
    { id: 'facebook',  label: 'Facebook',  icon: Facebook,  placeholder: 'https://facebook.com/votreprofil' },
    { id: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,  placeholder: 'https://linkedin.com/in/votrepseudo' },
    { id: 'youtube',   label: 'YouTube',   icon: Youtube,   placeholder: 'https://youtube.com/@votrechaine' },
    { id: 'other',     label: 'Autre lien', icon: Link2,    placeholder: 'https://votresite.com' },
  ]

  const addLink = () => setLinks(p => [...p, { id: `l-${Date.now()}`, platform: 'other', url: '' }])
  const removeLink = (id: string) => setLinks(p => p.filter(l => l.id !== id))
  const updateLink = (id: string, field: string, val: string) =>
    setLinks(p => p.map(l => l.id === id ? { ...l, [field]: val } : l))

  const handleSave = () => toast.success('Modifications enregistrées !')

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          <span className="text-glow-blue">Paramètres</span>
        </h1>
        <p className="text-sm text-gray-500">Gérez votre compte et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            {/* Avatar */}
            <div className="flex flex-col items-center py-4 mb-2 border-b border-gray-100 dark:border-dark-border">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-400 flex items-center justify-center text-lg font-bold text-[#1A1A2E]">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <button className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                  <Camera size={10} className="text-[#1A1A2E]" />
                </button>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{profile.firstName} {profile.lastName}</p>
              <Badge variant="gold" className="mt-1">Plan Starter</Badge>
            </div>
            {SECTIONS.map(s => {
              const Icon = s.icon
              return (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-0.5',
                    section === s.id ? 'bg-gold-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg')}>
                  <Icon size={14} />
                  {s.label}
                  <ChevronRight size={12} className="ml-auto" />
                </button>
              )
            })}
            <div className="border-t border-gray-100 dark:border-dark-border mt-2 pt-2">
              <button onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {section === 'profile' && (
            <Card>
              <CardTitle><User size={16} className="text-gold" /> Informations personnelles</CardTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prénom" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
                  <Input label="Nom" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
                </div>
                <Input label="Email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                <Input label="Téléphone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                <Select label="Profil" value={user?.profile || 'personal'} onChange={() => {}} options={[
                  { value: 'personal', label: 'Particulier' },
                  { value: 'freelance', label: 'Freelance / Entrepreneur' },
                  { value: 'business', label: 'PME' },
                  { value: 'enterprise', label: 'Grande entreprise' },
                ]} />

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Biographie</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Parlez de vous en quelques mots... votre activité, vos objectifs financiers, etc."
                    rows={3}
                    maxLength={250}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{profile.bio.length}/250</p>
                </div>

                {/* External Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Liens externes</label>
                    <button onClick={addLink}
                      className="flex items-center gap-1 text-xs text-gold hover:text-yellow-600 font-medium">
                      <Plus size={13} /> Ajouter un lien
                    </button>
                  </div>
                  <div className="space-y-2">
                    {links.map(link => {
                      const platform = PLATFORMS.find(p => p.id === link.platform) || PLATFORMS[5]
                      const PlatformIcon = platform.icon
                      return (
                        <div key={link.id} className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={link.platform}
                              onChange={e => updateLink(link.id, 'platform', e.target.value)}
                              className="appearance-none w-28 pl-7 pr-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
                            >
                              {PLATFORMS.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                              ))}
                            </select>
                            <PlatformIcon size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                          </div>
                          <input
                            type="url"
                            value={link.url}
                            onChange={e => updateLink(link.id, 'url', e.target.value)}
                            placeholder={platform.placeholder}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40"
                          />
                          <button onClick={() => removeLink(link.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave}><Check size={14} /> Enregistrer</Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardTitle><Bell size={16} className="text-gold" /> Préférences de notification</CardTitle>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Notifications par email', desc: 'Alertes et résumés par email' },
                  { key: 'push', label: 'Notifications push', desc: 'Sur mobile et navigateur' },
                  { key: 'weekly', label: 'Résumé hebdomadaire', desc: 'Bilan chaque lundi matin' },
                  { key: 'monthly', label: 'Rapport mensuel', desc: 'Analyse complète du mois' },
                  { key: 'alerts', label: 'Alertes de budget', desc: 'Quand un seuil est dépassé' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-gray-100 dark:border-dark-border rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifs[item.key as keyof typeof notifs]}
                      onChange={v => setNotifs({ ...notifs, [item.key]: v })}
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button onClick={handleSave}><Check size={14} /> Enregistrer</Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'security' && (
            <Card>
              <CardTitle><Shield size={16} className="text-gold" /> Sécurité du compte</CardTitle>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Shield size={14} />
                  Votre compte est sécurisé. Dernière connexion : aujourd'hui à 14h32
                </div>
                <Input label="Mot de passe actuel" type="password" placeholder="••••••••" />
                <Input label="Nouveau mot de passe" type="password" placeholder="8 caractères minimum" />
                <Input label="Confirmer le nouveau mot de passe" type="password" placeholder="Répétez le mot de passe" />
                <div className="p-3 border border-gray-100 dark:border-dark-border rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Authentification à deux facteurs</p>
                      <p className="text-xs text-gray-400">Sécurisez votre compte avec un code SMS</p>
                    </div>
                    <Toggle checked={false} onChange={() => toast('Bientôt disponible !')} />
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={handleSave}><Check size={14} /> Mettre à jour le mot de passe</Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'preferences' && (
            <Card>
              <CardTitle><Globe size={16} className="text-gold" /> Préférences d'affichage</CardTitle>
              <div className="space-y-4">
                <Select label="Devise principale" value={currency} onChange={e => setCurrency(e.target.value as any)} options={[
                  { value: 'XOF', label: 'FCFA — Franc CFA Ouest Africain' },
                  { value: 'USD', label: 'USD — Dollar américain' },
                  { value: 'EUR', label: 'EUR — Euro' },
                ]} />
                <Select label="Langue" value={lang} onChange={e => setLang(e.target.value as any)} options={[
                  { value: 'fr', label: '🇫🇷 Français' },
                  { value: 'en', label: '🇬🇧 English' },
                ]} />
                <Select label="Format de date" value="dmy" onChange={() => {}} options={[
                  { value: 'dmy', label: 'JJ/MM/AAAA (Français)' },
                  { value: 'mdy', label: 'MM/DD/YYYY (Américain)' },
                  { value: 'ymd', label: 'AAAA-MM-JJ (ISO)' },
                ]} />
                <div className="p-3 border border-gray-100 dark:border-dark-border rounded-xl">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Thème</p>
                  <div className="flex gap-2">
                    {[{ label: 'Clair', value: 'light' }, { label: 'Sombre', value: 'dark' }, { label: 'Système', value: 'system' }].map(t => (
                      <button key={t.value}
                        className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-dark-border text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all">
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={handleSave}><Check size={14} /> Enregistrer</Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'subscription' && (
            <Card>
              <CardTitle><CreditCard size={16} className="text-gold" /> Mon abonnement</CardTitle>
              <div className="p-4 bg-gradient-dark rounded-xl mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">Plan Starter</p>
                    <p className="text-white/60 text-xs">Essai gratuit · 11 jours restants</p>
                  </div>
                  <Badge variant="gold">Actif</Badge>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
                  <div className="bg-gold h-1.5 rounded-full" style={{ width: '21%' }} />
                </div>
                <p className="text-white/40 text-[10px] mt-1">3 jours utilisés / 14 jours</p>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: '2 comptes connectés', used: 1, total: 2 },
                  { label: '100 transactions / mois', used: 23, total: 100 },
                  { label: '2 coffres', used: 3, total: 2 },
                  { label: '3 alarmes', used: 4, total: 3 },
                ].map((limit, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{limit.label}</span>
                    <span className={cn('font-medium', limit.used > limit.total ? 'text-red-500' : 'text-gray-700 dark:text-gray-300')}>
                      {limit.used}/{limit.total}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
                Passer au Plan Pro — 7 500 FCFA/mois
              </Button>
              <p className="text-center text-xs text-gray-400 mt-2">
                Paiement via Wave · Orange Money · Carte bancaire
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
