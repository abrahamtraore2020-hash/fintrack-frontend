'use client'
import { useState, useEffect, useRef } from 'react'
import { User, Bell, Shield, Globe, CreditCard, LogOut, ChevronRight, Camera, Check, Plus, Trash2, Link2, Instagram, Twitter, Facebook, Youtube, Linkedin, AtSign, Loader2, ShieldCheck, ShieldOff, KeyRound, QrCode, Eye, EyeOff } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase, ensureSession } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useT } from '@/hooks/useT'
import toast from 'react-hot-toast'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/votrepseudo' },
  { id: 'twitter',   label: 'X / Twitter', icon: Twitter,   placeholder: 'https://x.com/votrepseudo' },
  { id: 'facebook',  label: 'Facebook',  icon: Facebook,  placeholder: 'https://facebook.com/votreprofil' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,  placeholder: 'https://linkedin.com/in/votrepseudo' },
  { id: 'youtube',   label: 'YouTube',   icon: Youtube,   placeholder: 'https://youtube.com/@votrechaine' },
  { id: 'other',     label: 'Autre lien', icon: Link2,    placeholder: 'https://votresite.com' },
]

export default function ParametresPage() {
  const { user, setUser, currency, lang, setCurrency, setLang } = useAppStore()
  const { signOut } = useAuth()
  const t = useT()
  const SECTIONS = [
    { id: 'profile',       label: t('settings_profile'),       icon: User },
    { id: 'notifications', label: t('settings_notifications'), icon: Bell },
    { id: 'security',      label: t('settings_security'),      icon: Shield },
    { id: 'preferences',   label: t('settings_preferences'),   icon: Globe },
    { id: 'subscription',  label: t('settings_subscription'),  icon: CreditCard },
  ]
  const [section, setSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
  })
  const [links, setLinks] = useState<{ id: string; platform: string; url: string }[]>([])
  const [notifs, setNotifs] = useState({ email: true, push: true, weekly: true, monthly: true, alerts: true })

  // Charger les données depuis Supabase à chaque fois que la page est montée
  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)
    supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || user.email || '',
          username: data.username || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          avatar: data.avatar || '',
        })
        setLinks(data.social_links || [])
        if (data.notif_settings) setNotifs(data.notif_settings)
      }
      setLoading(false)
    })
  }, [user?.id])

  const addLink = () => setLinks(p => [...p, { id: `l-${Date.now()}`, platform: 'other', url: '' }])
  const removeLink = (id: string) => setLinks(p => p.filter(l => l.id !== id))
  const updateLink = (id: string, field: string, val: string) =>
    setLinks(p => p.map(l => l.id === id ? { ...l, [field]: val } : l))

  // Redimensionne l'image et la convertit en base64 (stockage direct, pas de bucket)
  const resizeImageToBase64 = (file: File, maxSize = 256): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop grande (max 5 Mo)'); return }
    setAvatarUploading(true)
    try {
      const base64 = await resizeImageToBase64(file, 256)
      const { error } = await supabase.from('users').update({ avatar: base64 }).eq('id', user.id)
      if (error) throw error
      setProfile(p => ({ ...p, avatar: base64 }))
      setUser({ ...user, avatar: base64 })
      toast.success('Photo de profil mise à jour !')
    } catch (err: any) {
      toast.error(`Erreur photo : ${err.message || 'Vérifiez les droits Supabase'}`)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const { error } = await supabase.from('users').update({
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        phone: profile.phone || null,
        bio: profile.bio || null,
        location: profile.location || null,
        website: profile.website || null,
        username: profile.username ? profile.username.toLowerCase().replace(/[^a-z0-9_]/g, '') : null,
        social_links: links.filter(l => l.url).length > 0 ? links.filter(l => l.url) : null,
        notif_settings: notifs,
        currency,
        lang,
      }).eq('id', user.id)

      if (error) {
        console.error('handleSave rpc error:', error)
        toast.error(`Erreur : ${error.message}`)
        setSaving(false)
        return
      }

      setUser({ ...user, firstName: profile.firstName, lastName: profile.lastName, avatar: profile.avatar || user.avatar })
      toast.success('Profil enregistré !')
    } catch (err: any) {
      console.error('handleSave exception:', err)
      toast.error(`Erreur : ${err?.message || String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const initials = `${profile.firstName?.[0] || '?'}${profile.lastName?.[0] || ''}`.toUpperCase()

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-gold"/>
        </div>
      </AppLayout>
    )
  }

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
            <div className="flex flex-col items-center py-4 mb-2 border-b border-gray-100 dark:border-dark-border">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-400 flex items-center justify-center text-lg font-bold text-[#1A1A2E] overflow-hidden">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="" className="w-full h-full object-cover"/>
                    : <span>{initials}</span>
                  }
                </div>
                <button onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                  {avatarUploading ? <Loader2 size={8} className="animate-spin text-white"/> : <Camera size={10} className="text-[#1A1A2E]"/>}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{profile.firstName} {profile.lastName}</p>
              {profile.username && <p className="text-xs text-gold mt-0.5">@{profile.username}</p>}
              <Badge variant="gold" className="mt-1">{user?.plan === 'pro' ? 'Plan Pro' : 'Plan Starter'}</Badge>
            </div>
            {SECTIONS.map(s => {
              const Icon = s.icon
              return (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-0.5',
                    section === s.id ? 'bg-gold-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg')}>
                  <Icon size={14}/>
                  {s.label}
                  <ChevronRight size={12} className="ml-auto"/>
                </button>
              )
            })}
            <div className="border-t border-gray-100 dark:border-dark-border mt-2 pt-2">
              <button onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={14}/>
                Déconnexion
              </button>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {section === 'profile' && (
            <Card>
              <CardTitle><User size={16} className="text-gold"/> Informations personnelles</CardTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prénom" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })}/>
                  <Input label="Nom" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })}/>
                </div>
                <Input label="Email" type="email" value={profile.email} onChange={() => {}} disabled/>

                {/* Username */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom d'utilisateur</label>
                  <div className="relative">
                    <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                      value={profile.username}
                      onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      placeholder="monpseudo"
                      maxLength={30}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Lettres minuscules, chiffres et _ uniquement. Utilisé pour être trouvé par d'autres.</p>
                </div>

                <Input label="Téléphone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}/>
                <Input label="Localisation" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Dakar, Sénégal"/>
                <Input label="Site web" value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} placeholder="https://monsite.com"/>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Biographie</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Parlez de vous en quelques mots..."
                    rows={3}
                    maxLength={250}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">{profile.bio.length}/250</p>
                </div>

                {/* Liens sociaux */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Liens externes</label>
                    <button onClick={addLink} className="flex items-center gap-1 text-xs text-gold hover:text-yellow-600 font-medium">
                      <Plus size={13}/> Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {links.map(link => {
                      const platform = PLATFORMS.find(p => p.id === link.platform) || PLATFORMS[5]
                      const PlatformIcon = platform.icon
                      return (
                        <div key={link.id} className="flex items-center gap-2">
                          <div className="relative">
                            <select value={link.platform} onChange={e => updateLink(link.id, 'platform', e.target.value)}
                              className="appearance-none w-28 pl-7 pr-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer">
                              {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                            <PlatformIcon size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                          </div>
                          <input type="url" value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)}
                            placeholder={platform.placeholder}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40"/>
                          <button onClick={() => removeLink(link.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                    {saving ? t('saving') : t('save')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardTitle><Bell size={16} className="text-gold"/> Préférences de notification</CardTitle>
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
                    <Toggle checked={notifs[item.key as keyof typeof notifs]} onChange={v => setNotifs({ ...notifs, [item.key]: v })}/>
                  </div>
                ))}
                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                    {saving ? t('saving') : t('save')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'security' && (
            <Card>
              <CardTitle><Shield size={16} className="text-gold"/> Securite du compte</CardTitle>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Shield size={14}/>
                  Votre compte est securise.
                </div>
                <Input label="Nouveau mot de passe" type="password" placeholder="8 caracteres minimum"/>
                <Input label="Confirmer le nouveau mot de passe" type="password" placeholder="Repetez le mot de passe"/>
                <div className="p-3 border border-gray-100 dark:border-dark-border rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Authentification a deux facteurs</p>
                      <p className="text-xs text-gray-400">Bientot disponible</p>
                    </div>
                    <Toggle checked={false} onChange={() => toast('Bientot disponible !')}/>
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={() => toast('Bientot disponible')}>
                    <Check size={14}/> Mettre a jour le mot de passe
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'preferences' && (
            <Card>
              <CardTitle><Globe size={16} className="text-gold"/> {t('display_preferences')}</CardTitle>
              <div className="space-y-4">
                <Select label={t('currency')} value={currency} onChange={e => setCurrency(e.target.value as any)} options={[
                  // Afrique de l'Ouest
                  { value: 'XOF', label: 'XOF — Franc CFA (Afrique Ouest)' },
                  { value: 'XAF', label: 'XAF — Franc CFA (Afrique Centrale)' },
                  { value: 'GHS', label: 'GHS — Cedi Ghaneen' },
                  { value: 'NGN', label: 'NGN — Naira Nigerien' },
                  { value: 'GMD', label: 'GMD — Dalasi Gambien' },
                  { value: 'SLL', label: 'SLL — Leone Sierra-Leonais' },
                  { value: 'GNF', label: 'GNF — Franc Guineen' },
                  { value: 'CVE', label: 'CVE — Escudo Cap-Verdien' },
                  // Afrique de l'Est
                  { value: 'KES', label: 'KES — Shilling Kenyan' },
                  { value: 'TZS', label: 'TZS — Shilling Tanzanien' },
                  { value: 'UGX', label: 'UGX — Shilling Ougandais' },
                  { value: 'RWF', label: 'RWF — Franc Rwandais' },
                  { value: 'ETB', label: 'ETB — Birr Ethiopien' },
                  { value: 'BIF', label: 'BIF — Franc Burundais' },
                  { value: 'DJF', label: 'DJF — Franc Djiboutien' },
                  { value: 'ERN', label: 'ERN — Nakfa Erythreen' },
                  { value: 'SOS', label: 'SOS — Shilling Somalien' },
                  { value: 'KMF', label: 'KMF — Franc Comorien' },
                  { value: 'MGA', label: 'MGA — Ariary Malgache' },
                  { value: 'MUR', label: 'MUR — Roupie Mauricienne' },
                  { value: 'SCR', label: 'SCR — Roupie Seychelloise' },
                  // Afrique Centrale
                  { value: 'CDF', label: 'CDF — Franc Congolais' },
                  { value: 'AOA', label: 'AOA — Kwanza Angolais' },
                  { value: 'STN', label: 'STN — Dobra Sao-Tomeen' },
                  // Afrique Australe
                  { value: 'ZAR', label: 'ZAR — Rand Sud-Africain' },
                  { value: 'MZN', label: 'MZN — Metical Mozambicain' },
                  { value: 'ZMW', label: 'ZMW — Kwacha Zambien' },
                  { value: 'BWP', label: 'BWP — Pula Botswanais' },
                  { value: 'NAD', label: 'NAD — Dollar Namibien' },
                  { value: 'MWK', label: 'MWK — Kwacha Malawien' },
                  { value: 'ZWL', label: 'ZWL — Dollar Zimbabween' },
                  { value: 'SZL', label: 'SZL — Lilangeni Swazi' },
                  { value: 'LSL', label: 'LSL — Loti Lesothan' },
                  // Afrique du Nord
                  { value: 'EGP', label: 'EGP — Livre Egyptienne' },
                  { value: 'MAD', label: 'MAD — Dirham Marocain' },
                  { value: 'TND', label: 'TND — Dinar Tunisien' },
                  { value: 'DZD', label: 'DZD — Dinar Algerien' },
                  { value: 'LYD', label: 'LYD — Dinar Libyen' },
                  { value: 'SDG', label: 'SDG — Livre Soudanaise' },
                  { value: 'SSP', label: 'SSP — Livre Sud-Soudanaise' },
                  // Ameriques du Nord
                  { value: 'USD', label: 'USD — Dollar Americain' },
                  { value: 'CAD', label: 'CAD — Dollar Canadien' },
                  { value: 'MXN', label: 'MXN — Peso Mexicain' },
                  // Ameriques Centrale & Caraibes
                  { value: 'GTQ', label: 'GTQ — Quetzal Guatemalteque' },
                  { value: 'HNL', label: 'HNL — Lempira Hondurien' },
                  { value: 'NIO', label: 'NIO — Cordoba Nicaraguayen' },
                  { value: 'CRC', label: 'CRC — Colon Costaricain' },
                  { value: 'PAB', label: 'PAB — Balboa Panamen' },
                  { value: 'DOP', label: 'DOP — Peso Dominicain' },
                  { value: 'CUP', label: 'CUP — Peso Cubain' },
                  { value: 'HTG', label: 'HTG — Gourde Haitienne' },
                  { value: 'JMD', label: 'JMD — Dollar Jamaicain' },
                  { value: 'TTD', label: 'TTD — Dollar Trinidadien' },
                  { value: 'BBD', label: 'BBD — Dollar Barbadien' },
                  { value: 'XCD', label: 'XCD — Dollar Caraibes Est' },
                  { value: 'BZD', label: 'BZD — Dollar Belizeen' },
                  // Ameriques du Sud
                  { value: 'BRL', label: 'BRL — Real Bresilien' },
                  { value: 'ARS', label: 'ARS — Peso Argentin' },
                  { value: 'COP', label: 'COP — Peso Colombien' },
                  { value: 'CLP', label: 'CLP — Peso Chilien' },
                  { value: 'PEN', label: 'PEN — Sol Peruvien' },
                  { value: 'VES', label: 'VES — Bolivar Venezuelien' },
                  { value: 'BOB', label: 'BOB — Boliviano Bolivien' },
                  { value: 'PYG', label: 'PYG — Guarani Paraguayen' },
                  { value: 'UYU', label: 'UYU — Peso Uruguayen' },
                  { value: 'GYD', label: 'GYD — Dollar Guyanais' },
                  { value: 'SRD', label: 'SRD — Dollar Surinamien' },
                  // Europe
                  { value: 'EUR', label: 'EUR — Euro' },
                  { value: 'GBP', label: 'GBP — Livre Sterling' },
                  { value: 'CHF', label: 'CHF — Franc Suisse' },
                  { value: 'SEK', label: 'SEK — Couronne Suedoise' },
                  { value: 'NOK', label: 'NOK — Couronne Norvegienne' },
                  { value: 'DKK', label: 'DKK — Couronne Danoise' },
                  { value: 'ISK', label: 'ISK — Couronne Islandaise' },
                  { value: 'PLN', label: 'PLN — Zloty Polonais' },
                  { value: 'CZK', label: 'CZK — Couronne Tcheque' },
                  { value: 'HUF', label: 'HUF — Forint Hongrois' },
                  { value: 'RON', label: 'RON — Leu Roumain' },
                  { value: 'BGN', label: 'BGN — Lev Bulgare' },
                  { value: 'HRK', label: 'HRK — Kuna Croate' },
                  { value: 'RSD', label: 'RSD — Dinar Serbe' },
                  { value: 'MKD', label: 'MKD — Denar Macedonien' },
                  { value: 'ALL', label: 'ALL — Lek Albanais' },
                  { value: 'BAM', label: 'BAM — Mark Bosnien' },
                  { value: 'MDL', label: 'MDL — Leu Moldave' },
                  { value: 'TRY', label: 'TRY — Livre Turque' },
                  { value: 'RUB', label: 'RUB — Rouble Russe' },
                  { value: 'UAH', label: 'UAH — Hryvnia Ukrainienne' },
                  { value: 'BYN', label: 'BYN — Rouble Bielorusse' },
                  { value: 'GEL', label: 'GEL — Lari Georgien' },
                  { value: 'AMD', label: 'AMD — Dram Armenien' },
                  { value: 'AZN', label: 'AZN — Manat Azerbaidjanais' },
                  // Asie Centrale
                  { value: 'KZT', label: 'KZT — Tenge Kazakh' },
                  { value: 'KGS', label: 'KGS — Som Kirghiz' },
                  { value: 'TJS', label: 'TJS — Somoni Tadjik' },
                  { value: 'UZS', label: 'UZS — Som Ouzzbek' },
                  { value: 'TMT', label: 'TMT — Manat Turkmene' },
                  { value: 'AFN', label: 'AFN — Afghani' },
                  // Asie du Sud
                  { value: 'INR', label: 'INR — Roupie Indienne' },
                  { value: 'PKR', label: 'PKR — Roupie Pakistanaise' },
                  { value: 'BDT', label: 'BDT — Taka Bangladais' },
                  { value: 'LKR', label: 'LKR — Roupie Sri-Lankaise' },
                  { value: 'NPR', label: 'NPR — Roupie Nepalaise' },
                  { value: 'MVR', label: 'MVR — Rufiyaa Maldivien' },
                  { value: 'BTN', label: 'BTN — Ngultrum Bhoutanais' },
                  // Asie du Sud-Est
                  { value: 'IDR', label: 'IDR — Roupiah Indonesien' },
                  { value: 'SGD', label: 'SGD — Dollar Singapourien' },
                  { value: 'THB', label: 'THB — Baht Thailandais' },
                  { value: 'MYR', label: 'MYR — Ringgit Malaisien' },
                  { value: 'PHP', label: 'PHP — Peso Philippin' },
                  { value: 'VND', label: 'VND — Dong Vietnamien' },
                  { value: 'MMK', label: 'MMK — Kyat Birman' },
                  { value: 'KHR', label: 'KHR — Riel Cambodgien' },
                  { value: 'LAK', label: 'LAK — Kip Laotien' },
                  // Asie de l'Est
                  { value: 'CNY', label: 'CNY — Yuan Chinois' },
                  { value: 'JPY', label: 'JPY — Yen Japonais' },
                  { value: 'KRW', label: 'KRW — Won Sud-Coreen' },
                  { value: 'HKD', label: 'HKD — Dollar de Hong Kong' },
                  { value: 'TWD', label: 'TWD — Dollar Taiwanais' },
                  { value: 'MNT', label: 'MNT — Tugrik Mongol' },
                  // Moyen-Orient
                  { value: 'AED', label: 'AED — Dirham Emirien' },
                  { value: 'SAR', label: 'SAR — Riyal Saoudien' },
                  { value: 'QAR', label: 'QAR — Riyal Qatarien' },
                  { value: 'KWD', label: 'KWD — Dinar Koweitien' },
                  { value: 'BHD', label: 'BHD — Dinar Bahreinien' },
                  { value: 'OMR', label: 'OMR — Rial Omanais' },
                  { value: 'JOD', label: 'JOD — Dinar Jordanien' },
                  { value: 'IQD', label: 'IQD — Dinar Irakien' },
                  { value: 'IRR', label: 'IRR — Rial Iranien' },
                  { value: 'ILS', label: 'ILS — Shekel Israelien' },
                  { value: 'LBP', label: 'LBP — Livre Libanaise' },
                  { value: 'SYP', label: 'SYP — Livre Syrienne' },
                  { value: 'YER', label: 'YER — Riyal Yemenite' },
                  // Oceanie
                  { value: 'AUD', label: 'AUD — Dollar Australien' },
                  { value: 'NZD', label: 'NZD — Dollar Neo-Zelandais' },
                  { value: 'FJD', label: 'FJD — Dollar Fidjien' },
                  { value: 'PGK', label: 'PGK — Kina Papouasien' },
                  { value: 'SBD', label: 'SBD — Dollar Salomonais' },
                  { value: 'VUV', label: 'VUV — Vatu Vanuatuan' },
                  { value: 'WST', label: 'WST — Tala Samoan' },
                  { value: 'TOP', label: 'TOP — Paanga Tongien' },
                ]}/>
                <Select label={t('language')} value={lang} onChange={e => setLang(e.target.value as any)} options={[
                  // Afrique de l'Ouest
                  { value: 'fr', label: 'Francais' },
                  { value: 'ha', label: 'Haoussa' },
                  { value: 'yo', label: 'Yoruba' },
                  { value: 'ig', label: 'Igbo' },
                  { value: 'wo', label: 'Wolof' },
                  { value: 'bm', label: 'Bambara' },
                  { value: 'ff', label: 'Peul (Fulfulde)' },
                  { value: 'ln', label: 'Lingala' },
                  // Afrique de l'Est & Centrale
                  { value: 'sw', label: 'Swahili' },
                  { value: 'am', label: 'Amharique' },
                  { value: 'so', label: 'Somali' },
                  { value: 'rw', label: 'Kinyarwanda' },
                  { value: 'lg', label: 'Luganda' },
                  { value: 'ny', label: 'Chichewa' },
                  { value: 'mg', label: 'Malgache' },
                  // Afrique du Sud
                  { value: 'xh', label: 'Xhosa' },
                  { value: 'zu', label: 'Zoulou' },
                  { value: 'st', label: 'Sotho du Sud' },
                  { value: 'tn', label: 'Tswana' },
                  { value: 'sn', label: 'Shona' },
                  { value: 'nd', label: 'Ndebele' },
                  // Europe
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Espagnol' },
                  { value: 'pt', label: 'Portugais' },
                  { value: 'de', label: 'Allemand' },
                  { value: 'it', label: 'Italien' },
                  { value: 'nl', label: 'Neerlandais' },
                  { value: 'ru', label: 'Russe' },
                  { value: 'pl', label: 'Polonais' },
                  { value: 'uk', label: 'Ukrainien' },
                  { value: 'ro', label: 'Roumain' },
                  { value: 'hu', label: 'Hongrois' },
                  { value: 'cs', label: 'Tcheque' },
                  { value: 'sv', label: 'Suedois' },
                  { value: 'no', label: 'Norvegien' },
                  { value: 'da', label: 'Danois' },
                  { value: 'fi', label: 'Finnois' },
                  { value: 'el', label: 'Grec' },
                  // Asie & Moyen-Orient
                  { value: 'ar', label: 'Arabe' },
                  { value: 'tr', label: 'Turc' },
                  { value: 'he', label: 'Hebreu' },
                  { value: 'fa', label: 'Persan' },
                  { value: 'zh', label: 'Chinois (Mandarin)' },
                  { value: 'ja', label: 'Japonais' },
                  { value: 'ko', label: 'Coreen' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'bn', label: 'Bengali' },
                  { value: 'ur', label: 'Ourdou' },
                  { value: 'vi', label: 'Vietnamien' },
                  { value: 'th', label: 'Thailandais' },
                  { value: 'id', label: 'Indonesien' },
                  { value: 'ms', label: 'Malais' },
                  { value: 'tl', label: 'Filipino' },
                ]}/>
                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                    {saving ? t('saving') : t('save')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {section === 'subscription' && (
            <Card>
              <CardTitle><CreditCard size={16} className="text-gold"/> Mon abonnement</CardTitle>
              <div className="p-4 bg-gradient-dark rounded-xl mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">{user?.plan === 'pro' ? 'Plan Pro' : 'Plan Starter'}</p>
                    <p className="text-white/60 text-xs">Essai gratuit · 14 jours</p>
                  </div>
                  <Badge variant="gold">Actif</Badge>
                </div>
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

// ── SecuritySection ──────────────────────────────────────────────────────────────
function SecuritySection({ userId }: { userId: string }) {
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const [mfaStatus, setMfaStatus] = useState<'loading' | 'enabled' | 'disabled'>('loading')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [enrollStep, setEnrollStep] = useState<'idle' | 'qr' | 'verify'>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [enrollFactorId, setEnrollFactorId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [disabling, setDisabling] = useState(false)

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.[0]
      if (totp && totp.status === 'verified') {
        setMfaStatus('enabled'); setFactorId(totp.id)
      } else {
        setMfaStatus('disabled')
      }
    })
  }, [])

  const handleChangePwd = async () => {
    if (!newPwd || newPwd.length < 8) { toast.error('Minimum 8 caractères'); return }
    if (newPwd !== confirmPwd) { toast.error('Les mots de passe ne correspondent pas'); return }
    setSavingPwd(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      toast.success('Mot de passe mis à jour !')
      setNewPwd(''); setConfirmPwd('')
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du changement de mot de passe')
    } finally { setSavingPwd(false) }
  }

  const startEnroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'FinTrack', friendlyName: 'FinTrack Authenticator' })
    if (error || !data) { toast.error('Impossible de démarrer la configuration 2FA'); return }
    setQrCode(data.totp.qr_code); setSecret(data.totp.secret); setEnrollFactorId(data.id)
    setEnrollStep('qr')
  }

  const verifyEnroll = async () => {
    if (verifyCode.length !== 6) { toast.error('Code à 6 chiffres requis'); return }
    setVerifying(true)
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrollFactorId })
      if (cErr || !challenge) throw new Error('Erreur défi')
      const { error } = await supabase.auth.mfa.verify({ factorId: enrollFactorId, challengeId: challenge.id, code: verifyCode })
      if (error) throw new Error('Code incorrect')
      setMfaStatus('enabled'); setFactorId(enrollFactorId)
      setEnrollStep('idle'); setVerifyCode('')
      toast.success('Authentification à deux facteurs activée ! 🔒')
    } catch (e: any) {
      toast.error(e.message || 'Code incorrect ou expiré'); setVerifyCode('')
    } finally { setVerifying(false) }
  }

  const disableMfa = async () => {
    if (!factorId) return
    setDisabling(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setMfaStatus('disabled'); setFactorId(null)
      toast.success('2FA désactivé')
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la désactivation')
    } finally { setDisabling(false) }
  }

  return (
    <Card>
      <CardTitle><Shield size={16} className="text-gold"/> Sécurité du compte</CardTitle>
      <div className="space-y-5">

        {/* Mot de passe */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-white mb-3 flex items-center gap-2">
            <KeyRound size={14} className="text-gold"/> Changer le mot de passe
          </p>
          <div className="space-y-3">
            <div className="relative">
              <Input label="Nouveau mot de passe" type={showPwd ? 'text' : 'password'}
                placeholder="8 caractères minimum" value={newPwd} onChange={e => setNewPwd(e.target.value)}/>
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <Input label="Confirmer le mot de passe" type="password"
              placeholder="Répétez le mot de passe" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}/>
            <Button onClick={handleChangePwd} disabled={savingPwd || !newPwd}>
              {savingPwd ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
              {savingPwd ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-dark-border pt-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-white mb-1 flex items-center gap-2">
            <ShieldCheck size={14} className="text-gold"/> Authentification à deux facteurs (2FA)
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Ajoutez une couche de sécurité avec Google Authenticator, Authy, ou 1Password.
          </p>

          {mfaStatus === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin"/> Vérification…
            </div>
          )}

          {mfaStatus === 'enabled' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl">
                <ShieldCheck size={20} className="text-green-500 flex-shrink-0"/>
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">2FA activé ✓</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Votre compte est protégé par une application d'authentification.</p>
                </div>
              </div>
              <button onClick={disableMfa} disabled={disabling}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 dark:border-red-900/50 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50">
                {disabling ? <Loader2 size={14} className="animate-spin"/> : <ShieldOff size={14}/>}
                {disabling ? 'Désactivation...' : 'Désactiver le 2FA'}
              </button>
            </div>
          )}

          {mfaStatus === 'disabled' && enrollStep === 'idle' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl">
                <Shield size={20} className="text-gray-400 flex-shrink-0"/>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white">2FA non activé</p>
                  <p className="text-xs text-gray-400">Activez-le pour mieux protéger votre compte.</p>
                </div>
              </div>
              <button onClick={startEnroll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-white text-sm font-bold hover:bg-gold-dark transition-all">
                <ShieldCheck size={14}/> Activer le 2FA
              </button>
            </div>
          )}

          {mfaStatus === 'disabled' && enrollStep === 'qr' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-semibold">📱 Étape 1 — Scannez le QR code</p>
                <p>Ouvrez Google Authenticator, Authy ou 1Password et scannez le code ci-dessous.</p>
              </div>
              {qrCode && (
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48"/>
                  </div>
                </div>
              )}
              <div className="p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl">
                <p className="text-xs font-semibold text-gray-500 mb-1">Clé manuelle (si le QR ne fonctionne pas)</p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all select-all">{secret}</p>
              </div>
              <button onClick={() => setEnrollStep('verify')}
                className="w-full py-2.5 rounded-xl bg-gold text-white text-sm font-bold hover:bg-gold-dark transition-all">
                J'ai scanné le QR →
              </button>
              <button onClick={() => setEnrollStep('idle')} className="w-full text-xs text-gray-400 hover:underline">Annuler</button>
            </div>
          )}

          {mfaStatus === 'disabled' && enrollStep === 'verify' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <p className="font-semibold">🔢 Étape 2 — Entrez le code</p>
                <p className="mt-0.5">Saisissez le code à 6 chiffres affiché dans votre application.</p>
              </div>
              <input
                type="text" inputMode="numeric" maxLength={6} value={verifyCode} autoFocus
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && verifyEnroll()}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.5em] border-2 border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 bg-white dark:bg-dark-bg text-gray-800 dark:text-white focus:outline-none focus:border-gold transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={() => setEnrollStep('qr')}
                  className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-500 hover:bg-gray-50">← Retour</button>
                <button onClick={verifyEnroll} disabled={verifyCode.length !== 6 || verifying}
                  className="flex-1 py-2 rounded-xl bg-gold text-white text-sm font-bold hover:bg-gold-dark disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  {verifying ? <Loader2 size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
                  {verifying ? 'Vérification...' : 'Activer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
